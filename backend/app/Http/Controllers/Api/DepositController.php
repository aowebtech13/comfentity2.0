<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

use Illuminate\Support\Facades\Http;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DepositController extends Controller
{
    public function index(Request $request)
    {
        $deposits = $request->user()->transactions()
            ->where('type', 'deposit')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($deposits);
    }

    /**
     * Deposit instructions shown on the dashboard.
     *
     * Deposits are crypto-only: the user copies the wallet address, sends
     * funds on-chain, then submits the transaction hash manually. Everything
     * the deposit page needs to render comes from config/deposit.php so the
     * wallet can be rotated from .env without a code change.
     */
    public function info()
    {
        $wallets = collect(config('deposit.wallets', []))
            ->filter(fn ($wallet) => !empty($wallet['address']))
            ->map(function ($wallet, $key) {
                return [
                    'id' => $key,
                    'label' => $wallet['label'] ?? $key,
                    'symbol' => $wallet['symbol'] ?? $key,
                    'network' => $wallet['network'] ?? $key,
                    'address' => $wallet['address'],
                    'qr_url' => ($wallet['qr_url'] ?? '') . rawurlencode($wallet['address']),
                    'confirmations_required' => $wallet['confirmations_required'] ?? 1,
                    'instructions' => $wallet['instructions'] ?? '',
                ];
            })
            ->values()
            ->all();

        return response()->json([
            'wallets' => $wallets,
            'min_amount' => (float) config('deposit.min_amount', 0),
            'max_amount' => (float) config('deposit.max_amount', 0),
            'currency' => 'USD',
        ]);
    }

    public function verifyPaystack(Request $request)
    {
        $request->validate([
            'reference' => 'required|string',
            'amount' => 'required|numeric|min:5000'
        ]);

        $reference = $request->reference;
        $amount = $request->amount;
        $secretKey = config('services.paystack.secret_key');

        if (!$secretKey) {
            Log::error("Paystack Secret Key is missing in configuration.");
            return response()->json(['message' => 'Payment provider configuration error'], 500);
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $secretKey,
                'Cache-Control' => 'no-cache',
            ])->timeout(20)->get(config('services.paystack.payment_url') . '/transaction/verify/' . $reference);

            if (!$response->successful()) {
                Log::warning("Paystack verification request failed for reference: {$reference}. Status: " . $response->status());
                return response()->json(['message' => 'Unable to verify payment with provider'], 400);
            }

            $data = $response->json();

            if (!isset($data['status']) || !$data['status'] || $data['data']['status'] !== 'success') {
                Log::warning("Invalid Paystack payment status for reference: {$reference}", $data);
                return response()->json(['message' => 'Payment was not successful or invalid'], 400);
            }

            // Verify the currency is NGN
            if ($data['data']['currency'] !== 'NGN') {
                Log::error("Paystack currency mismatch for reference: {$reference}. Expected NGN, got: " . $data['data']['currency']);
                return response()->json(['message' => 'Invalid payment currency'], 400);
            }

            return DB::transaction(function () use ($request, $reference, $amount, $data) {
                // Check if reference already exists to prevent duplicate processing (Lock for update)
                $existingTransaction = Transaction::where('reference', $reference)->lockForUpdate()->first();
                if ($existingTransaction) {
                    return response()->json(['message' => 'Transaction already processed'], 400);
                }

                // Verify the amount paid matches the expected amount (converted to kobo)
                $expectedAmountKobo = $amount * 100;
                $paidAmountKobo = $data['data']['amount'];

                // Allow for small discrepancy (less than 1 NGN) due to rounding
                if (abs($paidAmountKobo - $expectedAmountKobo) > 100) {
                    Log::error("Paystack amount mismatch for reference: {$reference}. Expected: {$expectedAmountKobo}, Paid: {$paidAmountKobo}");
                    return response()->json(['message' => 'Payment amount discrepancy detected'], 400);
                }

                $user = $request->user();

                $transaction = Transaction::create([
                    'user_id' => $user->id,
                    'type' => 'deposit',
                    'amount' => $amount,
                    'status' => 'completed',
                    'method' => 'Paystack',
                    'reference' => $reference,
                    'description' => 'Paystack deposit verified: ' . $reference,
                ]);

// Increment user balance
                $user->increment('balance', $amount);

                Log::info("Paystack deposit successful for User ID: {$user->id}, Amount: ₦{$amount}, Ref: {$reference}");

                return response()->json([
                    'message' => 'Payment verified and deposit successful',
                    'transaction' => $transaction,
                    'balance' => $user->fresh()->balance
                ]);
            });
        } catch (\Exception $e) {
            Log::error("Paystack Verification Exception: " . $e->getMessage(), [
                'reference' => $reference,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'An error occurred during payment verification'], 500);
        }
    }

    /**
     * Store a manually-submitted crypto deposit proof.
     *
     * The balance is NOT credited here: an administrator verifies the on-chain
     * transaction and approves the deposit from the admin panel, which is when
     * the balance is credited. See AdminController::updateDepositStatus().
     */
    public function store(Request $request)
    {
        $wallets = config('deposit.wallets', []);
        $min = (float) config('deposit.min_amount', 0);
        $max = (float) config('deposit.max_amount', 0);

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:' . $min, $max > 0 ? 'max:' . $max : 'nullable'],
            'crypto_network' => ['required', 'string', 'in:' . implode(',', array_keys($wallets))],
            'crypto_address' => ['required', 'string', 'max:191'],
            'crypto_tx_hash' => ['required', 'string', 'max:191'],
            'receipt' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'], // 2MB max
            'description' => ['nullable', 'string', 'max:1000'],
        ], [
            'amount.min' => 'The minimum deposit amount is $' . $min . '.',
            'crypto_network.in' => 'Unsupported deposit network.',
            'crypto_tx_hash.required' => 'Please provide the transaction hash of your payment.',
            'receipt.max' => 'The payment screenshot may not be larger than 2MB.',
        ]);

        $network = $validated['crypto_network'];
        $wallet = $wallets[$network] ?? null;

        // The user must have paid to the wallet we published, otherwise there
        // is nothing for an administrator to verify.
        if (($wallet['address'] ?? null) !== $validated['crypto_address']) {
            Log::warning("Deposit submitted to an unpublished address", [
                'user_id' => $request->user()->id,
                'submitted_address' => $validated['crypto_address'],
            ]);

            return response()->json([
                'message' => 'The deposit address does not match our published ' . $network . ' wallet. Please use the address shown on the deposit page.',
                'errors' => ['crypto_address' => ['The deposit address does not match the published wallet address.']],
            ], 422);
        }

        // A transaction hash can only ever be credited once. This is enforced
        // by a unique index too — the check exists purely to return a friendly
        // error instead of a 500 from the database.
        if (Transaction::where('crypto_tx_hash', $validated['crypto_tx_hash'])->exists()) {
            return response()->json([
                'message' => 'This transaction has already been submitted.',
                'errors' => ['crypto_tx_hash' => ['This transaction hash has already been submitted.']],
            ], 422);
        }

        $receiptPath = null;
        if ($request->hasFile('receipt')) {
            $receiptPath = $request->file('receipt')->store('receipts', 'public');
        }

        $transaction = Transaction::create([
            'user_id' => $request->user()->id,
            'type' => 'deposit',
            'amount' => $validated['amount'],
            'status' => 'pending',
            'method' => $network,
            'crypto_network' => $network,
            'crypto_address' => $validated['crypto_address'],
            'crypto_tx_hash' => $validated['crypto_tx_hash'],
            'reference' => 'DEP-' . strtoupper(Str::random(10)),
            'description' => $validated['description'] ?? null,
            'receipt_path' => $receiptPath,
        ]);

        Log::info("Crypto deposit proof submitted", [
            'user_id' => $request->user()->id,
            'transaction_id' => $transaction->id,
            'network' => $network,
            'tx_hash' => $validated['crypto_tx_hash'],
            'amount' => $validated['amount'],
        ]);

        return response()->json([
            'message' => 'Deposit proof submitted successfully. Your balance will be credited once an administrator verifies the payment.',
            'transaction' => $transaction,
        ], 201);
    }

    public function handleWebhook(Request $request)
    {
        $secretKey = config('services.paystack.secret_key');
        
        // Validate Paystack Signature
        if (!$request->header('x-paystack-signature') || $request->header('x-paystack-signature') !== hash_hmac('sha512', $request->getContent(), $secretKey)) {
            Log::warning("Invalid Paystack webhook signature.");
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        $event = $request->json()->all();

        if ($event['event'] === 'charge.success') {
            $data = $event['data'];
            $reference = $data['reference'];
            $paidAmountKobo = $data['amount'];
            $email = $data['customer']['email'];
            
            // Extract amount from Paystack (in kobo)
            $amount = $paidAmountKobo / 100;

            return DB::transaction(function () use ($reference, $amount, $email) {
                $existingTransaction = Transaction::where('reference', $reference)->lockForUpdate()->first();
                if ($existingTransaction) {
                    return response()->json(['message' => 'Processed'], 200);
                }

                $user = \App\Models\User::where('email', $email)->first();
                if (!$user) {
                    Log::error("User not found for Paystack webhook: {$email}");
                    return response()->json(['message' => 'User not found'], 404);
                }

                Transaction::create([
                    'user_id' => $user->id,
                    'type' => 'deposit',
                    'amount' => $amount,
                    'status' => 'completed',
                    'method' => 'Paystack',
                    'reference' => $reference,
                    'description' => 'Paystack deposit verified via Webhook: ' . $reference,
                ]);

$user->increment('balance', $amount);

                Log::info("Paystack deposit successful via Webhook for User ID: {$user->id}, Amount: ₦{$amount}, Ref: {$reference}");

                return response()->json(['message' => 'Success'], 200);
            });
        }

        return response()->json(['message' => 'Event ignored'], 200);
    }
}
