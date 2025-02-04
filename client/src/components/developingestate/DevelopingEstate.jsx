import React from "react";
import { developingEstate } from "../../../data";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function DevelopingEstate() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Animation Variants
  const slideVariants = (direction) => ({
    hidden: {
      opacity: 0,
      x: direction === "left" ? -100 : direction === "right" ? 100 : 0,
      y: direction === "bottom" ? 100 : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeInOut",
      },
    },
  });

  return (
    <div
      ref={ref}
      className="developing__container py-16 md:py-32 overflow-hidden"
    >
      <div className="developing__wrapper w-10/12 mx-auto">
        <div className="developing__content text-center">
          <motion.div
            className="developing__title mb-12"
            initial={{ opacity: 0, y: -50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 1,
              ease: [0.25, 0.8, 0.25, 1],
            }}
          >
            <h3 className="text-3xl md:text-5xl font-bold mb-8 uppercase">
              See our Fast Developing Estate
            </h3>
          </motion.div>

          <div className="estates__contents grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-12 gap-8">
            {developingEstate.map((estate, index) => (
              <motion.div
                className="estate bg-white rounded-lg shadow-lg overflow-hidden"
                key={index}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={slideVariants(
                  index % 3 === 0
                    ? "left"
                    : index % 3 === 1
                    ? "right"
                    : "bottom"
                )}
                transition={{
                  duration: 0.8,
                  delay: index * 0.2, // Staggered delay
                }}
              >
                <div className="estate__content relative">
                  <div className="img overflow-hidden">
                    <img
                      src={estate.img}
                      alt={estate.estate}
                      className="w-full transition-transform duration-300 hover:scale-110 object-cover"
                    />
                  </div>
                  <div className="price absolute bottom-0 left-0 right-0 h-32 text-white bg-gradient-to-t from-black to-transparent p-4 flex justify-between items-end">
                    <div className="left text-left">
                      <h5 className="text-xl font-bold">{`₦${estate.price}`}</h5>
                      <p className="text-sm">{estate.deposit}</p>
                    </div>
                    <div className="right">
                      <p className="text-sm font-bold">{estate.sqm}</p>
                    </div>
                  </div>
                </div>
                <div className="estate__details p-4 flex flex-col md:flex-row justify-between items-center">
                  <div className="deatails__left text-center md:text-left">
                    <h4 className="text-xl font-bold">{estate.estate}</h4>
                    <p className="text-gray-600 mb-4">{estate.location}</p>
                  </div>
                  <div className="details__right">
                    <Link
                      to="#"
                      className="bg-customPurple-500 py-3 w-full md:w-0 px-5 mb-5 rounded-sm text-white font-bold text-lg hover:bg-customPurple-700 transition-all duration-300"
                    >
                      Book Inspection
                    </Link>
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

export default DevelopingEstate;
