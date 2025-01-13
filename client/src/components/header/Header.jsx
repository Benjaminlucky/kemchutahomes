import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { mainLink, userLink } from "../../../data";
import { IoMenu } from "react-icons/io5";
import { IoCloseCircle } from "react-icons/io5";

function Header() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [openMenu, setOpenMenu] = useState(false);

  const toggleMenu = () => {
    setOpenMenu(!openMenu);
  };

  return (
    <div className="mainNavWrapper w-full">
      {/* Desktop Navigation */}
      <div className="mainNavContent w-10/12 mx-auto md:py-5">
        <div className="desktop__nav w-full flex items-center">
          <div className="desktopNav__wrapper hidden md:flex w-full items-center justify-between">
            <div className="logo">
              <Link to="/">
                <img src="./assets/kemchutaMainLogo.svg" alt="Logo" />
              </Link>
            </div>
            <div className="desk__nav flex justify-end w-4/5">
              <div className="desknav__content flex justify-between items-center gap-36">
                <div className="mainlink flex gap-10">
                  {mainLink.map((link, index) => (
                    <div
                      className={`mainLink relative ${
                        isActive(link.link) ? "active" : ""
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
                      className="uppercase bg-customPurple-500 rounded-full border-2 border-transparent hover:border-customPurple-500 font-bold text-white px-5 py-3 hover:bg-transparent hover:text-customPurple-500"
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

      {/* Mobile Navigation */}
      <div className="mobile__nav md:hidden w-full">
        <div className="mobilenav__content relative w-full mx-auto">
          <div className="mobile__logo pl-5">
            <Link to="/">
              <img
                src="./assets/kemchutaMainLogo.svg"
                alt="Kemchuta Homes Limited Logo"
                className="w-[200px]"
              />
            </Link>
            <button
              onClick={toggleMenu}
              className="absolute top-0 right-5 text-4xl text-gray-400 z-20"
            >
              {openMenu ? <IoCloseCircle /> : <IoMenu />}
            </button>
          </div>

          {openMenu && (
            <div className="navwrapper absolute top-8 left-0 w-full bg-white pb-5 z-10 shadow-md">
              {mainLink.map((link, index) => (
                <div
                  key={index}
                  className={`px-5 py-3 border-b hover:bg-customPurple-100 ${
                    isActive(link.link) ? "bg-customPurple-100" : ""
                  }`}
                >
                  <Link to={link.link} onClick={() => setOpenMenu(false)}>
                    {link.name}
                  </Link>
                </div>
              ))}
              <div className="bottomMobile__nav mt-10">
                <div className="bNavContent flex flex-col gap-3 w-11/12 mx-auto">
                  <Link
                    to="/signup"
                    className="bg-customPurple-500 px-4 py-2 rounded-full text-center font-bold text-white border border-1 border-transparent  hover:border-customPurple-500 hover:bg-transparent hover:text-black"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="text-center py-2 px-4 rounded-full border border-1 border-gray-400"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
