<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Deposits are crypto-only and settled manually by an administrator, so the
     * on-chain proof submitted by the user must be stored alongside the
     * transaction for the reviewer to verify.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('transactions', 'crypto_network')) {
                $table->string('crypto_network')->nullable()->after('method');
            }

            if (!Schema::hasColumn('transactions', 'crypto_address')) {
                $table->string('crypto_address')->nullable()->after('crypto_network');
            }

            if (!Schema::hasColumn('transactions', 'crypto_tx_hash')) {
                $table->string('crypto_tx_hash')->nullable()->after('crypto_address');
            }

            if (!Schema::hasColumn('transactions', 'review_note')) {
                $table->text('review_note')->nullable()->after('description');
            }

            // A crypto transaction hash is globally unique; only enforce it for
            // rows that actually carry one (legacy rows stay NULL).
            $table->unique('crypto_tx_hash', 'transactions_crypto_tx_hash_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropUnique('transactions_crypto_tx_hash_unique');

            foreach (['crypto_network', 'crypto_address', 'crypto_tx_hash', 'review_note'] as $column) {
                if (Schema::hasColumn('transactions', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
