import React from "react";
import { motion } from "framer-motion";

function CompanyIntro() {
  return (
    <article className="section w-full py-4 md:py-32">
      <div className="article__wrapper w-10/12 mx-auto">
        <div className="article__content">
          {/* Title Animation */}
          <motion.div
            className="intro__title"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-3xl md:text-7xl font-bold text-customBlack-900 uppercase">
              Who we <span className="text-customPurple-500">are</span>
            </h2>
          </motion.div>

          {/* First Paragraph */}
          <motion.div
            className="intro__content w-full py-4 md:py-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <p className="text-lg md:text-3xl text-justify hyphens-auto leading-normal !leading-[1.55]">
              Founded with a passion for transforming modern living, we are a
              dynamic, forward-thinking company committed to shaping vibrant
              communities, creating lasting value, and enhancing lives through
              innovative, sustainable, and purposeful real estate ventures.
            </p>
          </motion.div>

          {/* Image Animation */}
          <motion.div
            className="company__bg w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <img
              src="./assets/companyBG.jpg"
              alt="model of an estate by kemchuta homes limited"
              className="rounded-lg"
            />
          </motion.div>

          {/* Second Paragraph */}
          <motion.div
            className="intro__content2 w-full py-4 md:py-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            <p className="text-lg md:text-3xl text-justify hyphens-auto leading-normal !leading-[1.55]">
              At Kemchuta Homes, we’re more than a real estate business – we’re
              your trusted partner in turning your property ownership dreams
              into reality. We know that real estate is not just an investment;
              it’s about building your future, securing your legacy, and finding
              the perfect place to call home. Let’s create something
              extraordinary, together.
            </p>
          </motion.div>
        </div>
      </div>
    </article>
  );
}

export default CompanyIntro;
