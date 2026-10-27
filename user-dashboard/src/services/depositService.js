const depositService = {
  getDepositInfo: async () => ({
    wallets: [
      {
        id: "btc",
        label: "Bitcoin",
        symbol: "BTC",
        network: "BTC",
        address: "bc1qxmg68chxgnd6zuzp0hzu6zll37p6jmmu84x7m8",
        qr_url: "",
        confirmations_required: 1,
        explorer_tx_url: null,
        instructions: "Send BTC to this address only.",
      },
      {
        id: "eth",
        label: "Ethereum",
        symbol: "ETH",
        network: "ETH",
        address: "0xe95d25e5af5dD65349E84aB16513700C3641aA49",
        qr_url: "",
        confirmations_required: 1,
        explorer_tx_url: null,
        instructions: "Send ETH to this address only.",
      },
    ],
    requires_tx_hash: false,
    requires_receipt: true,
    min_amount: 0,
    max_amount: 0,
    currency: "USD",
  }),
  getDeposits: async () => [],
  createDeposit: async (data) => ({ message: "Submitted" }),
};

export default depositService;
