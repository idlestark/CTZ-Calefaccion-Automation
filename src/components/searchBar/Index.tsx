type Action = "stock" | "client" | "record";

type Props = {
  actions?: Action[];
  onAdd?: () => void;
  isSelling?: boolean;
  onToggleSell?: (val: boolean) => void;
};

function Index({ actions, onAdd, isSelling = false, onToggleSell }: Props) {
  return (
    <nav className="navbar bg-body-tertiary">
      <div className="container-fluid p-0">
        <div>
          {actions && actions.includes("stock") && (
            <>
              <button
                className="btn btn-primary me-2"
                type="button"
                onClick={onAdd}
              >
                agregar item
              </button>
              {!isSelling ? (
                <button
                  className="btn btn-primary me-2"
                  type="button"
                  onClick={() => onToggleSell?.(true)}
                >
                  Registrar venta particular
                </button>
              ) : (
                <>
                  <button className="btn btn-warning me-2" type="button">
                    <i className="bi bi-cart-check me-1"></i> (2) items
                  </button>
                  <button className="btn btn-success me-2" type="button">
                    Completar venta
                  </button>
                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={() => onToggleSell?.(false)}
                  >
                    Cancelar venta
                  </button>
                </>
              )}
            </>
          )}
          {actions && actions.includes("client") && (
            <button
              className="btn btn-primary me-2"
              type="button"
              onClick={onAdd}
            >
              agregar Cliente
            </button>
          )}
          {actions && actions.includes("record") && (
            <button className="btn btn-primary me-2" type="button">
              Filtrar
            </button>
          )}
        </div>
        <form className="d-flex" role="search">
          <input
            className="form-control me-2"
            type="search"
            placeholder="Search"
            aria-label="Search"
          />
          <button className="btn btn-outline-success" type="submit">
            Search
          </button>
        </form>
      </div>
    </nav>
  );
}

export default Index;
