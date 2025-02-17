import React from "react";
import { motion } from "framer-motion";
import { values } from "../../../../data";

function CompanyValues() {
  return (
    <section className="w-full">
      <div className="value__wrapper w-10/12 mx-auto pt-16 pb-32">
        <div className="value__content w-full mx-auto">
          {/* Title Animation */}
          <motion.div
            className="values__title text-center w-full"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h3 className="text-3xl md:text-6xl font-bold text-center text-customBlack-900 uppercase">
              Our <span className="text-customPurple-500">Values</span>
            </h3>
          </motion.div>

          {/* Subtitle Animation */}
          <motion.div
            className="subTitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <p className="text-center md:text-xl">
              We are an Expression of our Core Values -{" "}
              <span className="text-customPurple-600 uppercase font-bold">
                Kemchuta
              </span>
            </p>
          </motion.div>

          {/* Cards Animation */}
          <div className="values__wrapper w-full mt-16">
            <motion.div
              className="values grid grid-cols-1 md:grid-cols-4 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
              }}
            >
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  className={`p-8 rounded-sm transition duration-300 ${
                    index === 0
                      ? "bg-customPurple-800 text-white"
                      : "hover:bg-customPurple-800 hover:text-white"
                  }`}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="value__content">
                    <div className="maintitle flex items-center gap-3 py-4 text-2xl">
                      <div className="icon bg-customPurple-100 rounded-sm font-bold text-customPurple-700 px-3 py-2 w-fit">
                        {value.letter}
                      </div>
                      <div className="title font-bold">{value.title}</div>
                    </div>
                    <div className="desc text-justify hyphens-auto !leading-[1.75]">
                      {value.text}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CompanyValues;
