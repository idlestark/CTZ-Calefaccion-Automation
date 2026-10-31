import { useState } from "react";
import "../../styles/custom.css";

type Props = {
  onClose: () => void;
  onCreate: (data: { id: number; name: string; dni: string }) => Promise<string | null>;
  initial?: { id?: number; name?: string };
};

/** Alta de empleado. El ID es el número que el reloj le asigna (necesario para cruzar los registros). */
function IndexForm({ onClose, onCreate, initial }: Props) {
  const [form, setForm] = useState({ id: initial?.id ? String(initial.id) : "", name: initial?.name ?? "", dni: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const change = (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const valid = Number(form.id) > 0 && form.name.trim() !== "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    const err = await onCreate({ id: Number(form.id), name: form.name, dni: form.dni });
    setBusy(false);
    if (err) setError(err);
  };

  return (
    <form className="p-3" onSubmit={submit}>
      <h1 className="modal-title fs-4 mb-3 text-center">Agregar empleado</h1>
      <div className="mb-3">
        <label className="form-label">Nombre y apellido</label>
        <input name="name" type="text" className="form-control input-dark" value={form.name} onChange={change} autoFocus />
      </div>
      <div className="mb-3">
        <label className="form-label">Número de documento</label>
        <input name="dni" type="number" className="form-control input-dark" value={form.dni} onChange={change} />
      </div>
      <div className="mb-3">
        <label className="form-label">ID del reloj</label>
        <input name="id" type="number" className="form-control input-dark" value={form.id} onChange={change} disabled={!!initial?.id} />
      </div>
      {error && <p className="ctz-error">{error}</p>}
      <div className="d-flex justify-content-center gap-2">
        <button type="submit" className="btn button-orange" disabled={!valid || busy}>
          Agregar
        </button>
        <button type="button" className="btn button-transluce" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default IndexForm;
