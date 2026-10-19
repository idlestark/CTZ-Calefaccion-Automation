type Props = {
  onAdd?: () => void;
};

function Index({ onAdd }: Props) {
  return (
    <nav className="navbar">
      <div className="container-fluid p-0 mb-2 mt-3">
        <form className="d-flex flex-grow-1" role="search">
          <input
            className="form-control searchBar me-3 pt-2 pb-2"
            list="datalistOptions"
            id="exampleDataList"
            placeholder="Buscar"
          />
          {/* La idea es que la barra se cree una vez y despues se usa para las secciones 
          especificas, por ahora queda con el boton de la parte de empleados, pero despues
          se acomoda */}
          <button className="btn button-orange" type="submit" onClick={onAdd}>
            Agregar Empleado
          </button>
        </form>
      </div>
    </nav>
  );
}

export default Index;
