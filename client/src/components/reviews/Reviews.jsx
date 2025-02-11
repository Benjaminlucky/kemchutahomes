import React from "react";
import { motion } from "framer-motion";
import { reviews } from "../../../data";
import { Star } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

function Reviews() {
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, duration: 0.8 },
    },
  };

  const slideVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const titleVariant = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } },
  };

  return (
    <div className="review__section w-full bg-gray-100 py-16 md:py-24">
      <motion.div
        className="review__wrapper w-11/12 md:w-10/12 mx-auto py-16 md:py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        {/* Title Section */}
        <motion.div
          className="review__title text-3xl md:text-5xl font-bold mb-12 md:mb-32"
          variants={titleVariant}
        >
          <h3 className="text-center uppercase">
            What <span className="text-purple-600">Investors</span> Are Saying
          </h3>
        </motion.div>

        {/* Swiper Slider */}
        <motion.div variants={slideVariants}>
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            breakpoints={{
              768: { slidesPerView: 2 }, // Medium screens: 2 slides
              1024: { slidesPerView: 3 }, // Large screens: 3 slides
            }}
            pagination={{ clickable: true, el: ".swiper-pagination" }}
            className="reviews"
          >
            {reviews.map((review, index) => (
              <SwiperSlide key={index}>
                <motion.div
                  className="review bg-white p-6 md:p-8 rounded-xl shadow-lg mx-auto max-w-md"
                  whileHover={{ scale: 1.03 }}
                  variants={slideVariants}
                >
                  <div className="review__content w-full">
                    <div className="top flex flex-col md:flex-row items-center justify-between">
                      <div className="left flex flex-col md:flex-row gap-5 items-center">
                        <div className="avatar h-16 w-16 aspect-square rounded-full overflow-hidden">
                          <img
                            src={review.img}
                            alt=""
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="name flex flex-col text-center md:text-left">
                          <h5 className="text-xl font-bold text-gray-700">
                            {review.name}
                          </h5>
                          <p>{review.investment}</p>
                        </div>
                      </div>
                      <div className="right">
                        <div className="flex items-center gap-1 text-purple-500 mb-4">
                          {Array(5)
                            .fill()
                            .map((_, i) => (
                              <Star
                                key={i}
                                size={18}
                                fill={
                                  i < review.rating ? "currentColor" : "none"
                                }
                                stroke="currentColor"
                              />
                            ))}
                        </div>
                      </div>
                    </div>
                    <div className="bottom py-5 text-center">
                      <p className="text-gray-600 leading-relaxed">
                        {review.review}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        {/* Pagination with extra margin */}
        <div className="swiper-pagination mt-10"></div>

        {/* Custom Pagination Styles */}
        <style jsx>{`
          .swiper-pagination {
            position: relative !important;
            margin-top: 20px;
          }
          .swiper-pagination-bullet {
            background-color: #9333ea !important;
            width: 12px;
            height: 12px;
            opacity: 0.6;
          }
          .swiper-pagination-bullet-active {
            background-color: #6b21a8 !important;
            width: 16px;
            height: 16px;
            opacity: 1;
          }
        `}</style>
      </motion.div>
    </div>
  );
}

export default Reviews;
