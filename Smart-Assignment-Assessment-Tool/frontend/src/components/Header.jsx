import React from "react";
import { DarkThemeToggle } from "flowbite-react";
import logo from "../asserts/rounded_logo.png"

const Header = () => {
  return (
    <header className="w-full relative">
      <DarkThemeToggle className="absolute top-2 right-4"/>
    <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
            <a href="/" className="flex items-center">
                <img src={logo} className="mr-3 h-6 sm:h-9" alt="Saat Logo" />
                <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">S A A T</span>
            </a>
            <div className="flex items-center lg:order-2">
                <a href="/register" className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-10 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">Get started</a>
            </div>
        </div>
    </nav>
</header>
  );
};

export default Header;
