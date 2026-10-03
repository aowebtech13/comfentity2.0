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

    protected $appends = ['receipt_url'];

    public function getReceiptUrlAttribute()
    {
        return $this->receipt_path ? asset('storage/' . $this->receipt_path) : null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
