import { Link } from "react-router-dom";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-overlay">

        <div className="hero-content">

          <h1>
            Discover Trusted Businesses
            <br />
            Across Bamenda
          </h1>

          <p>
            Restaurants • Hotels • Cleaning • Taxi • Shopping • Healthcare
          </p>

          <div className="hero-search">

            <input
              type="text"
              placeholder="🔍 Search businesses, services or locations..."
            />

          </div>

          <div className="hero-buttons">

            <Link
              to="/businesses"
              className="btn-primary"
            >
              Find Businesses
            </Link>

            <Link
              to="/register-business"
              className="btn-secondary"
            >
              Register Business
            </Link>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;