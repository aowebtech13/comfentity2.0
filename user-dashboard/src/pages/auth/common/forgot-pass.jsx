import React, { useState } from "react";
import Textinput from "@/components/ui/Textinput";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import authService from "@/services/authService";

const emailSchema = yup.object({
  email: yup.string().email("Invalid email").required("Email is Required"),
}).required();

const otpSchema = yup.object({
  otp: yup.string().required("OTP is Required").length(7, "OTP must be 7 digits"),
}).required();

const passwordSchema = yup.object({
  password: yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is Required"),
  password_confirmation: yup.string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
}).required();

const ForgotPass = () => {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState("");

  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const {
    register: emailRegister,
    handleSubmit: handleEmailSubmitForm,
    reset: emailReset,
    formState: { errors: emailErrors },
  } = useForm({
    resolver: yupResolver(emailSchema),
    mode: "all",
  });

  const {
    register: otpRegister,
    handleSubmit: handleOTPSubmitForm,
    getValues: otpGetValues,
    reset: otpReset,
    formState: { errors: otpErrors },
  } = useForm({
    resolver: yupResolver(otpSchema),
    mode: "all",
  });

  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmitForm,
    reset: passwordReset,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: yupResolver(passwordSchema),
    mode: "all",
  });

  const handleEmailSubmit = async (data) => {
    try {
      setIsSending(true);
      await authService.forgotPasswordOTP({ email: data.email });
      setEmail(data.email);
      setStep(2);
      toast.success("OTP sent to your email!");
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data?.errors?.email?.[0] || "Failed to send OTP";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleOTPSubmit = async (data) => {
    try {
      setIsVerifying(true);
      await authService.verifyOTP({ email, otp: data.otp });
      setStep(3);
      toast.success("OTP verified successfully!");
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data?.errors?.otp?.[0] || "Invalid OTP";
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasswordSubmit = async (data) => {
    try {
      setIsResetting(true);
      const otpValue = otpGetValues("otp");
      await authService.resetPasswordWithOTP({
        email,
        otp: otpValue,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      toast.success("Password reset successfully! You can now login.");
      setStep(1);
      emailReset();
      otpReset();
      passwordReset();
      // Redirect to login page after a brief delay
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data?.errors?.password?.[0] || "Failed to reset password";
      toast.error(message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div>
      {step === 1 && (
        <form onSubmit={handleEmailSubmitForm(handleEmailSubmit)} className="space-y-4">
          <Textinput
            name="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            register={emailRegister}
            error={emailErrors.email}
            className="h-[48px]"
          />
          <Button
            type="submit"
            text="Send Recovery OTP"
            className="btn btn-dark block w-full text-center"
            isLoading={isSending}
          />
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleOTPSubmitForm(handleOTPSubmit)} className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Enter the 7-digit OTP sent to <strong>{email}</strong>
          </p>
          <Textinput
            name="otp"
            label="OTP Code"
            type="text"
            placeholder="Enter 7-digit OTP"
            register={otpRegister}
            error={otpErrors.otp}
            className="h-[48px]"
          />
          <Button
            type="submit"
            text="Verify OTP"
            className="btn btn-dark block w-full text-center"
            isLoading={isVerifying}
          />
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-sm text-slate-500 dark:text-slate-400 hover:underline w-full text-center"
          >
            Change email
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handlePasswordSubmitForm(handlePasswordSubmit)} className="space-y-4">
          <Textinput
            name="password"
            label="New Password"
            type="password"
            placeholder="Enter new password"
            register={passwordRegister}
            error={passwordErrors.password}
            className="h-[48px]"
          />
          <Textinput
            name="password_confirmation"
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
            register={passwordRegister}
            error={passwordErrors.password_confirmation}
            className="h-[48px]"
          />
          <Button
            type="submit"
            text="Reset Password"
            className="btn btn-dark block w-full text-center"
            isLoading={isResetting}
          />
        </form>
      )}
    </div>
  );
};

export default ForgotPass;
