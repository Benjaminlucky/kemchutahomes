import React from "react";
import { heroData } from "../../../data";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import "./hero.css";

function Hero() {
  // Framer Motion variants
  const scaleIn = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.8 } },
  };

  return (
    <motion.div
      className="hero__wrapper w-full"
      variants={scaleIn}
      initial="hidden"
      animate="visible"
    >
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        effect="fade"
        loop
        className="hero__content"
      >
        {heroData.map((data, index) => (
          <SwiperSlide key={index}>
            <div className="heroDataWrapper relative">
              <motion.img
                src={data.img}
                alt=""
                className="w-full h-[734px] object-cover"
                variants={scaleIn}
                initial="hidden"
                animate="visible"
              />
              <motion.div
                className="bottomcontent absolute bottom-0 flex bg-customBlack-800 w-full h-[120px] text-white text-center"
                variants={scaleIn}
                initial="hidden"
                animate="visible"
              >
                <div className="bottom__content w-10/12 mx-auto hidden md:flex justify-between items-center">
                  <div className="logo">
                    <img
                      src={data.estateLogo}
                      className={`w-[100px] md:w-[200px] object-cover itm-center ${
                        index === 2 ? "!w-[90px]" : ""
                      }`}
                      alt={`${data.estateName} 'Logo`}
                    />
                  </div>
                  <div className="size__plot text-left">
                    <div className="plot text-customBlack-300 text-xl">
                      {data.type}
                    </div>
                    <div className="size text-2xl font-bold">{data.plot}</div>
                  </div>
                  <div className="price__payment text-left">
                    <div className="price text-5xl font-bold">{data.price}</div>
                    <div className="payment text-xl">{data.payment}</div>
                  </div>
                  <div className="subscribe">
                    <Link
                      to={data.link}
                      className="subscribe__link text-2xl uppercase font-bold bg-customPurple-500 text-white px-5 py-3 rounded-sm hover:bg-customPurple-400"
                    >
                      Subscribe now
                    </Link>
                  </div>
                </div>
                <div className="bottom__mobileContent w-10/12 py-3 mx-auto flex flex-col md:hidden justify-between items-center gap-3">
                  <div className="logo__details flex justify-center items-center w-full mt-5 gap-3">
                    <div className="logo">
                      <img
                        src={data.estateLogo}
                        className={`w-[150px] md:w-[200px] object-contain md:object-cover itm-center transform !translate-y-2/2 ${
                          index === 2 ? "!w-[80px]" : ""
                        }`}
                        alt={`${data.estateName} 'Logo`}
                      />
                    </div>
                    <div className="size__plot text-left">
                      <Link
                        to={data.link}
                        className="bg-customPurple-500 uppercase font-bold w-full px-3 py-2 text-cent rounded-sm"
                      >
                        Subscribe now
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
}

export default Hero;
