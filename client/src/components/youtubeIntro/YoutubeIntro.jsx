import React from "react";

function Youtubeintro() {
  return (
    <div className="youtube__section">
      <div className="youtube__wrapper">
        <iframe
          className="w-full h-[720px]"
          src="https://www.youtube.com/embed/KUeJusSc-8I?si=WER0lrTN-VQtEA2Z&amp;controls=0"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  );
}

export default Youtubeintro;
