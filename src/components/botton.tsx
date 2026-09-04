import { type ReactNode } from "react";

type BottonProps = {
  children?: ReactNode;
  onClick?: () => void;
};

function BottonAgregar({ onClick }: BottonProps) {
  return (
    <button type="button" className="btn btn-success" onClick={onClick}>
      Success
    </button>
  );
}
export default BottonAgregar;

export function BottonEliminar({ onClick }: BottonProps) {
  return (
    <button type="button" className="btn btn-danger" onClick={onClick}>
      Warning
    </button>
  );
}
