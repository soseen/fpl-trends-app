import type React from "react";
import { lazy, Suspense } from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Layout from "./components/Layout/layout";
import Home from "./components/Home/home.route";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppInitializerProvider } from "./components/AppInitializer/app-initializer.context";
import { AppContextProvider } from "./components/AppContext/app-context";
import { FootballerDetailsProvider } from "./components/FootballerDetails/footballer-details.context";

const Players = lazy(() => import("./components/Players/players.route"));
const CompareFootballers = lazy(
  () => import("./components/CompareFootballers/compare-footballers.route"),
);
const MyTrends = lazy(() => import("./components/MyTrends/my-trends.route"));

const RouteFallback = () => <div className="min-h-[280px]" />;

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppInitializerProvider>
        <BrowserRouter>
          <AppContextProvider>
            <TooltipProvider delayDuration={150} skipDelayDuration={300}>
              <FootballerDetailsProvider>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route
                      path="players"
                      element={
                        <Suspense fallback={<RouteFallback />}>
                          <Players />
                        </Suspense>
                      }
                    />
                    <Route
                      path="compare"
                      element={
                        <Suspense fallback={<RouteFallback />}>
                          <CompareFootballers />
                        </Suspense>
                      }
                    />
                    <Route
                      path="my-trends"
                      element={
                        <Suspense fallback={<RouteFallback />}>
                          <MyTrends />
                        </Suspense>
                      }
                    />
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
