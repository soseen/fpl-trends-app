import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./navbar";
import Footer from "./footer";
import {
  AppInitStatus,
  useAppInitContext,
} from "../AppInitializer/app-initializer.context";

const ErrorScreen = () => (
  <main className="container mx-auto flex flex-grow items-center justify-center py-4">
    <h1 className="flex justify-center text-text">Something went wrong...</h1>
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
        <main className="container mx-auto flex-grow px-2 py-4 md:px-4">
          <Outlet />
        </main>
      )}
      <Footer />
    </div>
  );
};

export default Layout;
