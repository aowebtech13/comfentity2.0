import axiosInstance from "./axios";

const profileService = {
  getProfile: async () => {
    const response = await axiosInstance.get("/profile");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await axiosInstance.post("/profile", data);
    return response.data;
  },

  updateAvatar: async (file) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("name", user?.name || "");
    const response = await axiosInstance.post("/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updatePassword: async (data) => {
    const response = await axiosInstance.post("/profile/password", data);
    return response.data;
  },

  updateWithdrawalDetails: async (data) => {
    const response = await axiosInstance.post("/profile/withdrawal-details", data);
    return response.data;
  },

  getReferrals: async () => {
    const response = await axiosInstance.get("/profile/referrals");
    return response.data;
  },

  getDailyBonusStatus: async () => {
    const response = await axiosInstance.get("/daily-login-bonus/status");
    return response.data;
  },

  claimDailyLoginBonus: async () => {
    const response = await axiosInstance.post("/daily-login-bonus/claim");
    return response.data;
  },
};

export default profileService;
