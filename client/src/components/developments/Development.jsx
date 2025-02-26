import React from "react";
import { motion } from "framer-motion";
import { DetailedEstate } from "../../../data";

function Development() {
  return (
    <div className="estate__wrapper w-full mt-8 md:mt-24">
      <div className="estate__content w-full">
        <div className="estates">
          {DetailedEstate.map((estate, index) => (
            <motion.div
              className="estate py-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center justify-center"
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.2 }}
            >
              {/* Left Content */}
              <motion.div
                className="left"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="estate__name">
                  <motion.h3
                    className="text-3xl text-center md:text-left md:text-5xl font-bold tracking-tighter text-customBlack-800 py-2"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    {estate.estate}
                  </motion.h3>
                </div>

                <div className="title__location flex flex-col md:flex-row items-center md:gap-2 text-xl">
                  <h4 className="text-customBlack-500 text-sm md:text-lg">
                    {estate.address}
                  </h4>
                  <h4 className="font-bold text-customPurple-500 text-center md:text-left">
                    {estate.title}
                  </h4>
                </div>

                <motion.div
                  className="price mt-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <h4 className="text-2xl md:text-4xl text-customBlack-900 font-bold text-center md:text-left">
                    ₦{estate.price}
                  </h4>
                </motion.div>

                <div className="plot__type font-bold text-customBlack-500 text-center md:text-left">
                  <h4>{estate.sqm}</h4>
                </div>

                <motion.p
                  className="estate__desc mt-4 text-justify md:tracking-tighter text-customBlack-500 leading-[1.8] hyphens-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  {estate.desc}
                </motion.p>

                <motion.div
                  className="buttons w-full flex flex-col md:flex-row items-center gap-5 mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <button className="btn__primary w-full md:w-[50%] bg-customPurple-500 text-white font-bold py-3 px-5 rounded-sm hover:bg-customPurple-700 duration-300">
                    Book Inspection
                  </button>
                  <button className="btn__secondary w-full md:w-[50%] border-solid border-2 border-customPurple-500 text-customPurple-500 font-bold py-3 px-5 rounded-sm hover:bg-customPurple-100 duration-300">
                    Subscribe Now
                  </button>
                </motion.div>
              </motion.div>

              {/* Right Content */}
              <motion.div
                className="right"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="right__content">
                  <div className="estate__img relative">
                    <motion.img
                      className="w-full h-full object-cover rounded-md"
                      src={estate.img}
                      alt={`${estate.estate} 3D architectural model`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6, duration: 0.8 }}
                      viewport={{ once: true }}
                    />
                    <div className="cat__deposit absolute bottom-2 md:bottom-8 flex items-center justify-between left-2 right-2 md:left-8 md:right-8 text-white font-bold py-1 px-2 rounded-tr-md rounded-bl-md">
                      <div className="category px-2 py-1 md:px-5 md:py-2 text-sm md:text-lg bg-customPurple-200 md:bg-customPurple-700 rounded-tl-md rounded-br-md">
                        {estate.category}
                      </div>
                      <div className="deposit px-2 py-1 md:px-5 md:py-2 text-sm md:text-lg bg-customPurple-200 md:bg-customPurple-700 rounded-tl-md rounded-br-md">
                        {estate.depositPercentage}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Development;
