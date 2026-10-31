type Props = {
  value?: string;
  onChange?: (v: string) => void;
  onAdd?: () => void;
  addLabel?: string;
};

function Index({ value, onChange, onAdd, addLabel = "Agregar Empleado" }: Props) {
  return (
    <nav className="navbar">
      <div className="container-fluid p-0 mb-2 mt-3">
        <div className="d-flex flex-grow-1" role="search">
          <input
            className="form-control searchBar me-3 pt-2 pb-2"
            placeholder="Buscar"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
          />
          {onAdd && (
            <button className="btn button-orange" type="button" onClick={onAdd}>
              {addLabel}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Index;
