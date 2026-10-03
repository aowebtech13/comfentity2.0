<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Deposit Wallets
    |--------------------------------------------------------------------------
    |
    | Deposits are crypto-only and are settled manually by an administrator.
    | The user sends funds to one of the wallets below, then submits proof of
    | payment (amount, transaction hash and an optional screenshot) which is
    | reviewed in the admin panel.
    |
    | Addresses are overridable through .env so the wallet can be rotated
    | without a code change. Only the BTC network is live for now.
    |
    */

    'min_amount' => (float) env('DEPOSIT_MIN_AMOUNT', 10),

    'max_amount' => (float) env('DEPOSIT_MAX_AMOUNT', 100000),

    'wallets' => [

        'BTC' => [
            'label' => 'Bitcoin',
            'symbol' => 'BTC',
            // Which network the address lives on. "Bitcoin" = mainnet (bc1q...).
            'network' => 'Bitcoin',
            'address' => env('DEPOSIT_BTC_ADDRESS', 'bc1qxmg68chxgnd6zuzp0hzu6zll37p6jmmu84x7m8'),
            'qr_url' => 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=',
            'confirmations_required' => (int) env('DEPOSIT_BTC_CONFIRMATIONS', 1),
            'instructions' => 'Send only BTC (Bitcoin mainnet) to this address. After the transfer is confirmed on-chain, submit your transaction hash below. Funds are credited after an administrator verifies the deposit.',
        ],

    ],

];
