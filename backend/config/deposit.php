<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Deposit Wallets
    |--------------------------------------------------------------------------
    |
    | Deposits are crypto-only and are settled manually by an administrator.
    |
    | The flow is deliberately simple and identical for every network:
    |   1. The user copies one of the wallet addresses below (or its QR code).
    |   2. They make the payment from their own wallet or exchange — nothing is
    |      paid through this website.
    |   3. They come back to the dashboard and upload a screenshot of the
    |      completed payment, which a finance reviewer checks before approving.
    |
    | Addresses are overridable through .env so a wallet can be rotated without
    | a code change.
    |
    */

    'min_amount' => (float) env('DEPOSIT_MIN_AMOUNT', 10),

    'max_amount' => (float) env('DEPOSIT_MAX_AMOUNT', 100000),

    /*
    |--------------------------------------------------------------------------
    | Proof of Payment
    |--------------------------------------------------------------------------
    |
    | The uploaded screenshot is the proof of payment and is always required.
    |
    | The on-chain transaction hash is never required — asking for it only adds
    | friction, so it is accepted when the user happens to have it, which just
    | lets the reviewer cross-check the payment faster. It is stored per
    | deposit so the admin panel can open it in a block explorer.
    |
    | These apply to every wallet in the list below.
    |
    */

    'requires_receipt' => true,

    'requires_tx_hash' => false,

    'wallets' => [

        'BTC' => [
            'label' => 'Bitcoin',
            'symbol' => 'BTC',
            // Which network the address lives on. "Bitcoin" = mainnet (bc1q...).
            'network' => 'Bitcoin',
            'address' => env('DEPOSIT_BTC_ADDRESS', 'bc1qxmg68chxgnd6zuzp0hzu6zll37p6jmmu84x7m8'),
            'qr_url' => 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=',
            'confirmations_required' => (int) env('DEPOSIT_BTC_CONFIRMATIONS', 1),
            // Base URL the admin panel opens the submitted hash in; the hash is
            // appended to it. Leave empty to show the raw hash as plain text.
            'explorer_tx_url' => env('DEPOSIT_BTC_EXPLORER_TX_URL', 'https://blockchair.com/bitcoin/transaction/'),
            'instructions' => 'Send only BTC (Bitcoin mainnet) to this address from your own wallet or exchange. When the payment is sent, come back here and upload a screenshot of the completed payment. Funds are credited after an administrator verifies it.',
        ],

        'ETH' => [
            'label' => 'Ethereum',
            'symbol' => 'ETH',
            // Which network the address lives on. "Ethereum" = ERC-20 on mainnet.
            'network' => 'Ethereum',
            'address' => env('DEPOSIT_ETH_ADDRESS', '0xe95d25e5af5dD65349E84aB16513700C3641aA49'),
            'qr_url' => 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=',
            'confirmations_required' => (int) env('DEPOSIT_ETH_CONFIRMATIONS', 12),
            'explorer_tx_url' => env('DEPOSIT_ETH_EXPLORER_TX_URL', 'https://etherscan.io/tx/'),
            'instructions' => 'Send only ETH (Ethereum mainnet, ERC-20) to this address from your own wallet or exchange. When the payment is sent, come back here and upload a screenshot of the completed payment. Funds are credited after an administrator verifies it.',
        ],

    ],

];
