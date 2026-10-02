import React, { useState } from "react";
import { toast } from "react-toastify";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, useSearchParams } from "react-router-dom";
import Checkbox from "@/components/ui/Checkbox";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/authSlice";
import authService from "@/services/authService";

const schema = yup
  .object({
    fullname: yup.string().required("Full Name is Required"),
    username: yup
      .string()
      .required("Username is Required")
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must not exceed 50 characters")
      .matches(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and dashes"),
    email: yup.string().email("Invalid email").required("Email is Required"),
    phone: yup
      .string()
      .required("Phone number is Required")
      .min(10, "Phone number must be at least 10 digits"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password shouldn't be more than 20 characters")
      .required("Please enter password"),
    referral_code: yup.string().nullable(),
  })
  .required();

const RegForm = () => {
const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref") || "";

  const [checked, setChecked] = useState(false);
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      referral_code: refCode,
    },
  });

  const navigate = useNavigate();
const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await authService.register(data);

if (response.access_token) {
        dispatch(setUser(response));
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("token", response.access_token);
      }

reset();

      if (response.requires_email_verification) {
        toast.success(
          "Registration successful! Please verify your email to continue."
        );
        navigate("/verify-email", { state: { email: response.user?.email } });
      } else {
        toast.success("Registration successful! Welcome bonus credited.");
        navigate("/dashboard");
      }
    } catch (error) {
      const errorData = error?.response?.data;
      const message =
        errorData?.message ||
        Object.values(errorData?.errors || {}).flat()[0] ||
        "An error occurred. Please try again later.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 ">
      <Textinput
        name="fullname"
        label="Full Name"
        type="text"
        placeholder="Enter your full name"
        register={register}
        error={errors.fullname}
        className="h-[48px]"
      />
      <Textinput
        name="username"
        label="Username"
        type="text"
        placeholder="Enter your username"
        register={register}
        error={errors.username}
        className="h-[48px]"
      />
      <Textinput
        name="email"
        label="Email"
        type="email"
        placeholder="Enter your email"
        register={register}
        error={errors.email}
        className="h-[48px]"
      />
      <Textinput
        name="phone"
        label="Phone"
        type="text"
        placeholder="Enter your phone number"
        register={register}
        error={errors.phone}
        className="h-[48px]"
      />
      <Textinput
        name="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        register={register}
        error={errors.password}
        className="h-[48px]"
        hasicon
      />
      <Textinput
        name="referral_code"
        label="Referral Code (Optional)"
        type="text"
        placeholder="Enter referral code"
        register={register}
        error={errors.referral_code}
        className="h-[48px]"
      />
      <Checkbox
        label="You accept our Terms and Conditions and Privacy Policy"
        value={checked}
        onChange={() => setChecked(!checked)}
      />
      <Button
        type="submit"
        text="Create an account"
        className="btn btn-dark block w-full text-center"
        isLoading={isLoading}
      />
    </form>
  );
};

export default RegForm;
