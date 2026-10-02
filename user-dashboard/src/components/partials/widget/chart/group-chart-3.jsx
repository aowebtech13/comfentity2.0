import React from "react";
import Icon from "@/components/ui/Icon";

import shade1 from "@/assets/images/all-img/shade-1.png";
import shade2 from "@/assets/images/all-img/shade-2.png";
import shade3 from "@/assets/images/all-img/shade-3.png";
import shade4 from "@/assets/images/all-img/shade-4.png";
const statistics = [
  {
    title: "Commodities pair",
    count: "354",
    bg: "bg-warning-500/15",
    text: "text-primary-500",
    percent: "25.67% ",
    icon: "heroicons:arrow-trending-up",
    img: shade1,
    percentClass: "text-primary-500",
  },
  {
    title: "Crypto pair",
    count: "$86,954",

    bg: "bg-info-500/15",
    text: "text-primary-500",
    percent: "8.67%",
    icon: "heroicons:arrow-trending-up",
    img: shade2,
    percentClass: "text-primary-500",
  },
  {
    title: "indicies Pair",
    count: "15%",
    bg: "bg-primary-500/15",
    text: "text-danger-500",
    percent: "1.67%  ",
    icon: "heroicons:arrow-trending-down",
    img: shade3,
    percentClass: "text-danger-500",
  },
  {
    title: "Forex Pair",
    count: "654",
    bg: "bg-success-500/15",
    text: "text-primary-500",
    percent: "11.67%  ",
    icon: "heroicons:arrow-trending-up",
    img: shade4,
    percentClass: "text-primary-500",
  },
];
const GroupChart3 = () => {
  
};

export default GroupChart3;
