import { NavLink, useNavigate } from "react-router-dom";
import "./Style.css";
import logo from "../../assets/logo.png";
import { useAuth } from "../../auth";

type Section = { label: string; path: string; admin?: boolean };

const SECTIONS: Section[] = [
  { label: "Reloj", path: "/reloj", admin: true },
  { label: "Justificaciones", path: "/justificaciones" },
  { label: "Historial", path: "/historial" },
  { label: "Empleados", path: "/employee", admin: true },
  { label: "Ajustes", path: "/ajustes" },
];

function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const sections = SECTIONS.filter((s) => !s.admin || user.role === "admin");

  return (
    <div className="d-flex align-items-start flex-shrink-0" id="nav">
      <div className="nav flex-column nav-pills nav-inner" id="v-pills-tab">
        <img src={logo} alt="CTZ" />

        {sections.map(({ label, path }) => (
          <NavLink key={path} className="navButton nav-link button d-flex justify-content-between" to={path}>
            {({ isActive }) => (
              <>
                {label}
                {isActive && <i className="bi bi-chevron-right"></i>}
              </>
            )}
          </NavLink>
        ))}

        <div className="nav-user">
          <span>
            {user.name} <span className="nav-role">- {user.role === "admin" ? "Administrador" : "Sub-administrador"}</span>
          </span>
          <button
            type="button"
            className="nav-logout"
            title="Cerrar sesión"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
          >
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
