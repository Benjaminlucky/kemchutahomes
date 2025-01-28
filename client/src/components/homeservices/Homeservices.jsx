import React from "react";
import { services } from "../../../data";

function Homeservices() {
  return (
    <div className="service__section w-full bg-customBlack-900">
      <div className="service__wrapper w-11/12 md:w-10/12 mx-auto py-16 md:py-32">
        <div className="service__content">
          <div className="service__title text-center uppercase text-white text-3xl md:text-6xl font-bold py-5">
            <h1>Our Services</h1>
          </div>
          <div className="service__detail flex flex-col md:flex-row mt-16 gap-10 justify-center lg:flex-row md:flex-row sm:flex-col">
            {services.map((service, index) => (
              <div
                className={`p-5 md:p-10 rounded-sm  ${
                  index === 0
                    ? "bg-customPurple-300 border border-2 border-transparent hover:border-customPurple-300 hover:bg-transparent transition-all duration-300 ease-in-out"
                    : index === 1
                    ? "bg-customPurple-400 border border-2 border-transparent hover:border-customPurple-400 hover:bg-transparent transition-all duration-300 ease-in-out"
                    : "bg-customPurple-500 border border-2 border-transparent hover:border-customPurple-500 hover:bg-transparent transition-all duration-300 ease-in-out"
                }`}
                key={index}
              >
                <div className="serv__con">
                  <div className="serv__title py-5 text-white text-lg md:text-2xl font-bold text-center uppercase">
                    <h4>{service.service}</h4>
                  </div>
                  <div className="serv__desc text-justify text-gray-300 hyphens-auto">
                    <p>{service.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homeservices;
