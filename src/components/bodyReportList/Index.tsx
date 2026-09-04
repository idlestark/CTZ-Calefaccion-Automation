import "./Style.css";
import IndexSearch from "../searchBar/Index";
import { reports } from "../../models/Report";

const Index = () => {
  return (
    <>
      <h1>Seccion 4</h1>
      <IndexSearch actions={["record"]} />
      <ul className="list-group">
        {reports.map((report) => (
          <li
            key={report.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div className="d-flex">
              <p className="m-2">{report.nombre_cliente}</p>
              <p className="m-2">{report.direccion}</p>
              <p className="m-2">{report.codigo_equipo}</p>
              <p className="m-2">{report.numero_telefono}</p>
            </div>
            <div>
              <button type="button" className="btn btn-primary me-2">
                Ver
              </button>
              <button type="button" className="btn btn-primary me-2">
                Aceptar
              </button>
              <button type="button" className="btn btn-primary">
                Rechazar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Index;
