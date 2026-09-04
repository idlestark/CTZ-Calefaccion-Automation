import SearchBar from "../searchBar/Index";
import { items } from "../../models/Item";

type Props = {};

function IndexItems({}: Props) {
  return (
    <>
      <SearchBar />
      <div className="overflow-y-auto mt-2 mb-2" style={{ maxHeight: "500px" }}>
        <ol className="list-group list-group mt-2 mb-2">
          {items.map((item) => (
            <li
              className="list-group-item d-flex justify-content-between align-items-center"
              key={item.id}
            >
              {item.nombre}, stock disponible: {item.stock}
              <div>
                <button className="btn btn-primary">Agregar</button>
                <button className="btn btn-danger">Quitar</button>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

export default IndexItems;
