<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Withdrawal;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class WithdrawalController extends Controller
{
    public function index()
    {
        return response()->json(Auth::user()->withdrawals()->latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
'amount' => 'required|numeric|min:5',
            'method' => 'required|string',
        ]);

        $user = Auth::user();

        // Ensure the user has saved withdrawal/bank details before allowing
        // a withdrawal request.
        if (!$user->bank_name || !$user->bank_account_holder || !$user->bank_account_number) {
            return response()->json([
                'message' => 'Please update your account withdrawal details before requesting a withdrawal.'
            ], 422);
        }

        if ($user->withdrawal_date && now()->lt($user->withdrawal_date)) {
            return response()->json([
                'message' => 'You are not eligible for withdrawal until ' . \Carbon\Carbon::parse($user->withdrawal_date)->format('M d, Y') . '.'
            ], 422);
        }

        if ($user->balance < $request->amount) {
            return response()->json(['message' => 'Insufficient balance.'], 422);
        }

        return DB::transaction(function () use ($user, $request) {
            // Deduct from balance immediately to "lock" the funds
            $user->decrement('balance', $request->amount);

            $withdrawal = Withdrawal::create([
                'user_id' => $user->id,
                'amount' => $request->amount,
                'method' => $request->method,
                'status' => 'pending',
                'details' => $request->details ?? null,
                // Snapshot the user's saved bank details so the admin
                // can review them even if the user changes them later.
'bank_name' => $user->bank_name,
                'bank_account_holder' => $user->bank_account_holder,
                'bank_account_number' => $user->bank_account_number,
                'account_type' => $user->account_type,
            ]);

            Transaction::create([
                'user_id' => $user->id,
                'type' => 'withdrawal_request',
                'amount' => -$request->amount,
                'status' => 'pending',
                'description' => "Withdrawal request via {$request->method}",
            ]);

            return response()->json([
                'message' => 'Withdrawal request submitted successfully.',
                'withdrawal' => $withdrawal,
                'user' => $user->fresh(),
            ]);
        });
    }

    public function downloadInvoice($id)
    {
        try {
            $withdrawal = Auth::user()->withdrawals()->findOrFail($id);

            $pdf = Pdf::loadView('withdrawals.invoice', [
                'withdrawal' => $withdrawal,
                'user' => Auth::user(),
            ]);

            return $pdf->download("withdrawal-invoice-{$withdrawal->id}.pdf");
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Withdrawal not found.'], 404);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Invoice generation failed: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            return response()->json(['message' => 'Unable to generate invoice. Please try again later.'], 500);
        }
    }
}
