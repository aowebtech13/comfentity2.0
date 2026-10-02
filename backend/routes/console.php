<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

// Your existing inspiration command
Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule your investment command to run daily at midnight
Schedule::command('investments:process')->daily();

// Fetch standard market signals for the CRM dashboard only.
// --no-telegram ensures these dashboard signals are NEVER broadcast to the
// Telegram group, so only the AI trade-call batches below reach Telegram.
Schedule::command('signals:fetch --no-telegram')->everyFourHours();

// Schedule AI signal generation — generates a balanced batch of 2 fresh AI
// trades (one each of 1m, 2m) every 15 minutes.
// --force guarantees 2 brand-new signals are created every run (never skipped
// because of pre-existing active signals), and only those 2 are dispatched to
// Telegram.
// Trades take place at the TOP of every 15-minute interval. This job runs
// every 15 minutes so signals are generated and delivered 15 minutes
// before the trade actually starts.
//   4 batches/hour x 2 trades = 8 trade calls per hour.
Schedule::command('signals:fetch --ai --limit=2 --force')
    ->everyFifteenMinutes()
    ->timezone('Africa/Lagos')
    ->withoutOverlapping();

// Safety net: resend any AI trade-call signals that failed delivery in the
// scheduled batch. Runs every 15 minutes and is limited to AI signals only,
// so it never broadcasts dashboard signals. Because the fetch pipeline above
// already marks successful sends, this normally posts nothing new (0 messages)
// unless a delivery failed.
Schedule::command('signals:send-telegram')->everyFifteenMinutes()->withoutOverlapping();

// NOTE: signals:sync-telegram (grouped active-signal summary) is intentionally
// NOT scheduled here anymore. It used to post up to one summary message per
// asset type (5+) every 15 minutes ON TOP of the 4 trade-call batch above,
// flooding the group. Removing it keeps Telegram output at exactly 4 trade
// signals per hour.
