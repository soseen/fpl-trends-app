import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./navbar";
import Footer from "./footer";
import {
  AppInitStatus,
  useAppInitContext,
} from "../AppInitializer/app-initializer.context";
import gif from "../../assets/404.gif";

const ErrorScreen = () => (
  <main className="container mx-auto flex flex-grow flex-col items-center gap-3 px-12 py-1 md:justify-center md:gap-12 md:py-4">
    <h1 className="text-[80px] font-bold text-magenta md:text-[120px]">404</h1>
    <img src={gif} alt="gif" className="h-auto w-full md:w-auto" />
    <h2 className="md: flex justify-center text-center text-xl text-text md:text-3xl">
      Seems like the server is dead. Try again later.
    </h2>
  </main>
);

const Layout = () => {
  const { status } = useAppInitContext();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      {status === AppInitStatus.error ? (
        <ErrorScreen />
      ) : (
        <main className="container mx-auto flex-grow px-2 py-1 md:px-4 md:py-4">
          <Outlet />
        </main>
      )}
      <Footer />
    </div>
  );
};

export default Layout;
