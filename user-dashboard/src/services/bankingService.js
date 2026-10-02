import axiosInstance from "./axios";

const bankingService = {
  /**
   * Get the authenticated user's profile.
   * Returns: { user: { id, name, username, email, phone, avatar, avatar_url,
   *                   balance, total_profit, total_invested,
   *                   bank_name, bank_account_holder, bank_account_number,
   *                   bank_routing_number, account_type, Nex_id, ... } }
   */
  getProfile: async () => {
    const response = await axiosInstance.get("/profile");
    return response.data;
  },

  /**
   * Get dashboard data: balance stats, recent transactions, active investments.
   * Returns: { stats: { balance, total_profit, total_invested,
   *                     active_investments_count, total_referral_earnings },
   *            recent_transactions: [...], active_investments: [...] }
   */
  getDashboardData: async () => {
    const response = await axiosInstance.get("/dashboard-data");
    return response.data;
  },

  /**
   * Get paginated transactions for the authenticated user.
   * Optional params: { search, type, page, per_page }
   * Returns: { transactions: { data: [...], meta: {...} }, stats: {...} }
   */
  getTransactions: async (params = {}) => {
    const response = await axiosInstance.get("/transactions", { params });
    return response.data;
  },

  /**
   * Get the user's referrals (for quick-transfer contact list).
   * Returns: { bonuses: [...], referred_users: [...], total_referral_earnings: ... }
   */
  getReferrals: async () => {
    const response = await axiosInstance.get("/profile/referrals");
    return response.data;
  },
};

export default bankingService;
