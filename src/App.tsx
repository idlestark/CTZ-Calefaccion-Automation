import NavBar from "./components/navBar/Index";
import BodyEmployee from "./components/bodyEmployee/Index";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import EmployeeFormEdit from "./components/bodyEmployee/IndexForm";
import BodyLogin from "./components/bodyLogin/Index";
import "./App.css";

function App() {
  return (
    <HashRouter>
      <div className="d-flex">
        <NavBar />
        <main className="w-100 main-background">
          <div className="ps-5 pe-5">
            <Routes>
              <Route path="/" element={<Navigate to="employee" replace />} />
              <Route path="/employee" element={<BodyEmployee />} />
              <Route path="/login" element={<BodyLogin />} />
              <Route path="/employee/edit/:id" element={<EmployeeFormEdit />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
