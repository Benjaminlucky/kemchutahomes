import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

function Homeintro() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true }); // Animate only the first time it comes into view

  return (
    <div className="homeIntro__section w-full">
      <div
        className="homeIntro__wrapper py-24 md:py-32 w-10/12 mx-auto"
        ref={ref}
      >
        {isInView && (
          <motion.div
            className="homeIntro__content w-11/12 md:w-8/12 mx-auto"
            initial={{ opacity: 0, x: -50 }} // Start off-screen to the left
            animate={{ opacity: 1, x: 0 }} // Animate into position
            transition={{ duration: 1 }} // Animation duration
          >
            <div className="intro__titleWrapper flex gap-2 justify-center">
              <div className="title flex flex-col gap-1 md:gap-2 font-bold text-center text-3xl md:text-7xl">
                <h1>Building Futures,</h1>
                <h1>
                  One <span className="text-customPurple-500">Estate</span> at a
                  Time
                </h1>
              </div>
            </div>
            <div className="intro__description text-center text-lg md:text-2xl text-justify text-customBlack-500 mt-8">
              <p>
                At Kemchuta Homes Limited, we specialize in providing prime
                estate lands that are perfect for building your future. Whether
                you’re an investor looking for valuable land or an individual
                ready to create a home, we offer trusted and accessible estate
                land options that cater to your unique needs. With our expertise
                and commitment to excellence, we ensure that your journey to
                land ownership is simple, secure, and full of promise. Start
                building your legacy with Kemchuta Homes Limited today.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Homeintro;
