import "bootstrap-icons/font/bootstrap-icons.css";
import "../bodyReports/Index";
import type { Client } from "../../models/Client";
import { NavLink } from "react-router-dom";

type Props = {
  client: Client;
};

function CardClient({ client }: Props) {
  return (
    <div className="col">
      <div className="card h-100 shadow-sm">
        <div className="card-body d-flex flex-column justify-content-between">
          <h5 className="card-title">
            {client.nombre} {client.apellido}
          </h5>
          <p className="card-text">
            <i className="bi bi-geo-alt-fill me-1"></i>
            {client.direccion}
          </p>
          <p className="card-text">
            <i className="bi bi-telephone-fill me-1"></i>
            {client.celular}
          </p>
          <p className="card-text">
            <i className="bi bi-building-fill"></i>
            {client.observacion}
          </p>
          <div>
            <a href="#" className="btn btn-primary me-1">
              Ver más
            </a>
            <NavLink
              className="btn btn-primary me-1"
              to={`/client/edit/${client.id}`}
              state={{ client }}
            >
              editar
            </NavLink>
            <a href="../bodyReports/Index/" className="btn btn-primary">
              Generar Presupuesto
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardClient;
