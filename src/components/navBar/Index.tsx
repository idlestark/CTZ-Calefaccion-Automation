import { NavLink } from "react-router-dom";
import "./Style.css";
import "../../styles/custom.css";

type Props = {};

function NavBar({}: Props) {
  const sections = [
    { label: "Reloj", path: "/reloj" },
    { label: "Justificaciones", path: "/justificaciones" },
    { label: "Historial", path: "/historial" },
    { label: "Empleados", path: "/empleados" },
  ];

  return (
    <div className="d-flex align-items-start" id="nav">
      <div
        className="nav flex-column nav-pills"
        id="v-pills-tab"
        role="tablist"
        aria-orientation="vertical"
      >
        <img src="" alt="Aca se puede colocar un logo" />

        {sections.map(({ label, path }) => (
          <NavLink
            className="navButton nav-link button d-flex justify-content-between"
            to={path}
          >
            {({ isActive }) => (
              <>
                {label}
                {isActive && <i className="bi bi-chevron-right"></i>}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default NavBar;
