export {};

declare global {
  interface Window {
    ctzAPI: {
      //SECCION EMPLEADO

      getAllEmployee: () => Promise<
        {
          id: number;
          name: string;
          dni: number;
        }[]
      >;
    };
  }
}
