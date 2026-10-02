import axiosInstance from "./axios";

const withdrawalService = {
  getWithdrawals: async () => {
    const response = await axiosInstance.get("/withdrawals");
    return response.data;
  },

  createWithdrawal: async (data) => {
    const response = await axiosInstance.post("/withdraw", data);
    return response.data;
  },

  downloadInvoice: async (id) => {
    const response = await axiosInstance.get(`/withdrawals/${id}/invoice`, {
      responseType: "blob",
      headers: {
        Accept: "application/pdf",
      },
    });
    return response.data;
  },
};

export default withdrawalService;

