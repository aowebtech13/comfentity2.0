import React, { useEffect, useRef } from "react";
import Card from "@/components/ui/Card";
import GroupChart3 from "../../components/partials/widget/chart/group-chart-3";
import SelectMonth from "@/components/partials/SelectMonth";
import Customer from "../../components/partials/widget/customer";
import HomeBredCurbs from "./HomeBredCurbs";
import TradingSignalsWidget from "@/components/partials/widget/TradingSignalsWidget";

const campaigns = [
  {
    name: "Trading Tips",
    value: "",
  },
  {
    name: "📌 AI Signal Strategy",
    value: "",
  },
  {
    name: "1m signals → Quick scalping, high frequency. Set tight stop-loss.",
    value: "⚡",
  },
  {
    name: "2m signals → Balanced risk/reward. Ideal for moderate momentum.",
    value: "⚖️",
  },
  {
    name: "5m signals → More stable, fewer false breakouts. Higher confidence.",
    value: "🎯",
  },
  {
    name: "Apply martingale levels (L0–L3) only if the first entry loses.",
    value: "🔄",
  },
  {
    name: "📌 Risk Management",
    value: "",
  },
  {
    name: "Risk no more than 1–2% of capital per trade.",
    value: "🛡️",
  },
  {
    name: "Use stop-loss on every trade. Martingale multiplies size — plan entries.",
    value: "⛔",
  },
  
  {
    name: "High volatility (news events) → shorter timeframes (1m–2m).",
    value: "📈",
  },
  
 
];

const CrmPage = () => {
  const marketDataRef = useRef(null);
  const overviewRef = useRef(null);
  const techAnalysisRef = useRef(null);

  useEffect(() => {
    // --- 1. Market Data widget ---
    const script1 = document.createElement("script");
    script1.src = "https://widgets.tradingview-widget.com/w/en/tv-market-data.js";
    script1.type = "module";
    script1.async = true;
    script1.onload = () => {
      if (marketDataRef.current) {
        marketDataRef.current.innerHTML = "";
        const el = document.createElement("tv-market-data");
        el.setAttribute(
          "symbol-sectors",
          JSON.stringify([
            {
              sectionName: "Indices",
              symbols: [
                "FOREXCOM:SPXUSD",
                "FOREXCOM:NSXUSD",
                "FOREXCOM:DJI",
                "INDEX:NKY",
                "INDEX:DEU40",
                "FOREXCOM:UKXGBP",
              ],
            },
            {
              sectionName: "Futures",
              symbols: [
                "BMFBOVESPA:ISP1!",
                "BMFBOVESPA:EUR1!",
                "CMCMARKETS:GOLD",
                "TVC:USOIL",
                "BMFBOVESPA:CCM1!",
              ],
            },
            { sectionName: "Bonds", symbols: ["EUREX:FGBL1!", "EUREX:FBTP1!", "EUREX:FGBM1!"] },
          ])
        );
        marketDataRef.current.appendChild(el);
      }
    };
    document.body.appendChild(script1);

    // --- 2. Market Overview widget ---
    const script2 = document.createElement("script");
    script2.src = "https://widgets.tradingview-widget.com/w/en/tv-market-overview.js";
    script2.type = "module";
    script2.async = true;
    script2.onload = () => {
      if (overviewRef.current) {
        overviewRef.current.innerHTML = "";
        const el = document.createElement("tv-market-overview");
        el.setAttribute(
          "symbol-sectors",
          JSON.stringify([
            {
              sectionName: "Indices",
              symbols: ["FOREXCOM:SPXUSD", "FOREXCOM:NSXUSD", "FOREXCOM:DJI", "FOREXCOM:UKXGBP"],
            },
            {
              sectionName: "Stocks",
              symbols: ["NASDAQ:AAPL", "NASDAQ:ADBE", "NASDAQ:NVDA", "NASDAQ:TSLA"],
            },
            {
              sectionName: "Crypto",
              symbols: ["BITSTAMP:BTCUSD", "BITSTAMP:ETHUSD", "CRYPTO:XRPUSD"],
            },
          ])
        );
        overviewRef.current.appendChild(el);
      }
    };
    document.body.appendChild(script2);

    // --- 3. Technical Analysis widget ---
    const script3 = document.createElement("script");
    script3.src = "https://widgets.tradingview-widget.com/w/en/tv-technical-analysis.js";
    script3.type = "module";
    script3.async = true;
    script3.onload = () => {
      if (techAnalysisRef.current) {
        techAnalysisRef.current.innerHTML = "";
        const el = document.createElement("tv-technical-analysis");
        el.setAttribute("symbol", "NASDAQ:AAPL");
        techAnalysisRef.current.appendChild(el);
      }
    };
    document.body.appendChild(script3);

    // Cleanup
    return () => {
      const scripts = [script1, script2, script3];
      scripts.forEach((s) => {
        if (document.body.contains(s)) document.body.removeChild(s);
      });
      [marketDataRef, overviewRef, techAnalysisRef].forEach((ref) => {
        if (ref.current) ref.current.innerHTML = "";
      });
    };
  }, []);

  return (
    <div>
      <HomeBredCurbs title="Crm" />
      <div className="space-y-5">
<div className="grid grid-cols-12 gap-5">
          {/* AI Trading Signals — full-width, fills the main section */}
          <div className="col-span-12">
            <TradingSignalsWidget />
          </div>

          <div className="lg:col-span-8 col-span-12 space-y-5">
            <Card title="Market Overview" bodyClass="p-0">
              <div
                ref={overviewRef}
                className="w-full overflow-hidden rounded-b-md"
                style={{ width: "100%" }}
              />
            </Card>
          </div>

          <div className="lg:col-span-4 col-span-12 space-y-5">
            <Card title="Trading Tips" headerSlot={<SelectMonth />}>
              <ul className="divide-y divide-slate-100 dark:divide-slate-700!">
                {campaigns.map((item, i) => (
                  <li
                    key={i}
                    className="first:text-xs text-sm first:text-slate-600 text-slate-600 dark:text-slate-300 py-2 first:uppercase"
                  >
                    <div className="flex justify-between">
                      <span>{item.name}</span>
                      <span>{item.value}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="xl:col-span-6 col-span-12">
            <Card title="Technical Analysis">
              <div ref={techAnalysisRef} className="w-full overflow-hidden rounded-b-md" />
            </Card>
          </div>

          <div className="xl:col-span-6 col-span-12">
            <Card title=" comfentity Top Traders" headerSlot={<SelectMonth />}>
              <Customer />
            </Card>
          </div>
        </div>

        <Card title="Market Data" bodyClass="p-0">
          <div ref={marketDataRef} className="w-full overflow-hidden rounded-b-md" />
        </Card>
      </div>
    </div>
  );
};

export default CrmPage;
