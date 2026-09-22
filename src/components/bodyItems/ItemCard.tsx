import "./ItemCard.css";
import type { Item } from "../../models/Item";
import { useState } from "react";
import IndexEditForm from "./IndexForm";
import IndexModal from "../modal/Index";
import { NavLink } from "react-router-dom";

type Props = {
  item: Item;
  isSelling?: boolean;
};

function ItemCard({ item, isSelling }: Props) {
  const [edit] = useState(false);
  return (
    <>
      <div className="col pt-4">
        <div className="card h-100 shadow-sm">
          <img
            src=""
            className="img-fluid card-img-top w-100"
            alt="Aca va la imagen del producto"
            style={{ height: "200px", objectFit: "contain" }}
          />

          <div className="card-body">
            <h4 className="card-title">Nombre: {item.nombre}</h4>
            <h6>Id: {item.id}</h6>
            <h5>Precio: {item.precio}</h5>
            <h5>Categoria: {item.equipo}</h5>
            <h4>Stock disponible: {item.stock}</h4>
            <NavLink
              to={`/stock/edit/${item.id}`}
              className="btn btn-success me-1"
            >
              editar
            </NavLink>
            {isSelling && (
              <button className="btn btn-primary me-1" type="button">
                Agregar al carrito
              </button>
            )}
          </div>
        </div>
      </div>
      {edit && (
        <IndexModal>
          <IndexEditForm item={item} edit={true} />
        </IndexModal>
      )}
    </>
  );
}

export default ItemCard;
