import React from "react";
import { useParams } from "react-router-dom";
import { DetailedEstate } from "../../data.js";

// Function to create a slug from estate names
const generateSlug = (name) => {
  return name
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
};

function EstateDetails() {
  const { estateName } = useParams(); // Get slug from URL

  if (!estateName) {
    console.error("No estateName found in URL.");
    return <h2 className="text-center text-2xl">Invalid Estate</h2>;
  }

  console.log("Estate Slug from URL:", estateName);
  console.log(
    "Generated Slugs:",
    DetailedEstate.map((e) => generateSlug(e.estate))
  );

  // Find the estate by matching the slug
  const estate = DetailedEstate.find(
    (e) => generateSlug(e.estate) === estateName.trim()
  );

  console.log("Matched Estate:", estate); // 🔍 Debugging log

  if (!estate) {
    return <h2 className="text-center text-2xl">Estate Not Found</h2>;
  }

  return (
    <main className="main__section w-full">
      <div className="main__wrapper md:py-32 w-10/12 justify-center mx-auto">
        <div className="main__content w-full md:w-4/5 mx-auto ">
          <h1 className="text-3xl text-center md:text-5xl font-bold tracking-tighter text-customBlack-800 pt-12">
            {estate.estate}
          </h1>
          <div className="title__location flex flex-col md:flex-row justify-center items-center md:gap-2 text-xl pb-2">
            <h4 className="text-customBlack-500 text-sm md:text-lg">
              {estate?.address || "Address Not Available"}
            </h4>
            <h4 className="font-bold text-customPurple-500">
              {estate?.title || "No Title"}
            </h4>
          </div>
          <h4 className="text-2xl md:text-4xl text-customBlack-900 font-bold text-center pb-12">
            ₦{estate?.price || "Price Not Available"}
          </h4>

          {/* Estate Image */}
          <div className="img">
            <img
              className="h-[250px] md:h-[500px] w-full object-cover rounded-md"
              src={estate?.img || "/default-image.jpg"}
              alt={estate?.estate || "Estate Image"}
            />
          </div>

          <div className="estate__details w-full">
            <div className="estateDetails__content w-full gap-8 md:gap-16 grid grid-cols-1 md:grid-cols-2">
              <div className="left mt-4 md:mt-12">
                <div className="left__content">
                  <p className="text-lg md:text-xl text-justify hyphens-auto md:leading-[1.7] leading-[2]">
                    {estate?.desc || "Description not available."}
                  </p>
                </div>
              </div>

              {/* Neighborhood Section */}
              <div className="right w-full">
                <div className="right__content w-full">
                  <h3 className="mt-4 md:mt-12 text-2xl font-bold mb-4">
                    Neighborhood
                  </h3>
                </div>
                <div className="neighborhood_list w-full">
                  {estate?.neighborhood?.length > 0 ? (
                    estate.neighborhood.map((neighborhood, index) => (
                      <div className="listWrapper w-full" key={index}>
                        <div className="list flex items-center gap-x-4 pb-4 w-full">
                          <span className="text-2xl text-customPurple-500">
                            {neighborhood.icon
                              ? React.createElement(neighborhood.icon)
                              : "🏠"}
                          </span>
                          <p className="text-lg md:text-xl">
                            {neighborhood.name}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No neighborhood information available.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Amenities Section */}
            <div className="amenities w-full md:mt-12 md:bg-customBlack-800 rounded-sm pb-16 md:pt-5">
              <h3 className="mt-4 md:mt-12 text-2xl font-bold mb-4 md:py-8 text-center text-white">
                Proposed Amenities
              </h3>
              <div className="amenitiesWrapper flex w-full">
                <div className="amenitiesContent grid grid-cols-3 md:grid-cols-4 justify-space-between items-center gap-4 md:gap-8  w-full">
                  {estate?.amenities?.length > 0 ? (
                    estate.amenities.map((amenity, index) => (
                      <div
                        className="amenity flex flex-col gap-4 text-center items-center justify-center"
                        key={index}
                      >
                        <span className="text-4xl bg-customBlack-100 text-customPurple-700 px-8 py-4 rounded-sm hover:bg-customPurple-700 hover:text-customBlack-100 duration-200">
                          {amenity.icon
                            ? React.createElement(amenity.icon)
                            : "🏢"}
                        </span>
                        <p className="font-semibold text-customBlack-400">
                          {amenity.name}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-white text-center">
                      No amenities listed.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default EstateDetails;
