import "./Badge.css";

type Props = {
  text: string;
};

function Badge({ text }: Props) {
  return (
    <span className="badge">
      {text}
    </span>
  );
}

export default Badge;