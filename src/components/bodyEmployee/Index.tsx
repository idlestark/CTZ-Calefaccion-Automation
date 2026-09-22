import CardClient from "./CardEmployee";
import { clientesEjemplo } from "../../models/Client";
import NavSearch from "../searchBar/Index";
import { useState } from "react";
import IndexForm from "./IndexForm";
import ModalIndex from "../modal/Index";

type Props = {};

function Index({}: Props) {
  const [showForm, setShowForm] = useState(false);
  return (
    <>
      <h1>Seccion 2</h1>
      <NavSearch actions={["client"]} onAdd={() => setShowForm(true)} />
      <div className="row row-cols-1 row-cols-md-4 mb-5 g-4">
        {clientesEjemplo.map((client) => (
          <CardClient key={client.id} client={client} />
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
