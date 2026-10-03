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
    | without a code change.
    |
    | Each wallet also declares what proof the user has to provide, because the
    | networks differ:
    |   requires_tx_hash  - true  => the on-chain transaction hash is mandatory
    |                      - false => the hash is optional (receipt is the proof)
    |   requires_receipt  - true  => a payment screenshot is mandatory
    |   explorer_tx_url   - base URL an admin uses to open the hash in a block
    |                      explorer; the hash is appended to it.
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
            'explorer_tx_url' => env('DEPOSIT_BTC_EXPLORER_TX_URL', 'https://blockchair.com/bitcoin/transaction/'),
            // A BTC deposit is proven on-chain, so the hash is the proof.
            'requires_tx_hash' => true,
            'requires_receipt' => false,
            'instructions' => 'Send only BTC (Bitcoin mainnet) to this address. After the transfer is confirmed on-chain, submit your transaction hash below. Funds are credited after an administrator verifies the deposit.',
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
            // ETH deposits are verified from the uploaded payment receipt, so the
            // transaction hash is optional and the screenshot is mandatory.
            'requires_tx_hash' => (bool) env('DEPOSIT_ETH_REQUIRES_TX_HASH', false),
            'requires_receipt' => (bool) env('DEPOSIT_ETH_REQUIRES_RECEIPT', true),
            'instructions' => 'Send only ETH (Ethereum mainnet, ERC-20) to this address. Upload a screenshot of the completed payment below so our finance team can verify it. Funds are credited after an administrator approves the deposit.',
        ],

    ],

];
