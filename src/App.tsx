import NavBar from "./components/navBar/Index";
import BodyEmployee from "./components/bodyEmployee/Index";
import { HashRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import EmployeeHistory from "./components/bodyHistory/Index";
import BodyLogin from "./components/bodyLogin/Index";
import "./App.css";

// 1. Creamos un Layout para las pantallas que sí llevan la barra lateral
function MainLayout() {
  return (
    <div className="d-flex">
      <NavBar />
      <main className="w-100 main-background">
        <div className="ps-5 pe-5">
          <Outlet /> {/* Aquí adentro se inyectan las rutas hijas (employee, history, etc.) */}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* 2. Ruta de Login independiente (NO pasa por MainLayout, así no tiene NavBar) */}
        <Route path="/login" element={<BodyLogin />} />

        {/* 3. Rutas protegidas/principales (Envueltas en MainLayout) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="login" replace />} /> {/* Opcional: que inicie en el login */}
          <Route path="/employee" element={<BodyEmployee />} />
          <Route path="/employee/:id/history" element={<EmployeeHistory />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;