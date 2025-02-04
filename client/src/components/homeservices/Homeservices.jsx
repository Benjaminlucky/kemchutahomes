import React from "react";
import { services } from "../../../data";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function Homeservices() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div
      ref={ref}
      className="service__section w-full bg-customBlack-900 overflow-hidden"
    >
      <div className="service__wrapper w-11/12 md:w-10/12 mx-auto py-16 md:py-32">
        <div className="service__content">
          {/* Title Animation */}
          <motion.div
            className="service__title text-center uppercase text-white text-3xl md:text-6xl font-bold py-5"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 1, // Longer duration for smoother effect
              ease: [0.25, 0.8, 0.25, 1], // Smooth cubic-bezier easing
            }}
          >
            <h1>Our Services</h1>
          </motion.div>

          {/* Services with Smooth Scaling */}
          <div className="service__detail flex flex-col md:flex-row mt-16 gap-10 justify-center lg:flex-row md:flex-row sm:flex-col">
            {services.map((service, index) => (
              <motion.div
                key={index}
                className={`p-5 md:p-10 rounded-sm ${
                  index === 0
                    ? "bg-customPurple-300 border border-2 border-transparent hover:border-customPurple-300 hover:bg-transparent transition-all duration-300 ease-in-out"
                    : index === 1
                    ? "bg-customPurple-400 border border-2 border-transparent hover:border-customPurple-400 hover:bg-transparent transition-all duration-300 ease-in-out"
                    : "bg-customPurple-500 border border-2 border-transparent hover:border-customPurple-500 hover:bg-transparent transition-all duration-300 ease-in-out"
                }`}
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{
                  duration: 0.8, // Smooth scaling duration
                  ease: "easeInOut", // Smooth easing
                  delay: index * 0.2, // Staggered animation
                }}
              >
                <div className="serv__con">
                  <div className="serv__title py-5 text-white text-lg md:text-2xl font-bold text-center uppercase">
                    <h4>{service.service}</h4>
                  </div>
                  <div className="serv__desc text-justify text-gray-300 hyphens-auto">
                    <p>{service.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homeservices;
