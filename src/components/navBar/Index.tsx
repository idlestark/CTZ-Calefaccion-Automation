import { NavLink } from "react-router-dom";
import "./Style.css";

type Props = {};

function NavBar({}: Props) {
  return (
    <div className="d-flex align-items-start service-navbar" id="nav">
      <div
        className="nav flex-column nav-pills me-3"
        id="v-pills-tab"
        role="tablist"
        aria-orientation="vertical"
      >
        <img src="" alt="Aca se puede colocar un logo" />
        <NavLink
          className={({ isActive }) =>
            `navButton nav-link ${isActive ? "active" : ""}`
          }
          to="/stock"
        >
          Seccion disponible
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `navButton nav-link ${isActive ? "active" : ""}`
          }
          to="/client"
        >
          Seccion disponible
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `navButton nav-link ${isActive ? "active" : ""}`
          }
          to="/report"
        >
          Seccion disponible
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `navButton nav-link ${isActive ? "active" : ""}`
          }
          to="/reportList"
        >
          Seccion disponible
        </NavLink>
      </div>
    </div>
  );
}

export default NavBar;
