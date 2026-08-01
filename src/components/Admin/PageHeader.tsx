import { Link } from "react-router-dom";

type Props = {
  title: string;
  buttonText?: string;
  buttonLink?: string;
};

function PageHeader({
  title,
  buttonText,
  buttonLink,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 25,
      }}
    >
      <h1>{title}</h1>

      {buttonText && buttonLink && (
        <Link
          to={buttonLink}
          style={{
            background: "#2563eb",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
}

export default PageHeader;
