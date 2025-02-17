import React from "react";
import { motion } from "framer-motion";

function CompanyMission() {
  return (
    <section className="section w-full py-8 md:py-32">
      <div className="mission__wrapper w-10/12 mx-auto">
        <div className="mission__content grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Left Section (Text Content) */}
          <motion.div
            className="left"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="left__content">
              {/* Title Animation */}
              <motion.div
                className="title"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <h3 className="text-3xl md:text-6xl text-customBlack-900 font-bold py-8 uppercase">
                  Our <span className="text-customPurple-500">Mission</span>
                </h3>
              </motion.div>

              {/* Text Animation */}
              <motion.div
                className="mission__text"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                <p className="text-lg md:text-3xl text-justify hyphens-auto leading-normal !leading-[1.55]">
                  We envision a future where every individual’s dream of owning
                  their ideal home is realized. Our goal is to be a leading
                  force in real estate investment and development, setting new
                  industry standards and transforming properties into thriving,
                  vibrant communities that inspire and elevate.
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Section (Image) */}
          <motion.div
            className="right"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="right__content">
              <img
                src="./assets/missionBG.jpg"
                alt="An estate model by Kemchuta Homes Limited"
                className="rounded-md"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default CompanyMission;
