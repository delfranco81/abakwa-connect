import { Route } from "react-router-dom";

import Home from "../pages/Home";
import Businesses from "../pages/Businesses";
import BusinessProfile from "../pages/BusinessProfile";
import CleaningServices from "../pages/CleaningServices";
import Search from "../pages/Search";
import TestDatabase from "../pages/TestDatabase";

export function publicRoutes() {
  return (
    <>
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/businesses"
        element={<Businesses />}
      />

      <Route
        path="/business/:id"
        element={<BusinessProfile />}
      />

      <Route
        path="/cleaning-services"
        element={<CleaningServices />}
      />

      <Route
        path="/search"
        element={<Search />}
      />

      <Route
        path="/test-database"
        element={<TestDatabase />}
      />
    </>
  );
}
