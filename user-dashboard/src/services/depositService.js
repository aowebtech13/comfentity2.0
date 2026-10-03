import axiosInstance from "./axios";

const depositService = {
  /**
   * Deposit instructions: published wallet(s), network and limits.
   * Returns: { wallets: [{ id, label, symbol, network, address, qr_url,
   *                         confirmations_required, instructions }],
   *            min_amount, max_amount, currency }
   */
  getDepositInfo: async () => {
    const response = await axiosInstance.get("/deposit-info");
    return response.data;
  },

  /**
   * The authenticated user's deposit history (all statuses).
   */
  getDeposits: async () => {
    const response = await axiosInstance.get("/deposits");
    return response.data;
  },

  /**
   * Submit a manual crypto deposit proof. The balance is NOT credited here —
   * an administrator verifies the on-chain transaction and approves it.
   * Send FormData so the optional payment screenshot can be attached.
   */
  createDeposit: async (data) => {
    const response = await axiosInstance.post("/deposit", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

export default depositService;
