type Props = {};

function Index({}: Props) {
  return (
    <>
      <form className="row g-3">
        <h3>Datos del asegurado:</h3>
        <div className="col-md-6">
          <label htmlFor="inputEmail4" className="form-label">
            Siniestro
          </label>
          <input type="text" className="form-control" id="inputEmail4" />
        </div>
        <div className="col-md-6">
          <label htmlFor="inputPassword4" className="form-label">
            Poliza
          </label>
          <input type="text" className="form-control" id="inputPassword4" />
        </div>
        <div className="form-floating">
          <textarea
            className="form-control"
            placeholder="Leave a comment here"
            id="floatingTextarea2"
            style={{ height: "100px" }}
          ></textarea>
          <label htmlFor="floatingTextarea2">Descripcion del siniestro:</label>
        </div>
        <h3>Descripcion del Articulo:</h3>
        <div className="col-md-6">
          <label htmlFor="inputEmail4" className="form-label">
            Marca
          </label>
          <input type="text" className="form-control" id="inputEmail4" />
        </div>
        <div className="col-md-6">
          <label htmlFor="inputEmail4" className="form-label">
            Modelo
          </label>
          <input type="text" className="form-control" id="inputEmail4" />
        </div>
        <div className="form-floating">
          <textarea
            className="form-control"
            placeholder="Leave a comment here"
            id="floatingTextarea2"
            style={{ height: "50px" }}
          ></textarea>
          <label htmlFor="floatingTextarea2">
            Descripcion especifica del bien:
          </label>
        </div>
        <h3>Detalle del daño:</h3>
        <div className="col-md-6">
          <label htmlFor="inputEmail4" className="form-label">
            Estado del bien recibido
          </label>
          <input type="text" className="form-control" id="inputEmail4" />
        </div>
        <div className="col-md-6">
          <label htmlFor="inputEmail4" className="form-label">
            Partes afectadas
          </label>
          <input type="text" className="form-control" id="inputEmail4" />
        </div>
        <div className="form-floating">
          <textarea
            className="form-control"
            placeholder="Leave a comment here"
            id="floatingTextarea2"
            style={{ height: "50px" }}
          ></textarea>
          <label htmlFor="floatingTextarea2">causa del daño:</label>
        </div>
      </form>
    </>
  );
}

export default Index;
