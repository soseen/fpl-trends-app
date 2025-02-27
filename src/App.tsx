import React from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Layout from "./components/Layout/layout";
import Home from "./components/Home/home.route";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppInitializerProvider } from "./components/AppInitializer/app-initializer.context";
import Players from "./components/Players/players.route";
import { AppContextProvider } from "./components/AppContext/app-context";
import { FootballerDetailsProvider } from "./components/FootballerDetails/footballer-details.context";
import CompareFootballers from "./components/CompareFootballers/compare-footballers.route";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppInitializerProvider>
        <BrowserRouter>
          <AppContextProvider>
            <TooltipProvider>
              <FootballerDetailsProvider>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="players" element={<Players />} />
                    <Route path="compare" element={<CompareFootballers />} />
                  </Route>
                </Routes>
              </FootballerDetailsProvider>
            </TooltipProvider>
          </AppContextProvider>
        </BrowserRouter>
      </AppInitializerProvider>
    </Provider>
  );
};

export default App;
