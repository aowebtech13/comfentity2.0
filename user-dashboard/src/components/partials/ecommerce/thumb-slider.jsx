import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

// import required modules
import { FreeMode, Navigation, Thumbs } from "swiper/modules";

import useRtl from "@/hooks/useRtl";
import { getProductImage } from "@/constant/productImages";

const ThumbSliderCom = ({ product }) => {
  // Use the product's own image (set by the admin). If none is set, show a
  // neutral placeholder instead of bundled demo images.
  const image = getProductImage(product);

  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [isRtl] = useRtl();

  const slides = image ? [image] : [];

  return (
    <>
      <Swiper
        key={`${isRtl}-swiper`}
        dir={isRtl ? "rtl" : "ltr"}
        style={{
          "--swiper-navigation-color": "#fff",
          "--swiper-pagination-color": "#fff",
        }}
        loop={slides.length > 1}
        spaceBetween={10}
        navigation={false}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mySwiper2"
      >
        {slides.length > 0 ? (
          slides.map((src, i) => (
            <SwiperSlide
              key={i}
              className="h-[409px] w-[396px] py-11 px-14 bg-secondary-200 rounded-md"
            >
              <img
                className="h-full w-full object-contain transition-all duration-300 group-hover:scale-105"
                src={src}
                alt={product?.name || "."}
              />
            </SwiperSlide>
          ))
        ) : (
          <SwiperSlide className="h-[409px] w-[396px] py-11 px-14 bg-secondary-200 rounded-md flex items-center justify-center">
            <span className="text-slate-400 dark:text-slate-500 text-sm">
              No image available
            </span>
          </SwiperSlide>
        )}
      </Swiper>

      {slides.length > 1 && (
        <div className="flex mt-6 space-x-3 rtl:space-x-reverse">
          <Swiper
            onSwiper={setThumbsSwiper}
            loop={false}
            spaceBetween={10}
            slidesPerView={4}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[FreeMode, Navigation, Thumbs]}
            className="mySwiper"
          >
            {slides.map((src, j) => (
              <SwiperSlide
                key={`second_slider_${j}`}
                className="h-[90px] w-[90px] py-[14px] px-[17px] bg-secondary-200 rounded-sm"
              >
                <img
                  className="h-full w-full object-contain"
                  src={src}
                  alt="."
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </>
  );
};

export default ThumbSliderCom;

