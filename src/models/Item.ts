import imagen from "../assets/mc-logo.png";

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
    imagen,
  },
  {
    id: 2,
    nombre: "Valvula de Entrada de Agua Doble",
    precio: 9200,
    stock: 8,
    equipo: "Lavarropas",
    imagen,
  },
  {
    id: 3,
    nombre: "Correa de Transmision A-510",
    precio: 4500,
    stock: 25,
    equipo: "Lavarropas",
    imagen,
  },
  {
    id: 4,
    nombre: "Juego de Rodamientos y Reten 6205",
    precio: 14000,
    stock: 15,
    equipo: "Lavarropas",
    imagen,
  },
  {
    id: 5,
    nombre: "Plaqueta Electronica Universal",
    precio: 38000,
    stock: 6,
    equipo: "Lavarropas",
    imagen,
  },
  {
    id: 6,
    nombre: "Amortiguador 120N",
    precio: 8900,
    stock: 18,
    equipo: "Lavarropas",
    imagen,
  },

  // --- Hornos Eléctricos ---
  {
    id: 7,
    nombre: "Resistencia Superior 800W",
    precio: 12500,
    stock: 10,
    equipo: "Horno Eléctrico",
    imagen,
  },
  {
    id: 8,
    nombre: "Termostato Regutable 50-250°C",
    precio: 7800,
    stock: 14,
    equipo: "Horno Eléctrico",
    imagen,
  },
  {
    id: 9,
    nombre: "Timer Mecanico 60 Minutos",
    precio: 9500,
    stock: 9,
    equipo: "Horno Eléctrico",
    imagen,
  },
  {
    id: 10,
    nombre: "Selector de Funcion 4 Posiciones",
    precio: 6200,
    stock: 20,
    equipo: "Horno Eléctrico",
    imagen,
  },
  {
    id: 11,
    nombre: "Vidrio Templado Frontal 45L",
    precio: 21000,
    stock: 4,
    equipo: "Horno Eléctrico",
    imagen,
  },

  // --- Televisores ---
  {
    id: 12,
    nombre: "Kit Tiras LED 32 Pulgadas (3 tiras)",
    precio: 24500,
    stock: 11,
    equipo: "Televisor",
    imagen,
  },
  {
    id: 13,
    nombre: 'Fuente de Alimentacion Smart TV 43"',
    precio: 42000,
    stock: 5,
    equipo: "Televisor",
    imagen,
  },
  {
    id: 14,
    nombre: "Placa Main Universal HDMI/VGA",
    precio: 51000,
    stock: 3,
    equipo: "Televisor",
    imagen,
  },
  {
    id: 15,
    nombre: "Control Remoto Universal Smart TV",
    precio: 8500,
    stock: 30,
    equipo: "Televisor",
    imagen,
  },
  // --- Repuestos adicionales ---
  {
    id: 16,
    nombre: "Presostato Doble Nivel",
    precio: 11200,
    stock: 10,
    equipo: "Lavarropas",
    imagen,
  },
  {
    id: 17,
    nombre: "Blocapuertas Termico 3 Contactos",
    precio: 8700,
    stock: 16,
    equipo: "Lavarropas",
    imagen,
  },
  {
    id: 18,
    nombre: "Motor Convector para Horno",
    precio: 18900,
    stock: 6,
    equipo: "Horno Eléctrico",
    imagen,
  },
  {
    id: 19,
    nombre: "Placa T-Con Full HD",
    precio: 29500,
    stock: 4,
    equipo: "Televisor",
    imagen,
  },
  {
    id: 20,
    nombre: "Cable Flex LVDS 30 Pines",
    precio: 5400,
    stock: 22,
    equipo: "Televisor",
    imagen,
  },
];
