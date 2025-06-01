import { useEffect, useState } from "react";
import { usuario } from "../firebase/usuarios";

export default function Usuarios() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState({
    id: "",
    Nombre: "",
    Apellido: "",
    Correo: "",
    Celular: "",
    Direccion: "",
    Roles: ["Cliente"],
  });

  const rolesDisponibles = ["Cliente", "Proveedor", "Vendedor"];

  const getData = async () => {
    try {
      const data = await usuario.getUsuarios();
      setLista(data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRolesChange = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      Roles: checked
        ? [...prev.Roles, value]
        : prev.Roles.filter((rol) => rol !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await usuario.updateUsuario(form.id, form);
      } else {
        await usuario.createUsuario(form);
      }
      setForm({
        id: "",
        Nombre: "",
        Apellido: "",
        Correo: "",
        Celular: "",
        Direccion: "",
        Roles: ["Cliente"],
      });
      getData();
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      alert("Error al guardar el usuario");
    }
  };

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      Nombre: item.Nombre || "",
      Apellido: item.Apellido || "",
      Correo: item.Correo || "",
      Celular: item.Celular || "",
      Direccion: item.Direccion || "",
      Roles: item.Roles || ["Cliente"],
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        await usuario.deleteUsuario(id);
        getData();
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        alert("Error al eliminar el usuario");
      }
    }
  };

  const resetForm = () => {
    setForm({
      id: "",
      Nombre: "",
      Apellido: "",
      Correo: "",
      Celular: "",
      Direccion: "",
      Roles: ["Cliente"],
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Gestión de Usuarios</h2>

      <form className="space-y-3 mb-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            name="Nombre"
            placeholder="Nombre"
            value={form.Nombre}
            onChange={handleChange}
            className="border p-2 text-black rounded w-full bg-gray-200"
            required
          />
          
          <input
            type="text"
            name="Apellido"
            placeholder="Apellido"
            value={form.Apellido}
            onChange={handleChange}
            className="border p-2 text-black rounded w-full bg-gray-200"
            required
          />
        </div>

        <input
          type="email"
          name="Correo"
          placeholder="Correo electrónico"
          value={form.Correo}
          onChange={handleChange}
          className="border p-2 text-black rounded w-full bg-gray-200"
          required
        />
        
        <input
          type="tel"
          name="Celular"
          placeholder="Número de celular"
          value={form.Celular}
          onChange={handleChange}
          className="border p-2 text-black rounded w-full bg-gray-200"
          required
        />

        <input
          type="text"
          name="Direccion"
          placeholder="Dirección"
          value={form.Direccion}
          onChange={handleChange}
          className="border p-2 text-black rounded w-full bg-gray-200"
          required
        />

        <div className="bg-gray-100 p-3 rounded">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Roles:
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {rolesDisponibles.map((rol) => (
              <label key={rol} className="flex items-center">
                <input
                  type="checkbox"
                  value={rol}
                  checked={form.Roles.includes(rol)}
                  onChange={handleRolesChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">{rol}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {form.id ? "Actualizar" : "Crear"}
          </button>
          
          {form.id && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="grid gap-4">
        {lista.length === 0 ? (
          <p className="text-gray-500">No hay usuarios registrados</p>
        ) : (
          lista.map((u) => (
            <div
              key={u.id}
              className="border p-4 rounded shadow bg-white"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800">
                    {u.Nombre} {u.Apellido}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <p className="text-gray-600">
                      <strong>Correo:</strong> {u.Correo}
                    </p>
                    <p className="text-gray-600">
                      <strong>Celular:</strong> {u.Celular}
                    </p>
                    <p className="text-gray-600">
                      <strong>Dirección:</strong> {u.Direccion}
                    </p>
                    <div className="text-gray-600">
                      <strong>Roles:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {u.Roles?.map((rol, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {rol}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(u)}
                    className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}