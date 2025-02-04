import React from "react";
import { motion } from "framer-motion";

function Earnhome() {
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, duration: 0.8, ease: "easeInOut" },
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

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1, ease: "easeInOut" } },
  };

  return (
    <div className="earn__section w-full">
      <div className="earn__wrapper w-11/12 md:w-10/12 mx-auto py-16 md:py-32">
        <motion.div
          className="earn__content grid grid-cols-1 md:grid-cols-2 gap-10 w-full justify-between items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {/* Left Section */}
          <motion.div className="left" variants={slideInLeft}>
            <div className="left__content flex flex-col justify-center">
              <div className="title text-center">
                <motion.h3
                  className="text-lg md:text-5xl uppercase font-bold py-2"
                  variants={fadeIn}
                >
                  Earn Over <span className="text-customPurple-500">65%</span>{" "}
                  ROI Monthly{" "}
                </motion.h3>
                <motion.p className="text-lg md:text-2xl" variants={fadeIn}>
                  The Ultimate Real Estate Investment Plan In Nigeria. Earn 65%
                  ROI.
                </motion.p>
              </div>
              <div className="form__container w-full">
                <motion.form
                  action=""
                  className="flex flex-col py-12 px-6"
                  variants={containerVariants}
                >
                  <motion.input
                    type="text"
                    placeholder="Full Name:"
                    className="text-xl text-gray-700 bg-gray-100 p-4 rounded-md focus:ring-0 focus:outline-0 my-2"
                    variants={fadeIn}
                  />
                  <motion.input
                    type="email"
                    placeholder="Email Address"
                    className="text-xl bg-gray-100 p-4 rounded-md focus:ring-0 focus:outline-0 my-2"
                    variants={fadeIn}
                  />
                  <motion.input
                    type="text"
                    placeholder="Mobile Number"
                    className="text-xl bg-gray-100 p-4 rounded-md focus:ring-0 focus:outline-0 my-2"
                    variants={fadeIn}
                  />
                  <motion.button
                    className="w-full bg-customPurple-500 py-4 mt-4 rounded-md text-white text-xl font-bold hover:bg-customPurple-700"
                    variants={fadeIn}
                  >
                    Sign Up
                  </motion.button>
                </motion.form>
              </div>
            </div>
          </motion.div>

          {/* Right Section */}
          <motion.div
            className="right w-full flex justify-center"
            variants={slideInRight}
          >
            <div className="right__content w-full flex flex-col justify-center">
              <div className="img w-full mx-auto">
                <motion.img
                  src="./assets/Buy2Sell.jpg"
                  alt=""
                  className="w-full"
                  variants={fadeIn}
                />
              </div>
              <motion.div
                className="desc py-8 text-justify text-xl"
                variants={fadeIn}
              >
                <p>
                  The Buy2Sell (land bank scheme) is a very convenient way to
                  park cash in a tangible investment while watching your equity
                  grow. It is a good investment vehicle for investors that are
                  not ready to own or develop a property just yet. Fill the form
                  below to get more details;
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Earnhome;
