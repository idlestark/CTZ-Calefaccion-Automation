import CardEmployee from "./CardEmployee";
import { employees } from "../../models/employee";
import NavSearch from "../searchBar/Index";
import { useState } from "react";
import IndexForm from "./IndexForm";
import ModalIndex from "../modal/Index";

type Props = {};

function Index({}: Props) {
  const [showForm, setShowForm] = useState(false);
  return (
    <>
      <NavSearch onAdd={() => setShowForm(true)} />
      <div className="row row-cols-1 row-cols-md-4 mb-5 g-4">
        {employees.map((employee) => (
          <CardEmployee
            key={employee.id}
            employee={employee}
            onSave={() => {}}
          />
        ))}
      </div>
      {showForm && (
        <ModalIndex>
          <IndexForm onClose={() => setShowForm(false)} />
        </ModalIndex>
      )}
    </>
  );
}

export default Index;
