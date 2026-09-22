import NavBar from "./components/navBar/Index";
import BodyItems from "./components/bodyItems/Index";
import BodyReports from "./components/bodyReports/Index";
import BodyReportList from "./components/bodyReportList/Index";
import BodyEmployee from "./components/bodyEmployee/Index";
import { HashRouter, Routes, Route } from "react-router-dom";
import StockEditForm from "../src/components/bodyItems/IndexForm";
import EmployeeFormEdit from "./components/bodyEmployee/IndexForm";
import "./App.css";

function App() {
  return (
    <HashRouter>
      <div className="d-flex">
        <NavBar />
        <main className="w-100 main-background">
          <h1 className="app-title ps-4">Template</h1>
          <div className="ps-5 pe-5">
            <Routes>
              <Route path="/stock" element={<BodyItems />} />
              <Route path="/stock/edit/:id" element={<StockEditForm />} />
              <Route path="/employee" element={<BodyEmployee />} />
              <Route path="/employee/edit/:id" element={<EmployeeFormEdit />} />
              <Route path="/report" element={<BodyReports />} />
              <Route path="/reportList" element={<BodyReportList />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
