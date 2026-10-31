import "./clock.css";
import { useCallback, useState } from "react";
import { call } from "../../api";
import StepIndicator from "./StepIndicator";
import UploadStep from "./UploadStep";
import CalendarStep from "./CalendarStep";
import AlertsStep from "./AlertsStep";
import type { Patch } from "./AlertsStep";
import ReviewStep from "./ReviewStep";
import PreviewStep from "./PreviewStep";
import type { Analysis, ManualMark, ParsedClock, Summary } from "../../types";

type Inputs = { holidays: string[]; manual: ManualMark[]; dismissed: string[]; ignored: string[] };

/** Procesador del reloj: 1 cargar CSV · 2 días no laborales · 3 alertas · 4 último vistazo · 5 vista previa. */
export default function Clock() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [parsed, setParsed] = useState<ParsedClock | null>(null);
  const [inputs, setInputs] = useState<Inputs>({ holidays: [], manual: [], dismissed: [], ignored: [] });
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [result, setResult] = useState<{ summary: Summary; html: string; backup: string | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const msg = (e: unknown) => (e instanceof Error ? e.message : "Error inesperado.");

  const analyze = useCallback(
    async (next: Inputs, p: ParsedClock | null = parsed): Promise<boolean> => {
      if (!p) return false;
      setBusy(true);
      setError(null);
      try {
        const a = await call<Analysis>("clock:analyze", {
          monthKey: p.monthKey,
          records: p.records,
          holidays: next.holidays,
          manual: next.manual,
          dismissed: next.dismissed,
          ignoredMarks: next.ignored,
        });
        setInputs(next);
        setAnalysis(a);
        return true;
      } catch (e) {
        setError(msg(e));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [parsed],
  );

  const reset = () => {
    setStep(1);
    setParsed(null);
    setAnalysis(null);
    setResult(null);
    setError(null);
    setInputs({ holidays: [], manual: [], dismissed: [], ignored: [] });
  };

  const toggleHoliday = (date: string) =>
    setInputs((p) => ({ ...p, holidays: p.holidays.includes(date) ? p.holidays.filter((d) => d !== date) : [...p.holidays, date] }));

  const applyPatch = (patch: Patch) =>
    analyze({
      ...inputs,
      manual: patch.manual ?? inputs.manual,
      dismissed: patch.dismissed ?? inputs.dismissed,
      ignored: patch.ignored ?? inputs.ignored,
    });

  const finish = async () => {
    if (!parsed) return;
    setBusy(true);
    setError(null);
    try {
      const r = await call<{ summary: Summary; html: string; backup: string | null }>("clock:finalize", {
        monthKey: parsed.monthKey,
        records: parsed.records,
        holidays: inputs.holidays,
        manual: inputs.manual,
        dismissed: inputs.dismissed,
        ignoredMarks: inputs.ignored,
      });
      setResult(r);
      setStep(5);
    } catch (e) {
      setError(msg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {step < 5 && <StepIndicator step={step as 1 | 2 | 3 | 4} />}

      {step === 1 && (
        <UploadStep
          onParsed={(p) => {
            setParsed(p);
            setInputs({ holidays: [], manual: [], dismissed: [], ignored: [] });
            setAnalysis(null);
            setError(null);
            setStep(2);
          }}
        />
      )}

      {step === 2 && parsed && (
        <CalendarStep
          parsed={parsed}
          holidays={inputs.holidays}
          onToggle={toggleHoliday}
          onBack={reset}
          busy={busy}
          error={error}
          onNext={async () => {
            if (await analyze(inputs)) setStep(3);
          }}
        />
      )}

      {step === 3 && analysis && (
        <AlertsStep
          analysis={analysis}
          manual={inputs.manual}
          dismissed={inputs.dismissed}
          ignored={inputs.ignored}
          busy={busy}
          error={error}
          onApply={applyPatch}
          onRefresh={() => analyze(inputs)}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}

      {step === 4 && analysis && <ReviewStep analysis={analysis} busy={busy} error={error} onBack={() => setStep(3)} onFinish={finish} />}

      {step === 5 && result && parsed && <PreviewStep html={result.html} monthKey={parsed.monthKey} backup={result.backup} onClose={reset} />}
    </div>
  );
}
