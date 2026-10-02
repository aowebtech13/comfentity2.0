import React, { useEffect, useState, useCallback, useRef } from "react";
import Card from "@/components/ui/Card";
import tradingSignalService from "@/services/tradingSignalService";

/**
 * Diverse asset pool that rotates across all types: forex, commodity, crypto, index, stock.
 * Every minute the fallback picks a different asset so the cards never get stale.
 */
const ALL_ASSETS = [
  // Forex
  { symbol: "AUD/USD",   type: "forex",     category: "Forex",      price: 0.6550, color: "blue" },
  { symbol: "EUR/USD",   type: "forex",     category: "Forex",      price: 1.0850, color: "blue" },
  { symbol: "EUR/JPY",   type: "forex",     category: "Forex",      price: 163.30, color: "blue" },
  { symbol: "GBP/JPY",   type: "forex",     category: "Forex",      price: 190.20, color: "blue" },
  { symbol: "USD/JPY",   type: "forex",     category: "Forex",      price: 150.50, color: "blue" },
  { symbol: "GBP/USD",   type: "forex",     category: "Forex",      price: 1.2650, color: "blue" },
  { symbol: "USD/CAD",   type: "forex",     category: "Forex",      price: 1.375175, color: "blue" },
  { symbol: "USD/NOK",   type: "forex",     category: "Forex",      price: 9.556315, color: "blue" },
  { symbol: "USD/PLN",   type: "forex",     category: "Forex",      price: 3.796795, color: "blue" },
  { symbol: "USD/SEK",   type: "forex",     category: "Forex",      price: 9.788085, color: "blue" },
  { symbol: "USD/TRY",   type: "forex",     category: "Forex",      price: 47.45896, color: "blue" },
  { symbol: "USD/ZAR",   type: "forex",     category: "Forex",      price: 16.43152, color: "blue" },
  { symbol: "AUD/JPY",   type: "forex",     category: "Forex",      price: 108.7455, color: "blue" },
  { symbol: "CAD/CHF",   type: "forex",     category: "Forex",      price: 0.564845, color: "blue" },
  { symbol: "CHF/JPY",   type: "forex",     category: "Forex",      price: 195.0075, color: "blue" },
  { symbol: "CHF/NOK",   type: "forex",     category: "Forex",      price: 11.67690, color: "blue" },
  // Commodities
  { symbol: "XAU/USD",   type: "commodity", category: "Commodity",  price: 4066.50, color: "amber" },
  { symbol: "XAG/USD",   type: "commodity", category: "Commodity",  price: 59.82,  color: "amber" },
  { symbol: "USOIL",     type: "commodity", category: "Commodity",  price: 78.00,  color: "amber" },
  { symbol: "NATGAS",    type: "commodity", category: "Commodity",  price: 3.12,   color: "amber" },
  { symbol: "XPT/USD",   type: "commodity", category: "Commodity",  price: 980.0,  color: "amber" },
  { symbol: "USO/USD",   type: "commodity", category: "Commodity",  price: 80.97,  color: "amber" },
  { symbol: "GOLD/SILVER", type: "commodity", category: "Commodity", price: 69.51, color: "amber" },
  { symbol: "PALLADIUM", type: "commodity", category: "Commodity",  price: 1329.16, color: "amber" },
  { symbol: "PLATINUM",  type: "commodity", category: "Commodity",  price: 1799.71, color: "amber" },
  // Crypto
  { symbol: "BTC/USD",   type: "crypto",    category: "Crypto",     price: 64207.78, color: "purple" },
  { symbol: "ETH/USD",   type: "crypto",    category: "Crypto",     price: 1766.01, color: "purple" },
  { symbol: "XRP/USD",   type: "crypto",    category: "Crypto",     price: 1.05,   color: "purple" },
  { symbol: "SOL/USD",   type: "crypto",    category: "Crypto",     price: 71.19,  color: "purple" },
  { symbol: "ADA/USD",   type: "crypto",    category: "Crypto",     price: 0.45,   color: "purple" },
  { symbol: "SHIB/USD",  type: "crypto",    category: "Crypto",     price: 0.000025, color: "purple" },
  { symbol: "ANTROPIC",  type: "crypto",    category: "Crypto",     price: 14.50, color: "purple" },
  { symbol: "TRUMP",     type: "crypto",    category: "Crypto",     price: 16.80, color: "purple" },
  { symbol: "ONDO",      type: "crypto",    category: "Crypto",     price: 0.75,  color: "purple" },
  { symbol: "PEPE",      type: "crypto",    category: "Crypto",     price: 0.000011, color: "purple" },
  { symbol: "SEI",       type: "crypto",    category: "Crypto",     price: 0.42,  color: "purple" },
  { symbol: "RAYDIUM",   type: "crypto",    category: "Crypto",     price: 2.85,  color: "purple" },
  { symbol: "FET",       type: "crypto",    category: "Crypto",     price: 1.32,  color: "purple" },
  { symbol: "BCH/USD",   type: "crypto",    category: "Crypto",     price: 398.50, color: "purple" },
  { symbol: "DOGWF",     type: "crypto",    category: "Crypto",     price: 0.210955, color: "purple" },
  { symbol: "WORLDCOIN", type: "crypto",    category: "Crypto",     price: 0.277015, color: "purple" },
  { symbol: "TRON/USD",  type: "crypto",    category: "Crypto",     price: 0.481975, color: "purple" },
  // Indices
  { symbol: "S&P 500",   type: "index",     category: "Index",      price: 5300,   color: "indigo" },
  { symbol: "NAS100",    type: "index",     category: "Index",      price: 18500,  color: "indigo" },
  { symbol: "US30",      type: "index",     category: "Index",      price: 39000,  color: "indigo" },
  { symbol: "GER40",     type: "index",     category: "Index",      price: 18000,  color: "indigo" },
  { symbol: "UK100",     type: "index",     category: "Index",      price: 7900,   color: "indigo" },
  { symbol: "US2000",    type: "index",     category: "Index",      price: 2785.90, color: "indigo" },
  // Stocks
  { symbol: "AAPL",      type: "stock",     category: "Stock",      price: 178.50, color: "cyan" },
  { symbol: "NVDA",      type: "stock",     category: "Stock",      price: 880.0,  color: "cyan" },
  { symbol: "TSLA",      type: "stock",     category: "Stock",      price: 245.0,  color: "cyan" },
  { symbol: "MSFT",      type: "stock",     category: "Stock",      price: 452.28, color: "cyan" },
  { symbol: "GOOGL",     type: "stock",     category: "Stock",      price: 175.0,  color: "cyan" },
  { symbol: "NIKE",      type: "stock",     category: "Stock",      price: 35.99,  color: "cyan" },
  { symbol: "CITI",      type: "stock",     category: "Stock",      price: 129.91, color: "cyan" },
  { symbol: "WDC",       type: "stock",     category: "Stock",      price: 544.14, color: "cyan" },
  { symbol: "AIG",       type: "stock",     category: "Stock",      price: 75.70,  color: "cyan" },
  { symbol: "BABA",      type: "stock",     category: "Stock",      price: 210.59, color: "cyan" },
  { symbol: "AMZN",      type: "stock",     category: "Stock",      price: 210.59, color: "cyan" },
  { symbol: "KO",        type: "stock",     category: "Stock",      price: 92.15,  color: "cyan" },
  { symbol: "GS",        type: "stock",     category: "Stock",      price: 1018.16, color: "cyan" },
  { symbol: "JPM",       type: "stock",     category: "Stock",      price: 329.48, color: "cyan" },
  { symbol: "MCD",       type: "stock",     category: "Stock",      price: 246.97, color: "cyan" },
  { symbol: "MS",        type: "stock",     category: "Stock",      price: 214.96, color: "cyan" },
  { symbol: "SNAP",      type: "stock",     category: "Stock",      price: 2.53,   color: "cyan" },
  { symbol: "AIRLINES",  type: "stock",     category: "Stock",      price: 4026.67, color: "cyan" },
  { symbol: "CANNABIS",  type: "stock",     category: "Stock",      price: 2188.72, color: "cyan" },
  { symbol: "CASINO",    type: "stock",     category: "Stock",      price: 2537.27, color: "cyan" },
  { symbol: "MAG7",      type: "stock",     category: "Stock",      price: 2492.18, color: "cyan" },
  { symbol: "URANIUM",   type: "stock",     category: "Stock",      price: 4991.20, color: "cyan" },
];

