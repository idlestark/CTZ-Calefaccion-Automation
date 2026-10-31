export type Role = "admin" | "subadmin";
export type SessionUser = { id: number; username: string; name: string; role: Role };

export type Employee = { id: number; name: string; dni: number | null };

export type GradeKey = "puntualidad" | "presentismo" | "medio" | "ninguno";

export type RawRecord = { employeeId: number; name: string; date: string; time: string };
export type ManualMark = { employeeId: number; date: string; time: string; note?: string };

export type ParsedClock = {
  monthKey: string;
  monthLabel: string;
  year: number;
  month: number;
  records: RawRecord[];
  employees: { id: number; name: string }[];
  invalidRows: number;
  droppedOtherMonths: number;
  alreadyProcessed: boolean;
};

export type DayMark = { time: string; kind: "Ingreso" | "Egreso"; manual: boolean };
export type DayRow = {
  date: string;
  label: string;
  hours: number | null;
  status: "ok" | "absent" | "justified" | "missing";
  reviewed: boolean;
  marks: DayMark[];
  justification: { reason: string; hours: number } | null;
};

export type PlanillaRow = {
  id: number; name: string; hs: number; comp: number; fer: number;
  enf: number; art: number; lic: number; otro: number; total: number; bonus: number;
};

export type EmployeeResult = {
  id: number;
  name: string;
  dni: number | null;
  grade: GradeKey;
  gradeLevel: number;
  gradeLabel: string;
  stats: {
    hoursWorked: number; extraHours: number; late: number; exits: number; exitHours: number;
    halfAbs: number; fullAbs: number; earlyExits: number;
  };
  planilla: PlanillaRow;
  days: DayRow[];
};

export type MissingDay = { date: string; marks: string[]; suggestion: "entrada" | "salida"; standardTime: string | null };
export type Alert =
  | { kind: "newEmployee"; employeeId: number; name: string }
  | { kind: "missing"; employeeId: number; name: string; days: MissingDay[] }
  | { kind: "near"; employeeId: number; name: string; target: GradeKey; targetLabel: string; dates: string[]; minutes: number; incident: "arrival" | "exit" }
  | { kind: "nonWorkingMarks"; employeeId: number; name: string; dates: string[] };

export type Analysis = {
  monthKey: string; year: number; month: number; title: string;
  employees: EmployeeResult[]; alerts: Alert[]; blocked: boolean; holidays: string[];
};

export type Summary = {
  monthKey: string; year: number; month: number; monthName: string; title: string;
  generatedAt: string; holidays: string[]; employees: EmployeeResult[];
};

export type Reason = { id: number; name: string };
export type Justification = {
  id: number; employee_id: number; employee_name: string; employee_dni: number | null;
  reason_id: number; reason_name: string; description: string | null;
  start_date: string; end_date: string | null; hours: number;
};

export type Settings = Record<string, number | string | boolean>;

export type LocalInfo = {
  mode: "host" | "client"; hostUrl: string; port: number; address: string | null;
  serverError: string | null; backupsDir: string; pdfDir: string;
};
