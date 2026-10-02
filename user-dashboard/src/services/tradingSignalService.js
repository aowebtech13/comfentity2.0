import axiosInstance from "./axios";

const tradingSignalService = {
  // Get active (currently valid) trading signals
  // Optional params: { type, symbol, action, direction, signal_type, otc, min_confidence, per_page, page }
  getSignals: async (params = {}) => {
    const response = await axiosInstance.get("/trading-signals", { params });
    return response.data;
  },

  // Get AI trading signals (1m, 5m, 15m timeframes)
  // Optional params: { timeframe, symbol, direction, otc, min_confidence, type, per_page, page }
  getAiSignals: async (params = {}) => {
    const response = await axiosInstance.get("/trading-signals/ai", { params });
    return response.data;
  },

  // Get a single trading signal by ID
  getSignalById: async (id) => {
    const response = await axiosInstance.get(`/trading-signals/${id}`);
    return response.data;
  },

  // Get available asset types + symbols for filtering
  getAssets: async () => {
    const response = await axiosInstance.get("/trading-assets");
    return response.data;
  },

// Get featured trading signals -- one latest active signal per asset type
  // (commodity, crypto, index, forex) for the CRM dashboard widget
  getFeaturedSignals: async () => {
    const response = await axiosInstance.get("/trading-signals/featured");
    return response.data;
  },

  // Get AI signals grouped by timeframe (1m, 2m, 5m) with martingale plans
  // and WAT-formatted times for the CRM dashboard
  getAiSignalsGrouped: async () => {
    const response = await axiosInstance.get("/trading-signals/ai/grouped");
    return response.data;
  },
};

export default tradingSignalService;
