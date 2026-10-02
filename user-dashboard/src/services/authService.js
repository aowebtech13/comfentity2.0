import axiosInstance from "./axios";

const authService = {
  login: async (data) => {
    const response = await axiosInstance.post("/login", data);
    return response.data;
  },

register: async (data) => {
    const response = await axiosInstance.post("/register", data);
    return response.data;
  },

  verifyEmail: async (data) => {
    const response = await axiosInstance.post("/verify-email-code", data);
    return response.data;
  },

  resendVerificationCode: async (email) => {
    const response = await axiosInstance.post("/resend-verification-code", { email });
    return response.data;
  },

  forgotPasswordOTP: async (data) => {
    const response = await axiosInstance.post("/forgot-password-otp", data);
    return response.data;
  },

  verifyOTP: async (data) => {
    const response = await axiosInstance.post("/verify-otp", data);
    return response.data;
  },

  resetPasswordWithOTP: async (data) => {
    const response = await axiosInstance.post("/reset-password-with-otp", data);
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post("/logout");
    return response.data;
  },
};

export default authService;

