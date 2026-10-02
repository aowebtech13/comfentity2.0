import React, { useState } from "react";
import Textinput from "@/components/ui/Textinput";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/authSlice";
import authService from "@/services/authService";
const schema = yup
  .object({
    email: yup.string().email("Invalid email").required("Email is Required"),
    password: yup.string().required("Password is Required"),
  })
  .required();
const LoginForm = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
resolver: yupResolver(schema),
    mode: "onSubmit",
  });
  const navigate = useNavigate();
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await authService.login(data);

      if (!response.access_token) {
        throw new Error("Invalid credentials");
      }

dispatch(setUser(response));
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.access_token);

      const isVerified = !!response.user?.email_verified_at;
      if (!isVerified) {
        navigate("/verify-email", { state: { email: response.user?.email } });
        toast.info("Please verify your email to continue.");
      } else {
        navigate("/banking");
        toast.success("Login Successful");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.email?.[0] ||
        error?.message ||
        "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const [checked, setChecked] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 ">
      <Textinput
        name="email"
        label="email"
        type="email"
        register={register}
        error={errors.email}
        className="h-[48px]"
      />
      <Textinput
        name="password"
        label="Password"
        type="password"
        register={register}
        error={errors.password}
        className="h-[48px]"
        hasicon
      />
      <div className="flex justify-between">
        <Checkbox
          value={checked}
          onChange={() => setChecked(!checked)}
          label="Keep me signed in"
        />
        <Link
          to="/forgot-password"
          className="text-sm text-slate-800 dark:text-slate-400 leading-6 font-medium"
        >
          Forgot Password?{" "}
        </Link>
      </div>

      <Button
        type="submit"
        text="Sign in"
        className="btn btn-dark block w-full text-center "
        isLoading={isLoading}
      />
    </form>
  );
};

export default LoginForm;
