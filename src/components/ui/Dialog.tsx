import type { ReactNode } from "react";

type Props = { children: ReactNode; width?: number; onClose?: () => void };

/** Ventana emergente con el estilo de Figma. Si recibe onClose, se cierra al tocar el fondo. */
export default function Dialog({ children, width = 520, onClose }: Props) {
  return (
    <div className="ctz-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="ctz-dialog" style={{ width, maxWidth: "100%" }} role="dialog">
        {children}
      </div>
    </div>
  );
}
