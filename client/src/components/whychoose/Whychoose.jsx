import React from "react";
import { whychooseus } from "../../../data";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function Whychoose() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, duration: 0.8, ease: "easeInOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeInOut" },
    },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 1, ease: "easeInOut" },
    },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 1, ease: "easeInOut" },
    },
  };

  return (
    <div
      ref={ref}
      className="whychoose__section bg-[url('./assets/achitectutural-line-draft.png')] bg-opacity-80 bg-cover bg-center bg-no-repeat py-16 w-full"
    >
      {/* Wrapper with Semi-Transparent Background */}
      <div className="whychoose__wrapper w-full mx-auto h-full bg-customPurple-600 bg-opacity-90 p-6 md:p-12 rounded-lg">
        <motion.div
          className="whychoose__contentWrapper w-full md:w-10/12 mx-auto pb-16"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <div className="whychoose__content grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Section */}
            <motion.div className="left" variants={slideInLeft}>
              <div className="left__content hidden md:block">
                <img
                  src="./assets/businessWoman.png"
                  alt="Business Woman"
                  className="w-full h-auto"
                />
              </div>
            </motion.div>

            {/* Right Section */}
            <motion.div className="right" variants={slideInRight}>
              <div className="right__content bg-white py-5 px-6 md:py-10 md:px-12 rounded-lg shadow-md">
                <div className="title mb-6">
                  <h3 className="text-lg text-center md:text-left md:text-3xl lg:text-4xl uppercase font-bold text-customPurple-900 mb-4">
                    Why Choose{" "}
                    <span className="text-customPurple-500">Kemchuta</span>{" "}
                    Homes
                  </h3>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed text-center md:text-justify">
                    Experience unparalleled expertise, dedication, and
                    innovative solutions in real estate. Kemchuta Homes is your
                    trusted partner for securing profitable investments.
                  </p>
                </div>

                {/* Perks Section */}
                <motion.div
                  className="perks space-y-6"
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  variants={containerVariants}
                >
                  {whychooseus.map((perk, index) => (
                    <motion.div
                      className="perk flex items-start gap-3 md:gap-6"
                      key={index}
                      variants={itemVariants}
                    >
                      {/* Icon */}
                      <div className="icon bg-customPurple-100 p-2 md:p-4 aspect-square rounded-full shadow-lg text-customPurple-500 flex items-center justify-center w-6 h-6 md:w-12 md:h-12">
                        {React.createElement(perk.icon, {
                          className: "w-6 h-6 text-xl",
                        })}
                      </div>

                      {/* Perk Content */}
                      <div className="perkContent">
                        <h4 className="text-sm md:text-2xl font-bold text-customPurple-900">
                          {perk.why}
                        </h4>
                        <p className="text-sm md:text-lg text-gray-700 leading-relaxed">
                          {perk.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Whychoose;
