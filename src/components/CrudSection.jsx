import { useState } from "react";
import { opciones } from "../constants";
import Factura from "./factura";
import Comisiones from "./Comisiones";
import Descuentos from "./Descuentos";
import MetodoPago from "./MetodoPago";
import Productos from "./Productos";
import TipoProducto from "./TipoProducto";
import Usuarios from "./Usuarios";

export const CrudSection = () => {
  const [seleccion, setSeleccion] = useState("factura");

  const renderContenido = () => {
    switch (seleccion) {
      case "factura":
        return <Factura />;
      case "comisiones":
        return <Comisiones />;
      case "descuentos":
        return <Descuentos />;
      case "metodoPago":
         return <MetodoPago />;
      case "productos":
         return <Productos />;
      case "tipoProducto":
         return <TipoProducto />;
      case "usuarios":
         return <Usuarios />;
      default:
        return <p className="text-white">Seleccione una opción</p>;
    }
  };

  return (
    <section id="next-section" className="min-h-screen flex flex-col items-center text-white pt-10">
      <div className="flex flex-wrap gap-4 mb-8 bg-white/10 p-4 rounded-2xl backdrop-blur">
        {opciones.map((op) => (
          <button
            key={op.key}
            className={`flex-1 md:flex-none px-6 py-2 rounded-2xl text-lg font-semibold transition-all duration-300 ${
              seleccion === op.key
                ? "bg-white text-black"
                : "bg-transparent text-white border border-white hover:bg-white hover:text-black"
            }`}
            onClick={() => setSeleccion(op.key)}
          >
            {op.label}
          </button>
        ))}
      </div>

      <div className="w-full max-w-4xl p-4 bg-white/5 rounded-xl shadow-lg">
        {renderContenido()}
      </div>
    </section>
  );
};
