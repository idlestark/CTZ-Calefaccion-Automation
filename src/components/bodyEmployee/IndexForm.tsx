import { useState, useEffect } from "react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import "../../styles/custom.css";

type Props = {
  onClose?: () => void;
};

function IndexForm({ onClose }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const employeeEditar = location.state?.employee;
  const esEdicion = Boolean(employeeEditar);

  const [formData, setFormData] = useState({
    name: "",
    dni: "",
  });

  useEffect(() => {
    if (employeeEditar) {
      setFormData({
        name: employeeEditar.name || "",
        dni: employeeEditar.dni || "",
      });
    }
  }, [employeeEditar]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    if (esEdicion) {
      console.log("Guardando cambios del empleado existente:", formData);
      // Lógica para actualizar en BD o estado local...
    } else {
      console.log("Creando nuevo empleado:", formData);
      // Lógica para guardar nuevo empleado...
    }

    // Al finalizar, navegamos de regreso a la lista de empleados
    navigate("/employee");
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/employee");
    }
  };

  return (
    <div className="p-4">
      <h1 className="modal-title fs-5 mb-2">Agregar Empleado</h1>

      <form className="form" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input
            name="name"
            type="text"
            className="form-control input-dark"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">DNI</label>
          <input
            name="dni"
            type="number"
            className="form-control input-dark"
            value={formData.dni}
            onChange={handleChange}
          />
        </div>
      </form>
      <div className="d-flex justify-content-center">
        <NavLink to="/employee" className="btn button-orange me-1">
          Agregar
        </NavLink>

        {onClose ? (
          <button
            type="button"
            className="btn button-transluce"
            onClick={handleCancel}
            data-bs-dismiss="modal"
          >
            Cancelar
          </button>
        ) : (
          <NavLink to="/employee" className="btn btn-danger">
            Cancelar
          </NavLink>
        )}
      </div>
    </div>
  );
}

export default IndexForm;
