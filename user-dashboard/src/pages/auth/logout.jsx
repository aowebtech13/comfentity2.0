import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/store/authSlice";
import Loading from "@/components/Loading";

const Logout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loggedOut = useRef(false);

  useEffect(() => {
    if (loggedOut.current) return;
    loggedOut.current = true;

    const performLogout = async () => {
      await dispatch(logoutUser());
      navigate("/", { replace: true });
    };

    performLogout();
  }, [dispatch, navigate]);

  return <Loading />;
};

export default Logout;

