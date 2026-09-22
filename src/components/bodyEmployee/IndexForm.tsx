import { useState, useEffect } from "react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";

type Props = {
  onClose?: () => void;
};

function IndexForm({ onClose }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const clienteEditar = location.state?.client;
  const esEdicion = Boolean(clienteEditar);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    direccion: "",
    celular: "",
    observacion: "",
    equipo: "",
  });

  useEffect(() => {
    if (clienteEditar) {
      setFormData({
        nombre: clienteEditar.nombre || "",
        apellido: clienteEditar.apellido || "",
        direccion: clienteEditar.direccion || "",
        celular: clienteEditar.celular || "",
        observacion: clienteEditar.observacion || "",
        equipo: clienteEditar.equipo || "",
      });
    }
  }, [clienteEditar]);

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
      console.log("Guardando cambios del cliente existente:", formData);
      // Lógica para actualizar en BD o estado local...
    } else {
      console.log("Creando nuevo cliente:", formData);
      // Lógica para guardar nuevo cliente...
    }

    // Al finalizar, navegamos de regreso a la lista de clientes
    navigate("/client");
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/client");
    }
  };

  return (
    <div className="p-4">
      <h1 className="modal-title fs-5">
        {esEdicion ? "Editar Cliente" : "Agregar Cliente"}
      </h1>

      <form className="form" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input
            name="nombre"
            type="text"
            className="form-control"
            value={formData.nombre}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Apellido</label>
          <input
            name="apellido"
            type="text"
            className="form-control"
            value={formData.apellido}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Direccion</label>
          <input
            name="direccion"
            type="text"
            className="form-control"
            value={formData.direccion}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Celular</label>

          <input
            name="celular"
            type="number"
            className="form-control"
            value={formData.celular}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Observaciones (para la casa)</label>

          <input
            name="observacion"
            type="text"
            className="form-control"
            value={formData.observacion}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="inputState" className="form-label">
            Aca cuando tenga la base de datos se van a mostrar los equipos que
            tiene el cliente
          </label>

          <select
            name="equipo"
            id="inputState"
            className="form-select"
            value="nombre"
          >
            <option value="">Elija una opción</option>
            <option value="Horno Eléctrico">Horno eléctrico</option>
            <option value="Lavarropas">Lavarropas</option>
            <option value="Televisor">Televisor</option>
          </select>
        </div>
      </form>
      <div>
        <NavLink to="/client" className="btn btn-success me-1">
          {esEdicion ? "Guardar Cambios" : "Guardar"}
        </NavLink>

        {onClose ? (
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleCancel}
            data-bs-dismiss="modal"
          >
            Cancelar
          </button>
        ) : (
          <NavLink to="/client" className="btn btn-danger">
            Cancelar
          </NavLink>
        )}
      </div>
    </div>
  );
}

export default IndexForm;
