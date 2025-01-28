import React from "react";
import Hero from "../../components/hero/Hero";
import Homeintro from "../../components/homeIntro/Homeintro";

function Home() {
  return (
    <main className="section w-full">
      <Hero />
      <Homeintro />
    </main>
  );
}

export default Home;
