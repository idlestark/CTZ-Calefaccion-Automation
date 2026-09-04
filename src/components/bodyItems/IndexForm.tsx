import { useLocation, useNavigate, NavLink } from "react-router-dom";
import type { Item } from "../../models/Item";
import { useEffect, useState } from "react";

type Props = {
  edit?: boolean;
  item?: Item;
  OnClose?: () => void;
};

function IndexForm({ edit, item, OnClose }: Props) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    precio: 0,
    equipo: "",
    stock: 0,
  });
  useEffect(() => {
    if (edit && item) {
      setFormData({
        nombre: item.nombre,
        precio: item.precio,
        equipo: item.equipo,
        stock: item.stock,
      });
    }
  }, [edit, item]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleCancel = () => {
    if (OnClose) {
      OnClose();
    } else {
      navigate("/stock");
    }
  };
  return (
    <div className="p-4">
      <h1 className="modal-title fs-5">
        {edit ? "Editar item" : "Agregar item"}
      </h1>

      <form className="form">
        <div className="mb-3">
          <label className="form-label">Nombre Objeto a agregar</label>

          <input
            name="nombre"
            type="text"
            className="form-control"
            value={formData.nombre}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Precio</label>

          <input
            name="precio"
            type="number"
            className="form-control"
            value={formData.precio}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="inputState" className="form-label">
            Equipo del repuesto
          </label>

          <select
            name="equipo"
            id="inputState"
            className="form-select"
            value={formData.equipo}
            onChange={handleChange}
          >
            <option value="">Elija una opción</option>
            <option value="Horno Eléctrico">Horno eléctrico</option>
            <option value="Lavarropas">Lavarropas</option>
            <option value="Televisor">Televisor</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="inputStock" className="form-label">
            Stock disponible
          </label>

          <input
            name="stock"
            id="inputStock"
            type="number"
            className="form-control"
            value={formData.stock}
            onChange={handleChange}
          />
        </div>
        {OnClose ? (
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleCancel}
            data-bs-dismiss="modal"
          >
            Cancelar
          </button>
        ) : (
          <NavLink to="/stock" className="btn btn-danger">
            Cancelar
          </NavLink>
        )}
      </form>
    </div>
  );
}

export default IndexForm;
