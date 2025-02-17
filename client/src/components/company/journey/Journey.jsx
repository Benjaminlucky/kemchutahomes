import React from "react";
import { motion } from "framer-motion";

function Journey() {
  return (
    <section className="w-full bg-customPurple-50">
      <div className="section__wrapper w-10/12 mx-auto py-8 md:py-32">
        <div className="section__content w-full mx-auto">
          {/* Title Animation */}
          <motion.div
            className="title text-3xl md:text-6xl font-bold text-center text-customBlack-900"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h3>Our Journey</h3>
          </motion.div>

          {/* Subtitle Animation */}
          <motion.div
            className="textTitle text-customBlack-900 text-center py-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <p>We've had a thrilling and impactful journey, Sync in.</p>
          </motion.div>

          {/* Journey Content Animation */}
          <motion.div
            className="journey w-full md:w-3/5 mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <div className="journey__content text-lg md:text-2xl text-center !leading-[1.75] py-4">
              <p>
                Founded in 2016, Kemchuta Homes has grown from a modest, local
                real estate firm into a prominent industry leader. Our journey
                is defined by a steadfast commitment to excellence, a passion
                for innovation, and an unwavering dedication to client
                satisfaction. Over the years, we have successfully delivered
                numerous projects, gained the trust of investors, and played a
                key role in the development of vibrant, thriving communities.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Journey;
