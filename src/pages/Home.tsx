import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import CategorySection from "../components/CategorySection/CategorySection";
import QuickActions from "../components/QuickActions/QuickActions";
function Home() {
  return (
    <>
      <Navbar />

      <Hero />
      <QuickActions />
       <CategorySection />

    </>
  );
}

export default Home;