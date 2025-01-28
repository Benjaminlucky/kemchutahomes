import React from "react";
import Hero from "../../components/hero/Hero";
import Homeintro from "../../components/homeIntro/Homeintro";
import Youtubeintro from "../../components/youtubeIntro/YoutubeIntro";
import Homeservices from "../../components/homeservices/Homeservices";

function Home() {
  return (
    <main className="section w-full">
      <Hero />
      <Homeintro />
      <Youtubeintro />
      <Homeservices />
    </main>
  );
}

export default Home;
