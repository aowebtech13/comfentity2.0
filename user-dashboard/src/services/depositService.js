import axiosInstance from "./axios";

const depositService = {
  getDeposits: async () => {
    const response = await axiosInstance.get("/deposits");
    return response.data;
  },

  createDeposit: async (data) => {
    const response = await axiosInstance.post("/deposit", data);
    return response.data;
  },

  verifyPaystack: async (data) => {
    const response = await axiosInstance.post("/deposit/paystack/verify", data);
    return response.data;
  },
};

export default depositService;

