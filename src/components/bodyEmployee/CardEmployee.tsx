import "bootstrap-icons/font/bootstrap-icons.css";
import "./employeeCard.css";
import "../../styles/custom.css";
import type { Employee } from "../../types";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { dniFmt } from "../../format";

type Props = {
  employee: Employee;
  onSave: (updated: Employee) => Promise<string | null>; // devuelve un mensaje de error o null
  onDelete: (employee: Employee) => void;
};

function CardEmployee({ employee, onSave, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ name: employee.name, dni: employee.dni ? String(employee.dni) : "" });
  const [error, setError] = useState<string | null>(null);

  const startEditing = () => {
    setDraft({ name: employee.name, dni: employee.dni ? String(employee.dni) : "" });
    setError(null);
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err = await onSave({ ...employee, name: draft.name, dni: draft.dni.trim() ? Number(draft.dni) : null });
    if (err) setError(err);
    else setIsEditing(false);
  };

  const isValid = draft.name.trim() !== "" && (draft.dni.trim() === "" || Number(draft.dni) > 0);

  return (
    <div className="col">
      <div className="card border-0 rounded-3">
        <form className="card-body d-flex flex-column justify-content-between rounded-3" onSubmit={handleSubmit}>
          <div className="d-flex flex-wrap mb-3 employee-header">
            <span className="ctz-muted h2">{employee.id}</span>
            <div className="ms-3 flex-grow-1">
              {isEditing ? (
                  <>
                    <input name="name" type="text" className="form-control input-dark mb-2" value={draft.name}
                           onChange={handleChange} autoFocus/>
                    <input name="dni" type="number" className="form-control input-dark" placeholder="DNI"
                           value={draft.dni} onChange={handleChange}/>
                  </>
              ) : (
                  <>
                    <h4 className="card-title">{employee.name}</h4>
                    <h5 className="card-text small">DNI {dniFmt(employee.dni)}</h5>
                  </>
              )}
            </div>
          </div>
          {error && <p className="ctz-error mb-2">{error}</p>}
          {isEditing ? (
            <div className="d-flex justify-content-end">
              <button type="submit" className="btn button-orange me-1" disabled={!isValid}>
                <i className="bi bi-check-lg me-2"></i>
                Guardar
              </button>
              <button type="button" className="btn button-transluce" onClick={() => setIsEditing(false)}>
                Cancelar
              </button>
            </div>
          ) : (
            <div className="d-flex flex-wrap justify-content-between">
              <NavLink className="btn button-transluce me-1" to={`/employee/${employee.id}/history`}>
                <i className="bi bi-clock-history me-2"></i>
                Ver historial completo
              </NavLink>
              <div>
                <button type="button" className="btn button-transluce me-1" onClick={startEditing} title="Editar">
                  <i className="bi bi-pencil-square"></i>
                </button>
                <button type="button" className="btn button-transluce me-1" onClick={() => onDelete(employee)} title="Eliminar">
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default CardEmployee;
