import ItemCard from "./ItemCard";
import IndexSearch from "../searchBar/Index";
import { items } from "../../models/Item";
import { useState } from "react";
import IndexModal from "../modal/Index";
import IndexForm from "./IndexForm";

const Index = () => {
  const [showForm, setShowForm] = useState(false);
  const [isSelling, setIsSelling] = useState(false);
  return (
    <>
      <h1>Seccion 1</h1>
      <IndexSearch
        actions={["stock"]}
        onAdd={() => setShowForm(true)}
        isSelling={isSelling}
        onToggleSell={setIsSelling}
      />
      <div className="row row-cols-1 row-cols-md-5 g-4 mb-5">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} isSelling={isSelling} />
        ))}
      </div>

      {showForm && (
        <IndexModal>
          <IndexForm OnClose={() => setShowForm(false)} />
        </IndexModal>
      )}
    </>
  );
};

export default Index;
