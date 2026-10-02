import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useDarkMode from "@/hooks/useDarkMode";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import authService from "@/services/authService";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "@/store/authSlice";

import LogoWhite from "@/assets/images/logo/logo-white.png";
import Logo from "@/assets/images/logo/logo-white.png";
import Illustration from "@/assets/images/auth/img.png";

const VerifyEmail = () => {
  const [isDark] = useDarkMode();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);

  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // Prefer the email passed via navigation state, then from the store.
    const navEmail = location.state?.email;
    const storeEmail = user?.email;
    const resolvedEmail = navEmail || storeEmail || "";
    if (resolvedEmail) setEmail(resolvedEmail);

    // Auto-resend a fresh verification code once on mount when an email is
    // known. This is especially important for legacy users who registered
    // before email verification was added — they never received a code, so
    // we proactively generate and email one instead of waiting for them to
    // press "Resend code".
    if (resolvedEmail) {
      const timer = setTimeout(() => {
        handleResend(resolvedEmail);
      }, 800);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email is required. Please log in and try again.");
      return;
    }
    if (code.length !== 6) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }
    try {
      setIsLoading(true);
      const response = await authService.verifyEmail({ email, code });
      // Update the stored user to reflect verified status.
      dispatch(updateUser({ email_verified_at: new Date().toISOString() }));
      toast.success(response.message || "Email verified successfully!");
      navigate("/dashboard");
    } catch (error) {
      const message =
        error?.response?.data?.errors?.code?.[0] ||
        error?.response?.data?.message ||
        "Verification failed. Please check your code and try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async (overrideEmail) => {
    const targetEmail = overrideEmail || email;
    if (!targetEmail) {
      toast.error("Email is required to resend the code.");
      return;
    }
    try {
      setIsResending(true);
      const response = await authService.resendVerificationCode(targetEmail);
      toast.success(response.message || "Verification code resent!");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Failed to resend code. Please try again.";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="loginwrapper">
      <div className="lg-inner-column">
        <div className="left-column relative z-1">
          <div className="max-w-[520px] pt-20 ltr:pl-20 rtl:pr-20">
            <Link to="/">
              <img src={isDark ? LogoWhite : Logo} alt="" className="mb-10" />
            </Link>

            <h4>
              Stocks ~ Commodities ~ Crypto ~ Indicies ~
              <span className="text-slate-800 dark:text-slate-400 font-bold">
                Trading
              </span>
            </h4>
          </div>
          <div className="absolute left-0 bottom-[-130px] h-full w-full z-[-1]">
            <img
              src={Illustration}
              alt=""
              className="h-full w-full object-contain"
            />
          </div>
        </div>
        <div className="right-column relative bg-white dark:bg-slate-800">
          <div className="inner-content h-full flex flex-col bg-white dark:bg-slate-800">
            <div className="auth-box h-full flex flex-col justify-center">
              <div className="mobile-logo text-center mb-6 lg:hidden block">
                <Link to="/">
                  <img
                    src={isDark ? LogoWhite : Logo}
                    alt=""
                    className="mx-auto"
                  />
                </Link>
              </div>
              <div className="text-center 2xl:mb-10 mb-5">
                <h4 className="font-medium">Verify your email</h4>
                <div className="text-slate-500 dark:text-slate-400 text-base">
                  Enter the 6-digit code sent to your email to continue
                </div>
              </div>

<form onSubmit={handleVerify} className="space-y-5">
                <div className="text-center">
                  <label className="block capitalize form-label">
                    Email
                  </label>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    {email || "Your registered email"}
                  </p>
                </div>
                <Textinput
                  label="Verification Code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  className="h-[48px]"
                />

                <Button
                  type="submit"
                  text="Verify Email"
                  className="btn btn-dark block w-full text-center"
                  isLoading={isLoading}
                />

                <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-slate-900 dark:text-white font-medium hover:underline"
                  >
                    {isResending ? "Resending..." : "Resend code"}
                  </button>
                </div>
              </form>

              <div className="max-w-[215px] mx-auto font-normal text-slate-500 dark:text-slate-400 2xl:mt-10 mt-6 uppercase text-sm">
                <Link
                  to="/"
                  className="text-slate-900 dark:text-white font-medium hover:underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
            <div className="auth-footer text-center">
              Copyright 2026, Nexora All Rights Reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
