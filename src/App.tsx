import React from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Layout from "./components/Layout/layout";
import Home from "./components/Home/home";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppInitializerProvider } from "./components/AppInitializer/app-initializer.context";
import Players from "./components/Players/players";
import { AppContextProvider } from "./components/AppContext/app-context";
import { FootballerDetailsProvider } from "./components/FootballerDetailsContext/footballer-details.context";

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
