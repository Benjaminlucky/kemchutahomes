import React from "react";
import { Link, useLocation } from "react-router-dom";
import { mainLink, userLink } from "../../../data";

function Header() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  return (
    <div className="mainNavWrapper w-full">
      <div className="mainNavContent w-10/12 mx-auto py-5">
        <div className="desktop__nav w-full flex items-center">
          <div className="desktopNav__wrapper w-full flex items-center justify-between">
            <div className="logo">
              <Link to="/">
                <img src="./assets/kemchutaMainLogo.svg" />
              </Link>
            </div>
            <div className="desk__nav flex justify-end  w-4/5">
              <div className="desknav__content flex justify-between items-center gap-36 ">
                <div className="mainlink flex gap-10">
                  {mainLink.map((link, index) => (
                    <div
                      className={`mainLink relative ${
                        isActive(link.link) ? " active" : ""
                      }`}
                      key={index}
                    >
                      <Link to={link.link}>{link.name}</Link>
                    </div>
                  ))}
                </div>
                <div className="userlink flex gap-5 items-center">
                  <div className="userlinkContent flex gap-3 items-center">
                    <Link
                      to="/signup"
                      className="uppercase bg-customPurple-500 rounded-full border-2 border-transparent hover:border-2 hover:border-customPurple-500 font-bold text-white px-5 py-3 hover:bg-transparent hover:text-customPurple-500 "
                    >
                      Get Started
                    </Link>
                    <Link
                      to="/login"
                      className="uppercase bg-transparent border-2 border-customPurple-300 px-5 py-3 rounded-full hover:bg-black hover:text-white hover:border-transparent font-bold"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mobile__nav"></div>
    </div>
  );
}

export default Header;
