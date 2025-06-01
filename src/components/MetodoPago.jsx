import { useEffect, useState } from "react";
import { metodoPago } from "../firebase/metodoPago";

const MetodoPago = () => {
  const [listaMetodosPago, setListaMetodosPago] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    Metodo: "",
  });
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const metodosPagoData = await metodoPago.getMetodoPago();
    setListaMetodosPago(metodosPagoData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (modoEdicion) {
        console.log(formData)
        await metodoPago.updateMetodoPago(formData.id, { Metodo: formData.Metodo });
      } else {
        console.log(formData)
        await metodoPago.createMetodoPago(formData);
      }
      await cargarDatos();
      limpiarFormulario();
    } catch (err) {
      console.error("Error en el formulario de metodo de pago:", err);
    }
  };

  const handleEditar = (tipo) => {
    setFormData({
      id: tipo.id,
      Metodo: tipo.Metodo,
    });
    setModoEdicion(true);
  };

  const handleEliminar = async (id) => {
    await metodoPago.deleteMetodoPago(id);
    await cargarDatos();
  };

  const limpiarFormulario = () => {
    setFormData({ id: "", Metodo: "" });
    setModoEdicion(false);
  };


  return (
    <div className="p-4 text-white">
      <h2 className="text-2xl font-bold mb-4">
        {modoEdicion ? "Editar Metodo de Pago" : "Crear Metodo de Pago"}
      </h2>

      {/* FORMULARIO */}
      <div className="mb-6 space-y-2">
        <input
          name="id"
          placeholder="ID Metodo de Pago"
          value={formData.id}
          onChange={handleChange}
          className="p-2 text-black rounded w-full bg-gray-200"
          disabled={modoEdicion}
        />
        <input
          name="Metodo"
          placeholder="Nombre del metodo de pago"
          value={formData.Metodo}
          onChange={handleChange}
          className="p-2 text-black rounded w-full bg-gray-200"
        />
        <div className="space-x-2">
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            {modoEdicion ? "Actualizar Metodo de Pago" : "Crear Metodo de Pago"}
          </button>
          {modoEdicion && (
            <button
              onClick={limpiarFormulario}
              className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* LISTA DE TIPOS DE PRODUCTO */}
      <ul className="space-y-4">
        {listaMetodosPago.map((tipo) => (
          <li
            key={tipo.id}
            className="border border-gray-400 p-4 rounded flex justify-between items-center"
          >
            <div>
              <p><strong>ID:</strong> {tipo.id}</p>
              <p><strong>Método:</strong> {tipo.Metodo}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEditar(tipo)}
                className="bg-yellow-500 hover:bg-yellow-600 px-2 py-1 rounded"
              >
                Editar
              </button>
              <button
                onClick={() => handleEliminar(tipo.id)}
                className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MetodoPago