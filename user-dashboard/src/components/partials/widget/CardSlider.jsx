import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-cards";

// image import
import visaCardImage from "@/assets/images/all-img/visa-card-bg.png";
import visaCardImage2 from "@/assets/images/logo/visa.svg";

/**
 * Format a card number into masked groups: **** **** **** 3945
 */
const maskCardNumber = (accountNumber) => {
  if (!accountNumber) return "**** **** **** ****";
  const digits = String(accountNumber).replace(/\D/g, "");
  if (digits.length < 4) return digits.padStart(4, "*");
  const last4 = digits.slice(-4);
  return `**** **** **** ${last4}`;
};

/**
 * CardSlider — displays the user's bank cards.
 *
 * Accepts an optional `cards` prop. When not provided, falls back to
 * sample card data so the slider always renders something.
 *
 * Props:
 *   cards: Array<{
 *     bg: string,        // Tailwind gradient class
 *     cardNo: string,    // masked card number
 *     balance: string,   // formatted balance string
 *   }>
 */
const CardSlider = ({ cards }) => {
  const defaultCards = [
    {
      bg: "from-[#1EABEC] to-primary-500",
      cardNo: "****  ****  **** 3945",
      balance: "$1",
    },
    {
      bg: "from-[#4C33F7] to-[#801FE0]",
      cardNo: "****  ****  **** 3945",
      balance: "$1",
    },
    {
      bg: "from-[#FF9838] to-[#008773]",
      cardNo: "****  ****  **** 3945",
      balance: "$10",
    },
  ];

  const cardList = cards && cards.length > 0 ? cards : defaultCards;

  return (
    <div>
      <Swiper effect={"cards"} grabCursor={true} modules={[EffectCards]}>
        {cardList.map((item, i) => (
          <SwiperSlide key={i}>
            <div
              className={`${item.bg} h-[200px] bg-linear-to-r relative rounded-md z-1 p-4 text-white`}
            >
              <div className="overlay absolute left-0 top-0 h-full w-full -z-1">
                <img
                  src={visaCardImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <img src={visaCardImage2} alt="" />
              <div className="mt-[18px] font-semibold text-lg mb-[17px]">
                {item.cardNo}
              </div>
              <div className="text-xs text-opacity-75 mb-[2px]">
                Nexora balance
              </div>
              <div className="text-2xl font-semibold">{item.balance}</div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CardSlider;
