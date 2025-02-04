import React from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Layout from "./components/Layout/layout";
import Home from "./components/Home/home";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppInitializerProvider } from "./components/AppInitializer/app-initializer.context";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppInitializerProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
              </Route>
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </AppInitializerProvider>
    </Provider>
  );
};

export default App;
