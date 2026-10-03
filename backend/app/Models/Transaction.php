<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'status',
        'method',
        'reference',
        'description',
        'receipt_path',
        // Crypto-only deposits: on-chain proof submitted for manual review.
        'crypto_network',
        'crypto_address',
        'crypto_tx_hash',
        'review_note',
    ];

    protected $appends = ['receipt_url', 'crypto_explorer_tx_url'];

    public function getReceiptUrlAttribute()
    {
        return $this->receipt_path ? asset('storage/' . $this->receipt_path) : null;
    }

    /**
     * Block explorer link for the submitted transaction hash.
     *
     * The base URL is configured per wallet in config/deposit.php, so adding a
     * network only needs a config entry rather than a change here. Returns null
     * when no hash was submitted or the network has no explorer configured,
     * which lets the callers fall back to showing the raw hash.
     */
    public function getCryptoExplorerTxUrlAttribute()
    {
        if (empty($this->crypto_tx_hash)) {
            return null;
        }

        $base = config('deposit.wallets.' . $this->crypto_network . '.explorer_tx_url');

        return $base ? $base . urlencode($this->crypto_tx_hash) : null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
