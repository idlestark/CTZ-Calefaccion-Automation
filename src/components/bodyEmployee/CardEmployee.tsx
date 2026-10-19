import "bootstrap-icons/font/bootstrap-icons.css";
import "./employeeCard.css";
import "../../styles/custom.css";
import Avatar from "./avatar";
import type { Employee } from "../../models/Employee";
import { NavLink } from "react-router-dom";
import { useState } from "react";

type Props = {
  employee: Employee;
  onSave: (updatedEmployee: Employee) => void;
};

function CardEmployee({ employee, onSave }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    name: employee.name,
    dni: String(employee.dni),
  });

  const startEditing = () => {
    setDraft({ name: employee.name, dni: String(employee.dni) });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setDraft((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave({
      ...employee,
      name: draft.name,
      dni: Number(draft.dni),
    });
    setIsEditing(false);
  };

  const isValid = draft.name.trim() !== "" && Number(draft.dni) > 0;

  return (
    <div className="col">
      <div className="card border-0 rounded-3">
        <form
          className="card-body d-flex flex-column justify-content-between rounded-3"
          onSubmit={handleSubmit}
        >
          <div className="d-flex flex-wrap mb-3 employee-header">
            <Avatar name={isEditing ? draft.name : employee.name} />

            <div className="ms-3 flex-grow-1">
              {isEditing ? (
                <>
                  <input
                    name="name"
                    type="text"
                    className="form-control input-dark mb-2"
                    value={draft.name}
                    onChange={handleChange}
                    autoFocus
                  />
                  <input
                    name="dni"
                    type="number"
                    className="form-control input-dark"
                    value={draft.dni}
                    onChange={handleChange}
                  />
                </>
              ) : (
                <>
                  <h4 className="card-title">{employee.name}</h4>
                  <h5 className="card-text">DNI: {employee.dni}</h5>
                </>
              )}
            </div>
          </div>
          {isEditing ? (
            <div className="d-flex justify-content-end">
              <button
                type="submit"
                className="btn button-orange me-1"
                disabled={!isValid}
              >
                <i className="bi bi-check-lg me-2"></i>
                Guardar
              </button>
              <button
                type="button"
                className="btn button-transluce"
                onClick={cancelEditing}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="d-flex flex-wrap justify-content-between">
              <NavLink
                className="btn button-transluce me-1"
                to={`/employee/${employee.id}/history`}
                state={{ employee }}
              >
                <i className="bi bi-clock-history me-2"></i>
                ver historial completo
              </NavLink>
              <div>
                <button
                  type="button"
                  className="btn button-transluce me-1"
                  onClick={startEditing}
                >
                  <i className="bi bi-pencil-square"></i>
                </button>
                <button type="button" className="btn button-transluce me-1">
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
