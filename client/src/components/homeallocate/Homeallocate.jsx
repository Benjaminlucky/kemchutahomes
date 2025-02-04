import React from "react";
import { motion } from "framer-motion";
import { allocate } from "../../../data";

function Homeallocate() {
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, duration: 0.8, ease: "easeInOut" },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const imageHover = {
    hover: { scale: 1.1, transition: { duration: 0.3, ease: "easeInOut" } },
  };

  return (
    <div className="allocate__section w-full">
      <div className="allocate__wrapper w-11/12 md:w-10/12 mx-auto">
        <motion.div
          className="allocate__content w-full"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {/* Title Section */}
          <motion.div
            className="allocate__title text-center text-xl md:text-5xl lg:text-6xl uppercase font-bold mb-16"
            variants={fadeInUp}
          >
            <h3>Updates and Activities</h3>
          </motion.div>

          {/* Updates Grid */}
          <motion.div
            className="updates py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={containerVariants}
          >
            {allocate.map((update, index) => (
              <motion.div
                className="update"
                key={index}
                variants={fadeInUp} // Apply fade-in-up effect to each item
              >
                <div className="update__content">
                  <motion.div
                    className="img overflow-hidden rounded-md"
                    whileHover="hover" // Trigger hover animation on image
                    variants={imageHover}
                  >
                    <img
                      src={update.img}
                      alt=""
                      className="transition-transform overflow-x-hidden duration-300 object-cover"
                    />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Homeallocate;
