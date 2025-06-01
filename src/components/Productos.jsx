import { useEffect, useState } from "react";
import { producto } from "../firebase/productos";
import { tipoProducto } from "../firebase/tipoProducto";
import { usuario } from "../firebase/usuarios";

export default function Productos() {
  const [lista, setLista] = useState([]);
  const [tiposProducto, setTiposProducto] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({
    id: "",
    nombre: "",
    precio: "",
    proveedor: "",
    tipo: "",
  });

  const getData = async () => {
    try {
      const data = await producto.getProductos();
      setLista(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  const getTipos = async () => {
    try {
      const tipos = await tipoProducto.getTipoProducto();
      setTiposProducto(tipos);
    } catch (error) {
      console.error("Error al cargar tipos:", error);
    }
  };

  const getUsuarios = async () => {
    try {
      const usuariosData = await usuario.getUsuarios();
      setUsuarios(usuariosData);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  useEffect(() => {
    getData();
    getTipos();
    getUsuarios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await producto.updateProducto(form.id, form);
      } else {
        await producto.createProducto(form);
      }
      setForm({
        id: "",
        nombre: "",
        precio: "",
        proveedor: "",
        tipo: "",
      });
      getData();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert("Error al guardar el producto");
    }
  };

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      nombre: item.nombre,
      precio: item.precio,
      proveedor: item.proveedor?.id || "",
      tipo: item.tipo?.id || "",
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await producto.deleteProducto(id);
        getData();
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        alert("Error al eliminar el producto");
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Gestión de Productos</h2>

      <form className="space-y-2 mb-6" onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre del producto"
          value={form.nombre}
          onChange={handleChange}
          className="border p-2 text-black rounded w-full bg-gray-200"
          required
        />
        
        <input
          type="number"
          name="precio"
          placeholder="Precio"
          value={form.precio}
          onChange={handleChange}
          className="border p-2 text-black rounded w-full bg-gray-200"
          required
          min="0"
          step="0.01"
        />
        
        <select
          name="proveedor"
          value={form.proveedor}
          onChange={handleChange}
          className="border p-2 text-black rounded w-full bg-gray-200"
          required
        >
          <option value="">Selecciona un proveedor</option>
          {usuarios.map((usr) => (
            <option key={usr.id} value={usr.id}>
              {`${usr.Nombre || ""} ${usr.Apellido || ""}`.trim() || usr.Correo || usr.id}
            </option>
          ))}
        </select>

        <select
          name="tipo"
          value={form.tipo}
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
        
        {form.id && (
          <button
            type="button"
            onClick={() => setForm({
              id: "",
              nombre: "",
              precio: "",
              proveedor: "",
              tipo: "",
            })}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2"
          >
            Cancelar
          </button>
        )}
      </form>

      <div className="grid gap-4">
        {lista.length === 0 ? (
          <p className="text-gray-500">No hay productos registrados</p>
        ) : (
          lista.map((p) => (
            <div
              key={p.id}
              className="border p-4 rounded shadow flex justify-between items-center bg-white"
            >
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800">{p.nombre}</h3>
                <p className="text-gray-600">
                  <strong>Precio:</strong> {formatPrice(p.precio)}
                </p>
                <p className="text-gray-600">
                  <strong>Proveedor:</strong> {p.proveedorNombre}
                </p>
                <p className="text-gray-600">
                  <strong>Tipo:</strong> {p.tipoNombre}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}