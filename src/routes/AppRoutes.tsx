import { Routes } from "react-router-dom";

import { publicRoutes } from "./publicRoutes";
import { authRoutes } from "./authRoutes";
import { businessRoutes } from "./businessRoutes";
import { governmentRoutes } from "./governmentRoutes";
import { educationRoutes } from "./educationRoutes";
import { jobsRoutes } from "./jobsRoutes";
import { housingRoutes } from "./housingRoutes";
import { marketplaceRoutes } from "./marketplaceRoutes";
import { tourismRoutes } from "./tourismRoutes";
import { communityRoutes } from "./communityRoutes";
import { newsRoutes } from "./newsRoutes";
import { adminRoutes } from "./adminRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {publicRoutes()}
      {authRoutes()}
      {businessRoutes()}
      {governmentRoutes()}
      {educationRoutes()}
      {jobsRoutes()}
      {housingRoutes()}
      {marketplaceRoutes()}
      {tourismRoutes()}
      {communityRoutes()}
      {newsRoutes()}
      {adminRoutes()}
    </Routes>
  );
}