export type Item = {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  equipo: string;
  imagen?: string;
};

export const items: Item[] = [
  {
    id: 1,
    nombre: "Nombre del objeto",
    precio: 99999,
    stock: 99,
    equipo: "Categoria del objeto",
    imagen: "",
  },
  {
    id: 2,
    nombre: "Valvula de Entrada de Agua Doble",
    precio: 9200,
    stock: 8,
    equipo: "Lavarropas",
    imagen: "",
  },
  {
    id: 3,
    nombre: "Correa de Transmision A-510",
    precio: 4500,
    stock: 25,
    equipo: "Lavarropas",
    imagen: "",
  },
  {
    id: 4,
    nombre: "Juego de Rodamientos y Reten 6205",
    precio: 14000,
    stock: 15,
    equipo: "Lavarropas",
    imagen: "",
  },
  {
    id: 5,
    nombre: "Plaqueta Electronica Universal",
    precio: 38000,
    stock: 6,
    equipo: "Lavarropas",
    imagen: "",
  },
];
