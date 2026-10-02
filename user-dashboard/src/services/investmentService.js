import axiosInstance from "./axios";

const investmentService = {
  getDashboardData: async () => {
    const response = await axiosInstance.get("/dashboard-data");
    return response.data;
  },

  getInvestments: async () => {
    const response = await axiosInstance.get("/investments");
    return response.data;
  },

  getTransactions: async () => {
    const response = await axiosInstance.get("/transactions");
    return response.data;
  },

  invest: async (data) => {
    const response = await axiosInstance.post("/invest", data);
    return response.data;
  },

  cancelInvestment: async (id) => {
    const response = await axiosInstance.post(`/investments/${id}/cancel`);
    return response.data;
  },
};

export default investmentService;

