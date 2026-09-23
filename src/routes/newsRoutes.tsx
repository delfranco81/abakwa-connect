import { Route } from "react-router-dom";

import News from "../pages/News";

export function newsRoutes() {
  return (
    <Route
      path="/news"
      element={<News />}
    />
  );
}