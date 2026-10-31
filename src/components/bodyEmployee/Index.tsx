import CardEmployee from "./CardEmployee";
import NavSearch from "../searchBar/Index";
import { useCallback, useEffect, useMemo, useState } from "react";
import IndexForm from "./IndexForm";
import Dialog from "../ui/Dialog";
import { call } from "../../api";
import type { Employee } from "../../types";

function Index() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [toDelete, setToDelete] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setEmployees(await call<Employee[]>("employee:getAll"));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar los empleados.");
    }
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => e.name.toLowerCase().includes(q) || String(e.id) === q || String(e.dni ?? "").includes(q));
  }, [employees, query]);

  const msg = (e: unknown) => (e instanceof Error ? e.message : "Error inesperado.");

  return (
    <>
      <NavSearch value={query} onChange={setQuery} onAdd={() => setShowForm(true)} />
      {error && <p className="ctz-error">{error}</p>}
      {!error && employees.length === 0 && <p className="ctz-muted mt-4 text-center">Todavía no hay empleados cargados.</p>}
      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 mb-5 g-4">
        {filtered.map((employee) => (
          <CardEmployee
            key={employee.id}
            employee={employee}
            onDelete={setToDelete}
            onSave={async (u) => {
              try {
                await call("employee:update", u);
                await load();
                return null;
              } catch (e) {
                return msg(e);
              }
            }}
          />
        ))}
      </div>

      {showForm && (
        <Dialog width={440} onClose={() => setShowForm(false)}>
          <IndexForm
            onClose={() => setShowForm(false)}
            onCreate={async (d) => {
              try {
                await call("employee:create", d);
                await load();
                setShowForm(false);
                return null;
              } catch (e) {
                return msg(e);
              }
            }}
          />
        </Dialog>
      )}

      {toDelete && (
        <Dialog width={460} onClose={() => setToDelete(null)}>
          <h3>Eliminar empleado</h3>
          <p>
            ¿Eliminar a <strong>{toDelete.name}</strong>? También se borran sus justificaciones y registros guardados. Los resúmenes mensuales ya generados no se modifican.
          </p>
          <div className="ctz-actions">
            <button
              className="btn btn-danger"
              onClick={async () => {
                try {
                  await call("employee:delete", { id: toDelete.id });
                  await load();
                } catch (e) {
                  setError(msg(e));
                }
                setToDelete(null);
              }}
            >
              Eliminar
            </button>
            <button className="btn btn-soft" onClick={() => setToDelete(null)}>
              Cancelar
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}

export default Index;
