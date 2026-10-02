import React, { useEffect, useRef, memo } from "react";

const TradingViewWidget = ({
  widgetType = "financials",
  symbol = "NASDAQ:AAPL",
  symbolSectors = [],
  colorTheme = "light",
  displayMode = "regular",
  isTransparent = false,
  locale = "en",
  width = "100%",
  height = "550",
  backgroundColor = "#ffffff",
  widgetFontColor = "#0F0F0F",
  upColor = "#22ab94",
  downColor = "#f7525f",
  volumeUpColor = "#22ab94",
  volumeDownColor = "#f7525f",
  borderUpColor = "#22ab94",
  borderDownColor = "#f7525f",
  wickUpColor = "#22ab94",
  wickDownColor = "#f7525f",
  chartType = "area",
  lineWidth = 2,
  lineType = 0,
  chartOnly = false,
  scalePosition = "right",
  scaleMode = "Normal",
  fontFamily = "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
  fontSize = "10",
  headerFontSize = "medium",
  autosize = true,
  noTimeScale = false,
  hideDateRanges = false,
  hideMarketStatus = false,
  hideSymbolLogo = false,
  dateRanges = ["1d|1", "1m|30", "3m|60", "12m|1D", "60m|1W", "all|1M"],
  symbols = [],
  copyrightText = null,
  linkText = null,
  mode = "market-movers",
  showChart = true,
  showFloatingTooltip = true,
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = "";

    // Market Overview uses a module script that registers the <tv-market-overview> custom element.
    // React won't execute <script> tags rendered in JSX, so we load it dynamically and append
    // the custom element once the module has loaded (mirrors crm.jsx working pattern).
    if (widgetType === "market-overview") {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://widgets.tradingview-widget.com/w/en/tv-market-overview.js";
      script.async = true;
      script.onload = () => {
        if (!containerRef.current) return;
        containerRef.current.innerHTML = "";
        const el = document.createElement("tv-market-overview");
        el.setAttribute("mode", mode);
        el.setAttribute("color-theme", colorTheme);
        if (locale) el.setAttribute("locale", locale);
        if (symbolSectors && symbolSectors.length > 0) {
          el.setAttribute("symbol-sectors", JSON.stringify(symbolSectors));
        }
        el.setAttribute("show-chart", String(showChart));
        el.setAttribute("show-floating-tooltip", String(showFloatingTooltip));
        if (width) el.setAttribute("width", width);
        if (height) el.setAttribute("height", height);
        containerRef.current.appendChild(el);
      };
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) document.body.removeChild(script);
        if (containerRef.current) containerRef.current.innerHTML = "";
      };
    }

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      widgetType === "financials"
        ? "https://s3.tradingview.com/external-embedding/embed-widget-financials.js"
        : "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
    script.async = true;

    const config =
      widgetType === "financials"
        ? {
            symbol,
            colorTheme,
            displayMode,
            isTransparent,
            locale,
            width,
            height,
          }
        : {
            colorTheme,
            isTransparent,
            locale,
            chartType,
            lineWidth,
            lineType,
            fontColor: widgetFontColor,
            gridLineColor: "rgba(46, 46, 46, 0.06)",
            volumeUpColor,
            volumeDownColor,
            backgroundColor,
            widgetFontColor,
            upColor,
            downColor,
            borderUpColor,
            borderDownColor,
            wickUpColor,
            wickDownColor,
            chartOnly,
            scalePosition,
            scaleMode,
            fontFamily,
            fontSize,
            headerFontSize,
            autosize,
            width,
            height,
            noTimeScale,
            hideDateRanges,
            hideMarketStatus,
            hideSymbolLogo,
            symbols,
            dateRanges,
          };

    script.innerHTML = JSON.stringify(config);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [widgetType, symbol, symbolSectors, mode, showChart, showFloatingTooltip, colorTheme, locale, width, height]);

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget" />
      <div className="tradingview-widget-copyright">
        <a
          href={
            widgetType === "financials"
              ? `https://www.tradingview.com/symbols/${symbol.replace(":", "-")}/financials-overview/`
              : "https://www.tradingview.com/markets/"
          }
          rel="noopener nofollow"
          target="_blank"
        >
          <span className="blue-text">
            {widgetType === "financials"
              ? `${symbol.split(":")[1]} fundamentals`
              : "World markets"}
          </span>
        </a>
        <span className="trademark"> by TradingView</span>
      </div>
    </div>
  );
};

export default memo(TradingViewWidget);
