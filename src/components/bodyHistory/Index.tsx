import "./history.css";
import "../../styles/custom.css";
import Avatar from "../bodyEmployee/avatar";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { call } from "../../api";
import type { Employee, EmployeeResult } from "../../types";
import { dniFmt } from "../../format";
import EmployeeDetail from "../ui/EmployeeDetail";
import GradeBadge from "../ui/GradeBadge";

type M = { month: string; year: number; monthName: string; grade: EmployeeResult["grade"] };

/** Historial completo de un empleado: un renglón por cada mes procesado. */
const Index = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [months, setMonths] = useState<M[]>([]);
  const [detail, setDetail] = useState<EmployeeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const all = await call<Employee[]>("employee:getAll");
        const emp = all.find((e) => e.id === Number(id)) ?? null;
        setEmployee(emp);
        if (emp) setMonths(await call<M[]>("history:employee", { employeeId: emp.id }));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar.");
      }
    })();
  }, [id]);

  if (error) return <p className="ctz-error">{error}</p>;
  if (!employee) return <p className="ctz-muted">No se encontró el empleado.</p>;

  const years = [...new Set(months.map((m) => m.year))];

  return (
    <div className="history">
      <div className="history-header">
        <button type="button" className="btn button-orange history-back" onClick={() => navigate("/employee")}>
          VOLVER
        </button>
        <div className="history-profile">
          <Avatar name={employee.name} />
          <div>
            <h4>{employee.name}</h4>
            <p className="history-dni">DNI {dniFmt(employee.dni)}</p>
          </div>
        </div>
      </div>

      {months.length === 0 && <p className="ctz-muted mt-4">Este empleado todavía no tiene meses procesados.</p>}
      {years.map((y) => (
        <div key={y} className="w-100" style={{ maxWidth: 1050 }}>
          <h2 className="history-year">
            AÑO: <span>{y}</span>
          </h2>
          <div className="history-list">
            {months
              .filter((m) => m.year === y)
              .map((m) => (
                <div key={m.month} className="month rounded-3">
                  <span className="month-name">{m.monthName}</span>
                  <span className="d-flex align-items-center gap-3">
                    <GradeBadge grade={m.grade} className="py-1" />
                    <button
                      type="button"
                      className="btn button-orange"
                      onClick={async () => {
                        const r = await call<{ employee: EmployeeResult }>("history:employeeMonth", { employeeId: employee.id, month: m.month });
                        setDetail(r.employee);
                      }}
                    >
                      Ver más
                    </button>
                  </span>
                </div>
              ))}
          </div>
        </div>
      ))}

      {detail && <EmployeeDetail employee={detail} onClose={() => setDetail(null)} />}
    </div>
  );
};

export default Index;
