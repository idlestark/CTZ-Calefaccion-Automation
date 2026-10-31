/** Vista previa de la planilla (el mismo HTML que luego se convierte en PDF). */
export default function PlanillaPreview({ html, height = 560 }: { html: string; height?: number }) {
  return (
    <div style={{ background: "var(--c-paper)", padding: 14, borderRadius: 4 }}>
      <iframe title="Planilla" srcDoc={html} sandbox="" style={{ width: "100%", height, border: 0, background: "#fff", display: "block" }} />
    </div>
  );
}
