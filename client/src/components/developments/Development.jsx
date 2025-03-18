import React from "react";
import { motion } from "framer-motion";
import { DetailedEstate } from "../../../data";
import { Link } from "react-router-dom";

// Function to generate a slug from estate names
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
};

function Development() {
  return (
    <div className="estate__wrapper w-full mt-8 md:mt-24">
      <div className="estate__content w-full">
        <div className="estates">
          {DetailedEstate.map((estate) => {
            const slug = generateSlug(estate.estate); // Generate slug

            return (
              <motion.div
                className="estate py-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center justify-center"
                key={estate.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.2 }}
              >
                {/* Left Content */}
                <motion.div className="left">
                  <div className="estate__name">
                    <motion.h3 className="text-3xl md:text-5xl font-bold tracking-tighter text-customBlack-800 py-2">
                      {estate.estate}
                    </motion.h3>
                  </div>

                  <div className="title__location flex flex-col md:flex-row items-center md:gap-2 text-xl">
                    <h4 className="text-customBlack-500 text-sm md:text-lg">
                      {estate.address}
                    </h4>
                    <h4 className="font-bold text-customPurple-500">
                      {estate.title}
                    </h4>
                  </div>

                  <motion.div className="price mt-4">
                    <h4 className="text-2xl md:text-4xl text-customBlack-900 font-bold">
                      ₦{estate.price}
                    </h4>
                  </motion.div>
                  <motion.p className="estate__desc mt-4 text-customBlack-500 leading-[1.8]">
                    {estate.desc}
                  </motion.p>
                  {/* Buttons */}
                  <motion.div className="buttons w-full flex flex-col md:flex-row items-center gap-5 mt-8">
                    <button className="btn__primary w-full md:w-[50%] bg-customPurple-500 text-center  text-white font-bold py-3 px-5 rounded-sm hover:bg-customPurple-700 duration-300">
                      Book Inspection
                    </button>
                    <Link
                      to={`/estate/${slug}`}
                      className="btn__secondary w-full md:w-[50%] border-solid text-center border-2 border-customPurple-500 text-customPurple-500 font-bold py-3 px-5 rounded-sm hover:bg-customPurple-100 duration-300"
                    >
                      Subscribe Now
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Right Content */}
                <motion.div className="right">
                  <div className="right__content">
                    <div className="estate__img relative">
                      <motion.img
                        className="w-full h-full object-cover rounded-md"
                        src={estate.img}
                        alt={estate.estate}
                      />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Development;
