import "./ServiceCard.css";
import { Link } from "react-router-dom";

type Props = {
  title: string;
  description: string;
  icon: string;
  link: string;
  active?: boolean;
};

function ServiceCard({
  title,
  description,
  icon,
  link,
  active = false,
}: Props) {
  return (
    <div className="service-card">
      <div className="icon">{icon}</div>

      <h3>{title}</h3>

      <p>{description}</p>

      {active ? (
        <Link className="btn" to={link}>
          Explore
        </Link>
      ) : (
        <button disabled>Coming Soon</button>
      )}
    </div>
  );
}

export default ServiceCard;