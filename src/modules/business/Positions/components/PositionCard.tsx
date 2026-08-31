import type { Position } from "../types/position";

interface Props {
  position: Position;
}

export default function PositionCard({ position }: Props) {
  return (
    <div className="card">

      <h3>{position.title}</h3>

      <p>
        {position.minimum_salary?.toLocaleString()} FCFA
        {" - "}
        {position.maximum_salary?.toLocaleString()} FCFA
      </p>

      <p>
        Retirement: {position.retirement_age}
      </p>

      <p>
        Probation: {position.probation_days} days
      </p>

    </div>
  );
}