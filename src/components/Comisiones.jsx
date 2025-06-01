import { useEffect, useState } from "react";
import { comisiones } from "../firebase/comisiones";

function Comisiones() {
  const [listaComisiones, setListaComisiones] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    porcentaje: "",
    idMetodoPago: "",
  });
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const comisionesData = await comisiones.getComisiones();
    const metodosData = await comisiones.getMetodosPago();
    setListaComisiones(comisionesData);
    setMetodosPago(metodosData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (modoEdicion) {
        await comisiones.updateComision(formData.id, formData.porcentaje, formData.idMetodoPago);
      } else {
        await comisiones.createComision(formData);
      }
      await cargarDatos();
      limpiarFormulario();
    } catch (err) {
      console.error("Error en el formulario de comisión:", err);
    }
  };

  const handleEditar = (comision) => {
    setFormData({
      id: comision.id,
      porcentaje: comision.Porcentaje,
      idMetodoPago: comision.ID_MetodoPago?.id || "",
    });
    setModoEdicion(true);
  };

  const handleEliminar = async (id) => {
    await comisiones.deleteComision(id);
    await cargarDatos();
  };

  const limpiarFormulario = () => {
    setFormData({ id: "", porcentaje: "", idMetodoPago: "" });
    setModoEdicion(false);
  };

  return (
    <div className="p-4 text-white">
      <h2 className="text-2xl font-bold mb-4">
        {modoEdicion ? "Editar Comisión" : "Crear Comisión"}
      </h2>

      {/* FORMULARIO */}
      <div className="mb-6 space-y-2">
        <input
          name="id"
          placeholder="ID Comisión"
          value={formData.id}
          onChange={handleChange}
          className="p-2 text-black rounded w-full bg-gray-200"
          disabled={modoEdicion}
        />
        <input
          name="porcentaje"
          type="number"
          step="0.01"
          placeholder="Porcentaje (ej: 0.1)"
          value={formData.porcentaje}
          onChange={handleChange}
          className="p-2 text-black rounded w-full bg-gray-200"
        />
        <select
          name="idMetodoPago"
          value={formData.idMetodoPago}
          onChange={handleChange}
          className="p-2 text-black rounded w-full bg-gray-200"
        >
          <option value="">Seleccione un método de pago</option>
          {metodosPago.map((m) => (
            <option key={m.id} value={m.id}>
              {m.id} - {m.Nombre || "Método"}
            </option>
          ))}
        </select>
        <div className="space-x-2">
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            {modoEdicion ? "Actualizar Comisión" : "Crear Comisión"}
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

      {/* LISTA DE COMISIONES */}
      <ul className="space-y-4">
        {listaComisiones.map((comision) => (
          <li
            key={comision.id}
            className="border border-gray-400 p-4 rounded flex justify-between items-center"
          >
            <div>
              <p><strong>ID:</strong> {comision.id}</p>
              <p><strong>Porcentaje:</strong> {comision.Porcentaje}</p>
              <p><strong>ID Método Pago:</strong> {comision.ID_MetodoPago?.id || 'N/A'}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEditar(comision)}
                className="bg-yellow-500 hover:bg-yellow-600 px-2 py-1 rounded"
              >
                Editar
              </button>
              <button
                onClick={() => handleEliminar(comision.id)}
                className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Comisiones;
