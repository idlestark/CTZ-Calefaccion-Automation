export type Client = {
  id: number;
  nombre: string;
  apellido: string;
  direccion: string;
  observacion?: string;
  celular: string;
  equipos: string[];
};

export const clientesEjemplo: Client[] = [
  {
    id: 1,
    nombre: "Juan",
    apellido: "Pérez",
    direccion: "Av. España 1234",
    observacion: "Complejo Los Olivos, Depto 2B (Timbre B)",
    celular: "2494112233",
    equipos: ["Lavarropas", "Televisor"],
  },
  {
    id: 2,
    nombre: "María",
    apellido: "Gómez",
    direccion: "San Martín 567",
    celular: "2494556677",
    equipos: ["Horno Eléctrico"],
  },
  {
    id: 3,
    nombre: "Lucas",
    apellido: "Martínez",
    direccion: "Mitre 890",
    observacion: "Casa al fondo, portón negro",
    celular: "2494998877",
    equipos: ["Lavarropas", "Horno Eléctrico", "Televisor"],
  },
  {
    id: 4,
    nombre: "Esteban",
    apellido: "Quito",
    direccion: "Av. Colón 412",
    celular: "2494129988",
    observacion: "Edificio Miramar, 4to Piso Depto C. Dejar en portería.",
    equipos: ["Televisor"],
  },
  {
    id: 5,
    nombre: "Florencia",
    apellido: "Pietri",
    direccion: "Quintana 1025",
    celular: "2494334455",
    equipos: ["Lavarropas", "Horno Eléctrico"],
  },
  {
    id: 6,
    nombre: "Mariano",
    apellido: "Iúdica",
    direccion: "Calle 14 de Abril 780",
    celular: "2494778899",
    observacion: "Timbre no funciona, llamar antes de ir.",
    equipos: ["Lavarropas"],
  },
  {
    id: 7,
    nombre: "Patricia",
    apellido: "Sosa",
    direccion: "Pinto 345",
    celular: "2494223344",
    observacion: "Local comercial a la calle. Horario de comercio.",
    equipos: ["Televisor", "Horno Eléctrico"],
  },
  {
    id: 8,
    nombre: "Joaquín",
    apellido: "Sabina",
    direccion: "General Rodríguez 1120",
    celular: "2494665544",
    equipos: ["Lavarropas", "Televisor", "Horno Eléctrico"],
  },
  {
    id: 9,
    nombre: "Camila",
    apellido: "Bordonaba",
    direccion: "Av. Del Valle 890",
    celular: "2494881122",
    observacion: "Barrio Falucho I, Casa 45.",
    equipos: ["Horno Eléctrico"],
  },
  {
    id: 10,
    nombre: "Gastón",
    apellido: "Pauls",
    direccion: "Maipú 210",
    celular: "2494449900",
    equipos: ["Televisor"],
  },
  {
    id: 11,
    nombre: "Romina",
    apellido: "Yan",
    direccion: "Av. Marconi 1530",
    celular: "2494551133",
    observacion: "Complejo de departamentos al fondo, pasillo largo.",
    equipos: ["Lavarropas"],
  },
  {
    id: 12,
    nombre: "Federico",
    apellido: "D'Elía",
    direccion: "Uriburu 640",
    celular: "2494002288",
    equipos: ["Lavarropas", "Televisor"],
  },
  {
    id: 13,
    nombre: "Silvina",
    apellido: "Luna",
    direccion: "Av. Avellaneda 405",
    celular: "2494993311",
    observacion: "Portón reja blanca. Atiende por la tarde.",
    equipos: ["Horno Eléctrico"],
  },
];
