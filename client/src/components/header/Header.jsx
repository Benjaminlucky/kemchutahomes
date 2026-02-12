import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { mainLink, userLink } from "../../../data";
import { IoMenu, IoCloseCircle } from "react-icons/io5";
import "./header.css";

function Header() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [openMenu, setOpenMenu] = useState(false);

  const toggleMenu = () => {
    setOpenMenu(!openMenu);
  };

  // Close menu when route changes
  useEffect(() => {
    setOpenMenu(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (openMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [openMenu]);

  return (
    <div className="mainNavWrapper w-full relative z-[9999]">
      {/* Desktop Navigation */}
      <div className="mainNavContent w-full py-3 md:py-3 top-0 bg-white z-[500] shadow-md relative">
        <div className="desktop__nav w-11/12 lg:w-10/12 mx-auto flex items-center">
          <div className="desktopNav__wrapper hidden md:flex w-full items-center justify-between">
            {/* Logo on the left */}
            <div className="logo flex-shrink-0">
              <Link to="/">
                <img
                  src="/assets/kemchutaMainLogo.svg"
                  alt="Logo"
                  className="w-32 lg:w-40 xl:w-48 h-auto"
                />
              </Link>
            </div>

            {/* Navigation items and buttons on the right */}
            <div className="desk__nav flex items-center gap-6 lg:gap-8 xl:gap-12">
              <div className="mainlink flex gap-6 lg:gap-8 xl:gap-10">
                {mainLink.map((link, index) => (
                  <div
                    className={`mainLink relative whitespace-nowrap ${
                      isActive(link.link) ? "active" : ""
                    }`}
                    key={index}
                  >
                    <Link
                      to={link.link}
                      className="text-sm lg:text-base transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </div>
                ))}
              </div>

              <div className="userlink flex gap-3 items-center flex-shrink-0">
                <Link
                  to="/signup"
                  className="uppercase bg-customPurple-500 rounded-full border-2 border-transparent hover:border-customPurple-500 font-semibold text-white px-4 py-2 lg:px-5 lg:py-2 hover:bg-transparent hover:text-customPurple-500 text-xs lg:text-sm transition-all duration-200 whitespace-nowrap"
                >
                  Get Started
                </Link>

                <Link
                  to="/login"
                  className="uppercase bg-transparent border-2 border-customPurple-300 px-4 py-2 lg:px-5 lg:py-2 rounded-full hover:bg-black hover:text-white hover:border-transparent font-semibold text-xs lg:text-sm transition-all duration-200 whitespace-nowrap"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="mobile__nav md:hidden w-full relative z-[9999] bg-white">
        <div className="mobilenav__content relative w-full mx-auto">
          <div className="mobile__logo px-4 sm:px-5 py-3 relative flex items-center justify-between z-[10000]">
            <Link to="/" className="flex-shrink-0">
              <img
                src="/assets/kemchutaMainLogo.svg"
                alt="Kemchuta Homes Limited Logo"
                className="w-36 sm:w-44 h-auto"
              />
            </Link>

            <button
              onClick={toggleMenu}
              className="text-3xl sm:text-4xl text-gray-400 relative z-10 transition-transform duration-200 hover:scale-110 active:scale-95"
              aria-label={openMenu ? "Close menu" : "Open menu"}
            >
              {openMenu ? <IoCloseCircle /> : <IoMenu />}
            </button>
          </div>

          {/* Mobile Menu Overlay */}
          {openMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
                onClick={() => setOpenMenu(false)}
              />

              {/* Menu Content */}
              <div className="navwrapper absolute top-full left-0 w-full bg-white pb-5 shadow-lg z-[9999] max-h-[calc(100vh-80px)] overflow-y-auto">
                {mainLink.map((link, index) => (
                  <div
                    key={index}
                    className={`px-4 sm:px-5 py-3 sm:py-4 border-b hover:bg-customPurple-100 transition-colors duration-200 ${
                      isActive(link.link)
                        ? "bg-customPurple-100 font-semibold"
                        : ""
                    }`}
                  >
                    <Link
                      to={link.link}
                      onClick={() => setOpenMenu(false)}
                      className="block text-sm sm:text-base"
                    >
                      {link.name}
                    </Link>
                  </div>
                ))}

                <div className="bottomMobile__nav mt-6 sm:mt-10 px-4 sm:px-5">
                  <div className="bNavContent flex flex-col gap-3 w-full">
                    <Link
                      to="/signup"
                      onClick={() => setOpenMenu(false)}
                      className="bg-customPurple-500 px-4 py-3 rounded-full text-center font-bold text-white border-2 border-transparent hover:border-customPurple-500 hover:bg-transparent hover:text-black transition-all duration-200 text-sm sm:text-base"
                    >
                      Get Started
                    </Link>

                    <Link
                      to="/login"
                      onClick={() => setOpenMenu(false)}
                      className="text-center py-3 px-4 rounded-full border-2 border-gray-400 hover:bg-gray-100 transition-all duration-200 text-sm sm:text-base font-semibold"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
