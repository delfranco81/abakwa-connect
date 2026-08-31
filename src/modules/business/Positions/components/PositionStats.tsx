import type { Position } from "../types/position";

interface Props {
  positions: Position[];
}

export default function PositionStats({ positions }: Props) {
  return (
    <div className="stats">

      <div>

        <h2>{positions.length}</h2>

        <p>Total Positions</p>

      </div>

    </div>
  );
}