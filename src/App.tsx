import { HashRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import NavBar from "./components/navBar/Index";
import BodyEmployee from "./components/bodyEmployee/Index";
import EmployeeHistory from "./components/bodyHistory/Index";
import MonthHistory from "./components/bodyHistory/MonthHistory";
import MonthView from "./components/bodyHistory/MonthView";
import BodyLogin from "./components/bodyLogin/Index";
import Clock from "./components/bodyClock/Index";
import Justifications from "./components/bodyJustification/Index";
import Settings from "./components/bodySettings/Index";
import { AuthProvider, RequireAuth, homeFor, useAuth } from "./auth";
import "./App.css";

// Layout de las pantallas que llevan barra lateral
function MainLayout() {
  return (
    <div className="d-flex">
      <NavBar />
      <main className="w-100 main-background">
        <div className="ctz-page">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function Home() {
  const { user } = useAuth();
  return <Navigate to={user ? homeFor(user.role) : "/login"} replace />;
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<BodyLogin />} />
          <Route path="/" element={<Home />} />

          <Route element={<MainLayout />}>
            {/* Solo administrador */}
            <Route element={<RequireAuth roles={["admin"]} />}>
              <Route path="/reloj" element={<Clock />} />
              <Route path="/employee" element={<BodyEmployee />} />
              <Route path="/employee/:id/history" element={<EmployeeHistory />} />
            </Route>
            {/* Ambos roles */}
            <Route element={<RequireAuth />}>
              <Route path="/justificaciones" element={<Justifications />} />
              <Route path="/historial" element={<MonthHistory />} />
              <Route path="/historial/:month" element={<MonthView />} />
              <Route path="/ajustes" element={<Settings />} />
            </Route>
          </Route>
          <Route path="*" element={<Home />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
