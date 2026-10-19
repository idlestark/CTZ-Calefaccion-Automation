import "./history.css";
import "../../styles/custom.css";
import Avatar from "../bodyEmployee/avatar";
import { useParams } from "react-router-dom";
import { employees } from "../../models/Employee";

type Props = {};

const MONTHS = [
  "Diciembre",
  "Noviembre",
  "Octubre",
  "Septiembre",
  "Agosto",
  "Julio",
  "Junio",
  "Mayo",
  "Abril",
  "Marzo",
  "Febrero",
  "Enero",
];

const Index = ({}: Props) => {
  const { id } = useParams();
  const employee = employees.find((e) => e.id === Number(id));
  const year = 2027;

  if (!employee) {
    return <p>No se encontro el empleado</p>;
  }

  return (
    <div className="history">
      <div className="history-header">
        <button type="button" className="btn button-orange history-back">
          VOLVER
        </button>

        <div className="history-profile">
          <Avatar name={employee.name} />
          <div>
            <h4>{employee.name}</h4>
            <p className="history-dni">DNI {employee.dni}</p>
          </div>
        </div>
      </div>

      <h2 className="history-year">
        AÑO: <span>{year}</span>
      </h2>

      <div className="history-list">
        {MONTHS.map((month) => (
          <div key={month} className="month rounded-3">
            <span className="month-name">{month}</span>
            <button type="button" className="btn button-orange">
              Ver más
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Index;
