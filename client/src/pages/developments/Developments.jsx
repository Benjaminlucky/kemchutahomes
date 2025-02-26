import React from "react";
import { motion } from "framer-motion";
import Development from "../../components/developments/Development";

function Developments() {
  return (
    <main className="main__container w-full">
      <div className="main__wrapper mt-8 md:mt-16 w-10/12 mx-auto">
        <div className="main__content py-4 md:py-32">
          {/* Title Animation */}
          <motion.div
            className="title w-full md:w-3/5 mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl md:text-5xl font-bold tracking-tight md:tracking-tighter leading-[1.2]">
              Explore Our Rapidly Growing Estate Projects{" "}
              <span className="text-customPurple-500">
                Diverse Titles, Prime Locations, and Competitive Pricing.
              </span>
            </h3>
          </motion.div>

          {/* Subtitle Animation */}
          <motion.div
            className="subtitle text-sm md:text-lg w-full md:w-3/5 mx-auto mt-4 md:mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p>
              Discover a range of premium estate developments tailored to meet
              your investment and homeownership dreams. From strategically
              located properties to flexible pricing options, our projects are
              designed for value, growth, and sustainability. Find the perfect
              property that fits your vision today!
            </p>
          </motion.div>

          {/* Estate Section Animation */}
          <motion.section
            className="estates__container"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Development />
          </motion.section>
        </div>
      </div>
    </main>
  );
}

export default Developments;
