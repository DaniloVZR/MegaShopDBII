import { useEffect, useState } from "react";
import { tipoProducto } from "../firebase/tipoProducto";

function TipoProducto() {
  const [listaTiposProducto, setListaTiposProducto] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
  });
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const tiposProductoData = await tipoProducto.getTipoProducto();
    setListaTiposProducto(tiposProductoData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (modoEdicion) {
        await tipoProducto.updateTipoProducto(formData.id, { nombre: formData.nombre });
      } else {
        await tipoProducto.createTipoProducto(formData);
      }
      await cargarDatos();
      limpiarFormulario();
    } catch (err) {
      console.error("Error en el formulario de tipo de producto:", err);
    }
  };

  const handleEditar = (tipo) => {
    setFormData({
      id: tipo.id,
      nombre: tipo.nombre,
    });
    setModoEdicion(true);
  };

  const handleEliminar = async (id) => {
    await tipoProducto.deleteTipoProducto(id);
    await cargarDatos();
  };

  const limpiarFormulario = () => {
    setFormData({ id: "", nombre: "" });
    setModoEdicion(false);
  };

  return (
    <div className="p-4 text-white">
      <h2 className="text-2xl font-bold mb-4">
        {modoEdicion ? "Editar Tipo de Producto" : "Crear Tipo de Producto"}
      </h2>

      {/* FORMULARIO */}
      <div className="mb-6 space-y-2">
        <input
          name="id"
          placeholder="ID Tipo de Producto"
          value={formData.id}
          onChange={handleChange}
          className="p-2 text-black rounded w-full bg-gray-200"
          disabled={modoEdicion}
        />
        <input
          name="nombre"
          placeholder="Nombre del tipo de producto"
          value={formData.nombre}
          onChange={handleChange}
          className="p-2 text-black rounded w-full bg-gray-200"
        />
        <div className="space-x-2">
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            {modoEdicion ? "Actualizar Tipo de Producto" : "Crear Tipo de Producto"}
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
        {listaTiposProducto.map((tipo) => (
          <li
            key={tipo.id}
            className="border border-gray-400 p-4 rounded flex justify-between items-center"
          >
            <div>
              <p><strong>ID:</strong> {tipo.id}</p>
              <p><strong>Nombre:</strong> {tipo.nombre}</p>
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
  );
}

export default TipoProducto;