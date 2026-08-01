import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public Pages
import Home from "./pages/Home";
import Cleaning from "./pages/cleaning";
import Businesses from "./pages/Businesses";
import TestDatabase from "./pages/TestDatabase";
import RegisterBusiness from "./pages/RegisterBusiness";
import BusinessProfile from "./pages/BusinessProfile";

import Explore from "./pages/Explore";
import Map from "./pages/Map";

// Old Legacy Admin Pages
import AdminPlaces from "./pages/AdminPlaces";
import AdminPlaceForm from "./pages/AdminPlaceForm";

// New Dashboard CMS Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import Places from "./pages/admin/Places";
import AddPlace from "./pages/admin/AddPlace";
import EditPlace from "./pages/admin/EditPlace";
import DeletePlace from "./pages/admin/DeletePlace";
import Media from "./pages/admin/Media";
import Events from "./pages/admin/Events";
import AddEvent from "./pages/admin/AddEvent";
import EditEvent from "./pages/admin/EditEvent";
import DeleteEvent from "./pages/admin/DeleteEvent";
import News from "./pages/admin/News";
import AddNews from "./pages/admin/AddNews";
import EditNews from "./pages/admin/EditNews";
import DeleteNews from "./pages/admin/DeleteNews";
import Users from "./pages/admin/Users";
import Settings from "./pages/admin/Settings";
import Analytics from "./pages/admin/Analytics";
import Categories from "./pages/admin/Categories";
import OwnerDashboard from "./pages/OwnerDashboard";
import Overview from "./pages/owner/Overview";
import EditBusiness from "./pages/owner/EditBusiness";
import Services from "./pages/Services";
import Gallery from "./pages/owner/Gallery";
import BusinessHours from "./pages/owner/BusinessHours";
import Reviews from "./pages/owner/Reviews";
import AnalyticsPage from "./pages/owner/Analytics";
import SettingsPage from "./pages/owner/Settings";
import AddService from "./pages/owner/AddService";
import Subscription from "./pages/owner/Subscription";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/businesses" element={<Businesses />} />
        <Route path="/business/:id" element={<BusinessProfile />} />
        <Route path="/register-business" element={<RegisterBusiness />} />
        <Route path="/cleaning" element={<Cleaning />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/map" element={<Map />} />
        <Route path="/test" element={<TestDatabase />} />
        <Route path="/legacy/admin/places" element={<AdminPlaces />} />
        <Route path="/legacy/admin/places/new" element={<AdminPlaceForm />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/media" element={<Media />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/places" element={<Places />} />
        <Route path="/admin/places/new" element={<AddPlace />} />
        <Route path="/admin/places/:id" element={<EditPlace />} />
        <Route path="/admin/places/delete/:id" element={<DeletePlace />} />
        <Route path="/admin/events" element={<Events />} />
        <Route path="/admin/events/new" element={<AddEvent />} />
        <Route path="/admin/events/:id" element={<EditEvent />} />
        <Route path="/admin/events/delete/:id" element={<DeleteEvent />} />
        <Route path="/admin/news" element={<News />} />
        <Route path="/admin/news/new" element={<AddNews />} />
        <Route path="/admin/news/:id" element={<EditNews />} />
        <Route path="/admin/news/delete/:id" element={<DeleteNews />} />
        <Route path="/admin/categories" element={<Categories />} />
        <Route path="analytics" element={<AnalyticsPage />} />
<Route path="settings" element={<SettingsPage />} />
<Route path="/owner" element={<OwnerDashboard />}>
  <Route index element={<Overview />} />
  <Route path="business" element={<EditBusiness />} />
  <Route path="services" element={<Services />} />
  <Route path="gallery" element={<Gallery />} />
  <Route path="hours" element={<BusinessHours />} />
  <Route path="reviews" element={<Reviews />} />
  <Route path="subscription" element={<Subscription />} />
  
</Route>
        <Route
    path="/owner"
    element={<OwnerDashboard />}
/><Route path="services/new" element={<AddService />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;