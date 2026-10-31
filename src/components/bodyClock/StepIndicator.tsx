export default function StepIndicator({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <div className="wiz-steps" aria-label={`Paso ${step} de 4`}>
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="d-flex align-items-center">
          {n > 1 && <div className="wiz-line" />}
          <div className={`wiz-dot ${n < step ? "done" : n === step ? "current" : ""}`}>{n === step ? n : ""}</div>
        </div>
      ))}
    </div>
  );
}
