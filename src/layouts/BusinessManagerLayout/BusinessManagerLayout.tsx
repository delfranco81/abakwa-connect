import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AIWidget from "./AIWidget";
import QuickActions from "./QuickActions";

import "./BusinessManager.css";


export default function BusinessManagerLayout() {

  return (

    <div className="business-layout">

      <Sidebar />


      <div className="business-main">

        <Topbar />


        <main className="business-content">

          <Outlet />

        </main>


      </div>


      <AIWidget />

      <QuickActions />

    </div>

  );
}