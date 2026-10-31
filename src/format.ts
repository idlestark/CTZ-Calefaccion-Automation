/** Formatos en español (coma decimal). */
export const num = (n: number, dec = 1) => {
  const s = Number(n).toFixed(dec);
  const t = dec > 0 ? s.replace(/\.?0+$/, "") : s;
  return t.replace(".", ",");
};
export const hhmm = (t: string) => t.replace(/^0/, "").slice(0, 5); // 06:58 -> 6:58
export const dmy = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
export const dm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
export const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
export const monthLabel = (key: string) => `${MONTHS[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}`;
export const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
export const pad = (n: number) => String(n).padStart(2, "0");
export const pad2id = (id: number) => String(id).padStart(2, "0");
export const dniFmt = (dni: number | null) => (dni ? String(dni).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "—");
