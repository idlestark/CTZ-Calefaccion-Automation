import { useState } from "react";
import IndexItems from "./IndexItems";
import IndexModal from "../modal/Index";

const Index = () => {
  const [showItems, setShowItems] = useState(false);
  const [showAseguradora, setShowAseguradora] = useState(false);
  const [aseguradora, setAseguradora] = useState("");
  return (
    <>
      <h1>Seccion 3</h1>
      <h2>Ejemplo de formulario...</h2>
      <form className="row g-3 p-3">
        <div className="col-md-6">
          <label htmlFor="inputEmail4" className="form-label">
            Nombre y Apellido del cliente
          </label>
          <input type="text" className="form-control" id="inputEmail4" />
        </div>
        <div className="col-md-6">
          <label htmlFor="inputPassword4" className="form-label">
            Codigo del equipo
          </label>
          <input type="text" className="form-control" id="inputPassword4" />
        </div>
        <div className="col-md-6">
          <label htmlFor="inputAddress" className="form-label">
            Direccion del cliente
          </label>
          <input type="text" className="form-control" id="inputAddress" />
        </div>
        <div className="col-md-6">
          <label htmlFor="inputAddress2" className="form-label">
            Numero de Telefono
          </label>
          <input type="text" className="form-control" id="inputAddress2" />
        </div>
        <div className="col-md-6">
          <label htmlFor="inputCity" className="form-label">
            Ciudad
          </label>
          <input type="text" className="form-control" id="inputCity" />
        </div>
        <div className="col-md-6">
          <label htmlFor="inputCity" className="form-label">
            Costo Adicional
          </label>
          <input type="number" className="form-control" id="inputCity" />
        </div>
        <div className="form-floating">
          <textarea
            className="form-control"
            placeholder="Leave a comment here"
            id="floatingTextarea2"
            style={{ height: "100px" }}
          ></textarea>
          <label htmlFor="floatingTextarea2">Descripcion del arreglo</label>
        </div>
        <div className="form-floating">
          <textarea
            className="form-control"
            placeholder="Leave a comment here"
            id="floatingTextarea2"
            style={{ height: "50px" }}
          ></textarea>
          <label htmlFor="floatingTextarea2">Observaciones...</label>
        </div>
        <div className="col-12">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="gridCheck"
              checked={showAseguradora}
              onChange={(e) => {
                const checked = e.target.checked;
                setShowAseguradora(checked);
                if (!checked) {
                  setAseguradora("");
                }
              }}
            />
            <label className="form-check-label" htmlFor="gridCheck">
              Aseguradora
            </label>
            {showAseguradora && (
              <div className="border rounded p-3 mt-2">
                <label className="form-label">Seleccionar aseguradora</label>
                <select
                  className="form-select"
                  value={aseguradora}
                  onChange={(e) => setAseguradora(e.target.value)}
                >
                  <option value="">Seleccione una opción</option>
                  <option value="sin-intermediario">Sin intermediario</option>
                  <option value="mercantil-andina">Mercantil Andina</option>
                  <option value="federacion">Federación Patronal</option>
                </select>
              </div>
            )}
          </div>
        </div>
        <div className="col-12">
          <button
            type="button"
            className="btn btn-primary me-2"
            onClick={() => setShowItems(true)}
          >
            Agregar Items
          </button>
          <button type="submit" className="btn btn-primary">
            Generar Presupuesto
          </button>
        </div>
      </form>
      {showItems && (
        <IndexModal>
          <IndexItems />
        </IndexModal>
      )}
    </>
  );
};

export default Index;
