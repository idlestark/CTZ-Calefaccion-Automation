export type Report = {
  id: number;
  nombre_cliente: string;
  codigo_equipo: string;
  direccion: string;
  numero_telefono: number;
  ciudad: string;
  costo_adicional: number;
  descripcion: string;
  observaciones: string;
  fecha: string;
  asegurado?: boolean;
};
export const reports: Report[] = [
  {
    id: 1,
    nombre_cliente: "Carlos Gómez",
    codigo_equipo: "LAV-L7010",
    direccion: "Av. España 452",
    numero_telefono: 2494123456,
    ciudad: "Tandil",
    costo_adicional: 4500,
    descripcion:
      "Lavarropas no realiza el ciclo de centrifugado y ruidos metálicos.",
    observaciones:
      "Se reemplazó la bomba de desagote. El cliente solicita factura A.",
    fecha: "2026-08-15",
    asegurado: true,
  },
  {
    id: 2,
    nombre_cliente: "María Elena Rodríguez",
    codigo_equipo: "HOR-HE45L",
    direccion: "Mitre 1280",
    numero_telefono: 2494654321,
    ciudad: "Tandil",
    costo_adicional: 0,
    descripcion:
      "Horno eléctrico no levanta temperatura en la resistencia inferior.",
    observaciones: "Cambio de termostato preventivo. Probado en taller.",
    fecha: "2026-08-18",
    asegurado: false,
  },
  {
    id: 3,
    nombre_cliente: "Juan Pablo Martínez",
    codigo_equipo: "TV-LG55U",
    direccion: "Belgrano 890",
    numero_telefono: 2494987654,
    ciudad: "Tandil",
    costo_adicional: 12000,
    descripcion:
      "Smart TV prende pero no da imagen (pantalla negra con audio).",
    observaciones: "Reemplazo completo de tira de LEDs por desgaste.",
    fecha: "2026-08-20",
    asegurado: true,
  },
  {
    id: 4,
    nombre_cliente: "Lucía Fernández",
    codigo_equipo: "LAV-DRE60",
    direccion: "Sarmiento 312",
    numero_telefono: 2494332211,
    ciudad: "Tandil",
    costo_adicional: 2500,
    descripcion: "Pérdida de agua por la parte inferior durante el llenado.",
    observaciones:
      "Fisura en la manguera de admisión. Se coloca repuesto original.",
    fecha: "2026-08-22",
    asegurado: false,
  },
  {
    id: 5,
    nombre_cliente: "Roberto Sánchez",
    codigo_equipo: "HOR-PE500",
    direccion: "Av. Rivadavia 1540",
    numero_telefono: 2494556677,
    ciudad: "Tandil",
    costo_adicional: 0,
    descripcion: "Salta la llave térmica al encender el spiedo o convector.",
    observaciones:
      "Cortocircuito en el selector de funciones. Cambio de selector.",
    fecha: "2026-08-25",
    asegurado: false,
  },
  {
    id: 6,
    nombre_cliente: "Ana Laura Torres",
    codigo_equipo: "TV-SAMS43",
    direccion: "Chacabuco 620",
    numero_telefono: 2494889900,
    ciudad: "Tandil",
    costo_adicional: 8500,
    descripcion:
      "Televisor no enciende tras tormenta eléctrica (LED de standby apagado).",
    observaciones:
      "Reparación de la fuente de alimentación. Quemado por sobretensión.",
    fecha: "2026-08-27",
    asegurado: true,
  },
  {
    id: 7,
    nombre_cliente: "Gonzalo Benítez",
    codigo_equipo: "LAV-WH80A",
    direccion: "Pinto 745",
    numero_telefono: 2494114477,
    ciudad: "Tandil",
    costo_adicional: 6000,
    descripcion:
      "Lavarropas traba la escotilla y no deja abrir la puerta al finalizar.",
    observaciones: "Se cambió el blocapuertas térmico.",
    fecha: "2026-08-28",
    asegurado: true,
  },
  {
    id: 8,
    nombre_cliente: "Sofia Rossi",
    codigo_equipo: "HOR-ATMA30",
    direccion: "Alem 1050",
    numero_telefono: 2494225588,
    ciudad: "Tandil",
    costo_adicional: 0,
    descripcion: "El timer mecánico no corta ni retrocede automáticamente.",
    observaciones: "Cambio de timer de 60 minutos.",
    fecha: "2026-08-29",
    asegurado: false,
  },
  {
    id: 9,
    nombre_cliente: "Diego Morales",
    codigo_equipo: "TV-PHIL50",
    direccion: "San Martín 210",
    numero_telefono: 2494663300,
    ciudad: "Tandil",
    costo_adicional: 15000,
    descripcion:
      "Reinicios constantes en el logo de la marca (loop de arranque).",
    observaciones: "Reinstalación de firmware en placa Main vía USB.",
    fecha: "2026-08-31",
    asegurado: false,
  },
  {
    id: 10,
    nombre_cliente: "Valeria Castro",
    codigo_equipo: "LAV-PAT100",
    direccion: "Av. Santamarina 830",
    numero_telefono: 2494771122,
    ciudad: "Tandil",
    costo_adicional: 3000,
    descripcion:
      "Vibraciones excesivas durante el lavado y desplazamiento del equipo.",
    observaciones:
      "Reemplazo de los dos amortiguadores inferiores desgastados.",
    fecha: "2026-09-01",
    asegurado: true,
  },
];
