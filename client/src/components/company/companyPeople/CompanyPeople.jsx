import React from "react";
import { motion } from "framer-motion";
import { ourPeople } from "../../../../data";

function CompanyPeople() {
  return (
    <section className="people w-full">
      <div className="people__wrapper w-10/12 mx-auto pt-16 pb-32">
        <div className="people__content w-full">
          {/* Title Animation */}
          <motion.div
            className="title text-center uppercase text-3xl md:text-6xl text-customBlack-800 font-bold"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h3>
              Our <span className="text-customPurple-500">People</span>
            </h3>
          </motion.div>

          {/* Subtitle Animation */}
          <motion.div
            className="subTitle text-center text-sm md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <p>A community of special people with special powers.</p>
          </motion.div>

          <div className="peoplesWrapper__content w-full py-16">
            <motion.div
              className="peoples w-full md:w-3/5 mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
              }}
            >
              {ourPeople.map((people, index) => (
                <motion.div
                  className="people w-full"
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="peoples__content grid grid-cols-1 md:grid-cols-2 items-center">
                    {/* Image Animation */}
                    <motion.div
                      className="left w-fit items-left justify-center py-8"
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                    >
                      <div className="left__content">
                        <motion.img
                          src={people.img}
                          alt={people.name}
                          className="rounded-md w-full"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>

                    {/* Text Animation */}
                    <motion.div
                      className="right justify-left w-full"
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      <div className="right__content w-full">
                        <div className="name font-bold text-customBlack-900 text-xl text-center md:text-left md:text-2xl">
                          {people.name}
                        </div>
                        <div className="role text-customPurple-500 font-bold text-center md:text-left">
                          {people.role}
                        </div>
                        <div className="desc py-4 text-lg md:text-xl text-justify hyphens-auto leading-normal !leading-[1.75]">
                          {people.desc}
                        </div>
                      </div>
                    </motion.div>
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

export default CompanyPeople;