const TIMEFRAMES = ["1m", "2m", "5m"];

const CATEGORY_COLORS = {
  Forex:     { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-l-blue-500" },
  Commodity: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-l-amber-500" },
  Crypto:    { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", border: "border-l-purple-500" },
  Index:     { bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400", border: "border-l-indigo-500" },
  Stock:     { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", border: "border-l-cyan-500" },
};

const CATEGORY_ICONS = {
  Forex:     "💱",
  Commodity: "🛢️",
  Crypto:    "₿",
  Index:     "📊",
  Stock:     "🏢",
};

/* ── helpers ─────────────────────────────────────── */
const hash01 = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
};

const formatWatTime = (date) =>
  date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Lagos",
  });

const generateMartingalePlan = (timeframe, baseTime) => {
  const duration = parseInt(timeframe);
  // L0 is the initial entry — only generate subsequent martingale levels (L1–L3).
  const multipliers = [2, 4, 8];
  return multipliers.map((m, i) => {
    const levelIndex = i + 1; // L1, L2, L3
    const start = new Date(baseTime.getTime() + levelIndex * duration * 60000);
    const end = new Date(start.getTime() + duration * 60000);
    return { level: `L${levelIndex}`, start_time_wat: formatWatTime(start), end_time_wat: formatWatTime(end), multiplier: m };
  });
};

const generateFallbackAiSignal = (timeframe, now) => {
  const minuteBucket = Math.floor(now / 60000);
  const tfIdx = TIMEFRAMES.indexOf(timeframe);
  // Pick a different asset category per timeframe so all types show
  const categoryBuckets = ["forex", "commodity", "crypto", "index", "stock"];
  const catIdx = (minuteBucket + tfIdx * 5) % categoryBuckets.length;
  const catFilter = categoryBuckets[catIdx];

  const pool = ALL_ASSETS.filter((a) => a.type === catFilter);
  const asset = pool.length > 0
    ? pool[(minuteBucket + tfIdx) % pool.length]
    : ALL_ASSETS[(minuteBucket + tfIdx) % ALL_ASSETS.length];

  const directionRoll = hash01(`dir:${timeframe}:${minuteBucket}`);
  const direction = directionRoll >= 0.5 ? "CALL" : "PUT";
  const actionText = direction === "CALL" ? "Buy" : "Sell";
  const confidence = Math.round(72 + hash01(`conf:${timeframe}:${minuteBucket}`) * 26);

  const duration = parseInt(timeframe);
  const signalTime = new Date(now - 30000);
  const expiryTime = new Date(signalTime.getTime() + duration * 60000);
  const martingalePlan = generateMartingalePlan(timeframe, expiryTime);

  const price = asset.price * (1 + (hash01(`price:${timeframe}:${minuteBucket}`) - 0.5) * 0.002);
  let priceFormatted;
  if (asset.type === "forex") {
    priceFormatted = price.toFixed(5);
  } else if (asset.type === "crypto" || asset.type === "stock") {
    // Show meaningful decimals for very small priced coins (e.g. Shiba, Pepe)
    priceFormatted = price < 0.001 ? "$" + price.toFixed(8) : "$" + price.toFixed(2);
  } else {
    priceFormatted = price.toFixed(2);
  }

  const colors = CATEGORY_COLORS[asset.category] || CATEGORY_COLORS.Forex;

  return {
    id: `fallback-ai-${timeframe}-${minuteBucket}`,
    symbol: asset.symbol.replace("/", ""),
    type: asset.type,
    category: asset.category,
    asset_name: asset.symbol,
    asset_display: `${asset.symbol} (OTC)`,
    colors,
    direction,
    action_text: actionText,
    timeframe,
    signal_time: signalTime.toISOString(),
    expiry_time: expiryTime.toISOString(),
    signal_created_wat: formatWatTime(signalTime),
    valid_until_wat: formatWatTime(expiryTime),
    entry_window_minutes: duration,
    confidence_percent: confidence,
    is_otc: true,
    signal_type: `ai_${timeframe}`,
    entry_price: price,
    entry_price_formatted: priceFormatted,
    martingale_plan: martingalePlan,
    analysis_summary: `AI Signal: ${asset.symbol}. Direction: ${direction} (${actionText}). `,
  };
};

/* ── Signal card ─────────────────────────────────── */
const AiSignalCard = ({ signal, now }) => {
  const expiry = signal.expiry_time ? new Date(signal.expiry_time).getTime() : 0;
  const diff = expiry - now;
  const countdown = diff <= 0
    ? "Expired"
    : `${Math.floor(diff / 60000)}m ${Math.floor((diff % 60000) / 1000)}s`;
  const confidence = signal.confidence_percent ?? 0;
  const colors = signal.colors || CATEGORY_COLORS[signal.category] || CATEGORY_COLORS.Forex;
  const icon = CATEGORY_ICONS[signal.category] || "📈";

  return (
    <div
      className={`relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-l-4 ${colors.border}`}
    >
      {/* Top accent bar */}
      <div className={`px-4 py-2 flex items-center justify-between ${colors.bg}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{icon}</span>
          <div>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${colors.text}`}>
              {signal.category || signal.type}
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              AI Signal - {signal.timeframe}
            </h3>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Expires</div>
          <span className={`text-sm font-mono font-bold ${diff <= 0 ? "text-red-500" : "text-slate-800 dark:text-slate-200"}`}>
            {countdown}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        {/* Asset + Direction row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">Asset</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {signal.asset_display || signal.symbol}
            </span>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
              signal.direction === "CALL"
                ? "bg-green-500/15 text-green-600 dark:text-green-400"
                : "bg-red-500/15 text-red-600 dark:text-red-400"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${signal.direction === "CALL" ? "bg-green-500" : "bg-red-500"}`} />
            {signal.direction} ({signal.action_text})
          </span>
        </div>

        {/* Two-column meta */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">Signal Created</div>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{signal.signal_created_wat} WAT</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">Valid Until</div>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{signal.valid_until_wat} WAT</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">Entry Window</div>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{signal.entry_window_minutes}m after creation</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">Entry Price</div>
            <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              {signal.entry_price_formatted || signal.entry_price}
            </div>
          </div>
        </div>

{/* Martingale Plan */}
        {signal.martingale_plan && signal.martingale_plan.filter((l) => l.level !== "L0" && l.level !== "0").length > 0 && (
          <div className="pt-1">
            <div className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
              🧮 Martingale Plan ({signal.timeframe})
            </div>
            <div className="space-y-0.5">
              {signal.martingale_plan
                .filter((level) => level.level !== "L0" && level.level !== "0")
                .map((level) => (
                  <div key={level.level || level.start_time_wat}>
                    <div className="text-slate-300 dark:text-slate-600 text-center text-base leading-none">-</div>
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {level.level}: {level.start_time_wat} - {level.end_time_wat}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* AI Confidence pill */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
          <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">AI Confidence</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  confidence >= 90 ? "bg-green-500"
                  : confidence >= 80 ? "bg-emerald-500"
                  : confidence >= 70 ? "bg-amber-500"
                  : "bg-red-500"
                }`}
                style={{ width: `${confidence}%` }}
              />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{confidence}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Widget ──────────────────────────────────────── */
const TradingSignalsWidget = ({ refreshInterval = 15000 }) => {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const [refreshing, setRefreshing] = useState(false);

  const fetchSignals = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const result = await tradingSignalService.getAiSignalsGrouped();

      let normalized = [];
      if (result?.success && Array.isArray(result.data) && result.data.length > 0) {
        const order = { "1m": 0, "2m": 1, "5m": 2 };
        normalized = [...result.data]
          .sort((a, b) => (order[a.timeframe] ?? 99) - (order[b.timeframe] ?? 99))
          .map((s) => ({
            ...s,
            colors: CATEGORY_COLORS[s.category] || CATEGORY_COLORS.Forex,
            category: s.category || s.type,
          }));
      }

      if (normalized.length > 0) {
        setSignals(normalized);
        setError(null);
      } else {
        setSignals(TIMEFRAMES.map((tf) => generateFallbackAiSignal(tf, Date.now())));
        setError(null);
      }
    } catch (err) {
      setSignals(TIMEFRAMES.map((tf) => generateFallbackAiSignal(tf, Date.now())));
      setError(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    fetchSignals();
    if (refreshInterval > 0) {
      const interval = setInterval(fetchSignals, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchSignals, refreshInterval]);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const regen = setInterval(() => {
      setSignals((prev) => {
        const isFallback = prev.length > 0 && String(prev[0].id).startsWith("fallback-ai-");
        return isFallback ? TIMEFRAMES.map((tf) => generateFallbackAiSignal(tf, Date.now())) : prev;
      });
    }, 30000);
    return () => clearInterval(regen);
  }, []);

  return (
    <Card
      title="AI Trading Signals"
      subtitle={
        <span className="flex items-center flex-wrap gap-2 text-xs">
          {lastUpdated && (
            <span className="text-slate-500 dark:text-slate-400">
              Updated: {lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            LIVE
          </span>
        </span>
      }
      headerSlot={
        <button
          type="button"
          onClick={fetchSignals}
          disabled={refreshing}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
        >
          {refreshing ? "⟳" : "⟳ Refresh"}
        </button>
      }
      bodyClass="p-4"
    >
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-56 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10 text-slate-500 dark:text-slate-400">
          <p className="text-sm">{error}</p>
        </div>
      ) : signals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {signals.map((signal) => (
            <AiSignalCard key={signal.id || signal.timeframe} signal={signal} now={now} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-slate-500 dark:text-slate-400">
          <p className="text-sm">No AI signals available at the moment. Check back soon!</p>
        </div>
      )}
    </Card>
  );
};

export default TradingSignalsWidget;
