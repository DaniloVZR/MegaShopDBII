import { useEffect, useState } from "react";
import { descuentos } from "../firebase/descuentos";
import { tipoProducto } from "../firebase/tipoProducto";

export default function Descuentos() {
  const [lista, setLista] = useState([]);
  const [tiposProducto, setTiposProducto] = useState([]);
  const [form, setForm] = useState({
    id: "",
    FechaInicio: "",
    FechaFinal: "",
    Porcentaje: "",
    Id_Tipo: "",
  });

  const getData = async () => {
    const data = await descuentos.getDescuentos();
    setLista(data);
  };

  const getTipos = async () => {
    const tipos = await tipoProducto.getTipoProducto();
    setTiposProducto(tipos);
  };

  useEffect(() => {
    getData();
    getTipos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.id) {
      await descuentos.updateDescuento(form.id, form);
    } else {
      await descuentos.createDescuento(form);
    }
    setForm({
      id: "",
      FechaInicio: "",
      FechaFinal: "",
      Porcentaje: "",
      Id_Tipo: "",
    });
    getData();
  };

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      FechaInicio: item.FechaInicio.toDate().toISOString().slice(0, 10),
      FechaFinal: item.FechaFinal.toDate().toISOString().slice(0, 10),
      Porcentaje: item.Porcentaje,
      Id_Tipo: item.Id_Tipo?.id,
    });
  };

  const handleDelete = async (id) => {
    await descuentos.deleteDescuento(id);
    getData();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Gestión de Descuentos</h2>

      <form className="space-y-2 mb-6" onSubmit={handleSubmit}>
        <input
          type="date"
          name="FechaInicio"
          value={form.FechaInicio}
          onChange={handleChange}
          className="border p-2 text-black rounded w-full bg-gray-200"
          required
        />
        <input
          type="date"
          name="FechaFinal"
          value={form.FechaFinal}
          onChange={handleChange}
          className="border p-2 text-black rounded w-full bg-gray-200"
          required
        />
        <input
          type="number"
          name="Porcentaje"
          placeholder="Porcentaje (%)"
          value={form.Porcentaje}
          onChange={handleChange}
          className="border p-2 text-black rounded w-full bg-gray-200"
          required
        />
        <select
          name="Id_Tipo"
          value={form.Id_Tipo}
          onChange={handleChange}
          className="border p-2 text-black rounded w-full bg-gray-200"
          required
        >
          <option value="">Selecciona un tipo de producto</option>
          {tiposProducto.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nombre || tipo.id}
            </option>
          ))}
        </select>

        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {form.id ? "Actualizar" : "Crear"}
        </button>
      </form>

      <ul className="space-y-4">
        {lista.map((d) => (
          <li
            key={d.id}
            className="border p-4 rounded shadow flex justify-between items-center"
          >
            <div>
              <p>
                <strong>Desde:</strong>{" "}
                {d.FechaInicio.toDate().toLocaleDateString()}
              </p>
              <p>
                <strong>Hasta:</strong>{" "}
                {d.FechaFinal.toDate().toLocaleDateString()}
              </p>
              <p>
                <strong>Porcentaje:</strong> {d.Porcentaje}%
              </p>
              <p>
                <strong>Tipo ID:</strong> {d.tipoNombre}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(d)}
                className="bg-yellow-400 px-3 py-1 rounded"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(d.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
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
