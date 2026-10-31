import type { GradeKey } from "../../types";

const LABEL: Record<GradeKey, string> = {
  puntualidad: "Puntualidad",
  presentismo: "Presentismo",
  medio: "Medio presentismo",
  ninguno: "Sin presentismo",
};

export default function GradeBadge({ grade, className = "" }: { grade: GradeKey; className?: string }) {
  return <div className={`grade-badge grade-${grade} ${className}`}>{LABEL[grade]}</div>;
}
