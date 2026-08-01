import { Link } from "react-router-dom";
import "./BusinessCard.css";

type Props = {
  business: any;
};

function BusinessCard({ business }: Props) {
  return (
    <Link
      to={`/business/${business.id}`}
      className="business-card"
    >
      <div className="cover">

        <img
          src={
            business.cover_image ||
            "https://placehold.co/600x250"
          }
          alt={business.name}
        />

        {business.featured && (
          <span className="featured">
            ⭐ Featured
          </span>
        )}

      </div>

      <div className="card-content">

        <img
          className="logo"
          src={
            business.logo ||
            "https://placehold.co/120"
          }
          alt={business.name}
        />

        <h3>
          {business.name}

          {business.verified && (
            <span className="verified">
              ✔
            </span>
          )}

        </h3>

        <p>{business.category}</p>

        <p>
          📍 {business.area}
        </p>

        <div className="rating">

          ⭐ {business.rating}

          <span>
            ({business.total_reviews} reviews)
          </span>

        </div>

        <div className="buttons">

          <a
            href={`tel:${business.phone}`}
          >
            📞 Call
          </a>

          <a
            href={`https://wa.me/${business.whatsapp}`}
            target="_blank"
            rel="noreferrer"
          >
            💬 WhatsApp
          </a>

        </div>

      </div>
    </Link>
  );
}

export default BusinessCard;