import React from "react";
import { Link } from "react-router-dom";
import useDarkMode from "@/hooks/useDarkMode";

import MainLogo from "@/assets/images/logo/logo-c.png";
import LogoWhite from "@/assets/images/logo/logo-white.png";
const MobileLogo = () => {
  const [isDark] = useDarkMode();
  return (
    <Link to="/">
      <img src={isDark ? LogoWhite : MainLogo} height={20} width={80} alt="" />
    </Link>
  );
};

export default MobileLogo;
