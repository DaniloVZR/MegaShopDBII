import { useEffect, useState } from "react";
import { facturas } from "../firebase/facturas";

function Facturas() {
  const [listaFacturas, setListaFacturas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [productos, setProductos] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    estado: "",
    fecha: "",
    clienteId: "",
    vendedorId: "",
    metodoPagoId: "",
    detalles: [
      {
        cantidad: "",
        idProducto: "",
        precioUnitario: "",
        producto: "",
        subtotal: ""
      }
    ]
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [facturasData, usuariosData, metodosData, productosData] = await Promise.all([
        facturas.getFacturas(),
        facturas.getUsuarios(),
        facturas.getMetodosPago(),
        facturas.getProductos()
      ]);
      
      setListaFacturas(facturasData);
      setUsuarios(usuariosData);
      setMetodosPago(metodosData);
      setProductos(productosData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetalleChange = (index, field, value) => {
    const newDetalles = [...formData.detalles];
    newDetalles[index][field] = value;
    
    // Calcular subtotal automáticamente
    if (field === 'cantidad' || field === 'precioUnitario') {
      const cantidad = parseFloat(field === 'cantidad' ? value : newDetalles[index].cantidad) || 0;
      const precio = parseFloat(field === 'precioUnitario' ? value : newDetalles[index].precioUnitario) || 0;
      newDetalles[index].subtotal = cantidad * precio;
    }
    
    // Auto-completar precio unitario cuando se selecciona un producto
    if (field === 'idProducto' && value) {
      const producto = productos.find(p => p.id === value);
      if (producto && producto.precio) {
        newDetalles[index].precioUnitario = producto.precio;
        newDetalles[index].producto = producto.nombre || producto.Nombre || "";
        
        // Recalcular subtotal si ya hay cantidad
        const cantidad = parseFloat(newDetalles[index].cantidad) || 0;
        if (cantidad > 0) {
          newDetalles[index].subtotal = cantidad * producto.precio;
        }
      }
    }
    
    setFormData((prev) => ({ ...prev, detalles: newDetalles }));
  };

  const agregarDetalle = () => {
    setFormData((prev) => ({
      ...prev,
      detalles: [...prev.detalles, {
        cantidad: "",
        idProducto: "",
        precioUnitario: "",
        producto: "",
        subtotal: ""
      }]
    }));
  };

  const eliminarDetalle = (index) => {
    if (formData.detalles.length > 1) {
      const newDetalles = formData.detalles.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, detalles: newDetalles }));
    }
  };

  const calcularTotal = () => {
    return formData.detalles.reduce((total, detalle) => {
      return total + (parseFloat(detalle.subtotal) || 0);
    }, 0);
  };

  const validarFormulario = () => {
    if (!formData.estado || !formData.fecha || !formData.clienteId || 
        !formData.vendedorId || !formData.metodoPagoId) {
      alert("Por favor complete todos los campos obligatorios");
      return false;
    }

    // Validar que haya al menos un detalle válido
    const detallesValidos = formData.detalles.filter(detalle => 
      detalle.idProducto && 
      parseFloat(detalle.cantidad) > 0 && 
      parseFloat(detalle.precioUnitario) > 0
    );

    if (detallesValidos.length === 0) {
      alert("Debe agregar al menos un producto válido");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    try {
      setLoading(true);
      
      // Filtrar solo detalles válidos
      const detallesValidos = formData.detalles.filter(detalle => 
        detalle.idProducto && 
        parseFloat(detalle.cantidad) > 0 && 
        parseFloat(detalle.precioUnitario) > 0
      );

      const dataToSubmit = {
        ...formData,
        detalles: detallesValidos,
        total: calcularTotal()
      };

      if (modoEdicion) {
        await facturas.updateFactura(formData.id, dataToSubmit);
        alert("Factura actualizada correctamente");
      } else {
        // Generar ID automático si no se proporciona
        if (!formData.id) {
          dataToSubmit.id = `FAC-${Date.now()}`;
        }
        await facturas.createFactura(dataToSubmit);
        alert("Factura creada correctamente");
      }
      
      await cargarDatos();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al guardar factura:", error);
      alert("Error al guardar la factura: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (factura) => {
    setFormData({
      id: factura.id,
      estado: factura.Estado || "",
      fecha: factura.Fecha?.toDate?.()?.toISOString()?.split('T')[0] || "",
      clienteId: factura.clienteNombre ? factura.Cliente?.id || "" : "",
      vendedorId: factura.vendedorNombre ? factura.Vendedor?.id || "" : "",
      metodoPagoId: factura.metodoPagoNombre ? factura.MetodoPago?.id || "" : "",
      detalles: factura.Detalles?.map(detalle => ({
        cantidad: detalle.Cantidad?.toString() || "",
        idProducto: detalle.ID_Producto?.id || "",
        precioUnitario: detalle.PrecioUnitario?.toString() || "",
        producto: detalle.Producto || "",
        subtotal: detalle.Subtotal?.toString() || ""
      })) || [{
        cantidad: "",
        idProducto: "",
        precioUnitario: "",
        producto: "",
        subtotal: ""
      }]
    });
    setModoEdicion(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta factura?")) {
      try {
        setLoading(true);
        await facturas.deleteFactura(id);
        await cargarDatos();
        alert("Factura eliminada correctamente");
      } catch (error) {
        console.error("Error al eliminar factura:", error);
        alert("Error al eliminar la factura");
      } finally {
        setLoading(false);
      }
    }
  };

  const limpiarFormulario = () => {
    setFormData({
      id: "",
      estado: "",
      fecha: "",
      clienteId: "",
      vendedorId: "",
      metodoPagoId: "",
      detalles: [{
        cantidad: "",
        idProducto: "",
        precioUnitario: "",
        producto: "",
        subtotal: ""
      }]
    });
    setModoEdicion(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price || 0);
  };

  if (loading) {
    return (
      <div className="p-4 text-white">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 text-white">
      <h2 className="text-2xl font-bold mb-4">
        {modoEdicion ? "Editar Factura" : "Crear Factura"}
      </h2>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="id"
            placeholder="ID Factura (opcional - se genera automático)"
            value={formData.id}
            onChange={handleChange}
            className="p-2 text-black rounded w-full bg-gray-200"
            disabled={modoEdicion}
          />
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="p-2 text-black rounded w-full bg-gray-200"
            required
          >
            <option value="">Seleccione estado *</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Pagado">Pagado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="fecha"
            type="date"
            value={formData.fecha}
            onChange={handleChange}
            className="p-2 text-black rounded w-full bg-gray-200"
            required
          />
          <select
            name="clienteId"
            value={formData.clienteId}
            onChange={handleChange}
            className="p-2 text-black rounded w-full bg-gray-200"
            required
          >
            <option value="">Seleccione cliente *</option>
            {usuarios.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.Nombre} {usuario.Apellido} - {usuario.Correo}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            name="vendedorId"
            value={formData.vendedorId}
            onChange={handleChange}
            className="p-2 text-black rounded w-full bg-gray-200"
            required
          >
            <option value="">Seleccione vendedor *</option>
            {usuarios.filter(u => u.Roles?.includes('Vendedor') || u.Roles?.includes('Administrador')).map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.Nombre} {usuario.Apellido} - {usuario.Correo}
              </option>
            ))}
          </select>
          <select
            name="metodoPagoId"
            value={formData.metodoPagoId}
            onChange={handleChange}
            className="p-2 text-black rounded w-full bg-gray-200"
            required
          >
            <option value="">Seleccione método de pago *</option>
            {metodosPago.map((metodo) => (
              <option key={metodo.id} value={metodo.id}>
                {metodo.Nombre || metodo.nombre || metodo.id}
              </option>
            ))}
          </select>
        </div>

        {/* DETALLES DE LA FACTURA */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Detalles de la Factura</h3>
            <button
              type="button"
              onClick={agregarDetalle}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
            >
              + Agregar Producto
            </button>
          </div>

          {formData.detalles.map((detalle, index) => (
            <div key={index} className="border border-gray-500 p-3 rounded space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                <select
                  value={detalle.idProducto}
                  onChange={(e) => {
                    handleDetalleChange(index, 'idProducto', e.target.value);
                  }}
                  className="p-2 text-black rounded bg-gray-200 text-sm"
                  required
                >
                  <option value="">Seleccionar Producto</option>
                  {productos.map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre || producto.Nombre || producto.id}
                    </option>
                  ))}
                </select>
                
                <input
                  type="number"
                  placeholder="Cantidad"
                  value={detalle.cantidad}
                  onChange={(e) => handleDetalleChange(index, 'cantidad', e.target.value)}
                  className="p-2 text-black rounded bg-gray-200 text-sm"
                  min="1"
                  step="1"
                  required
                />
                
                <input
                  type="number"
                  step="0.01"
                  placeholder="Precio Unit."
                  value={detalle.precioUnitario}
                  onChange={(e) => handleDetalleChange(index, 'precioUnitario', e.target.value)}
                  className="p-2 text-black rounded bg-gray-200 text-sm"
                  min="0"
                  required
                />
                
                <input
                  type="text"
                  placeholder="Producto"
                  value={detalle.producto}
                  readOnly
                  className="p-2 text-black rounded bg-gray-300 text-sm"
                />
                
                <input
                  type="number"
                  placeholder="Subtotal"
                  value={detalle.subtotal}
                  readOnly
                  className="p-2 text-black rounded bg-gray-300 text-sm"
                />
                
                <button
                  type="button"
                  onClick={() => eliminarDetalle(index)}
                  className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-sm"
                  disabled={formData.detalles.length === 1}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-right">
          <p className="text-xl font-bold">Total: {formatPrice(calcularTotal())}</p>
        </div>

        <div className="space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 px-4 py-2 rounded"
          >
            {loading ? "Guardando..." : (modoEdicion ? "Actualizar Factura" : "Crear Factura")}
          </button>
          {modoEdicion && (
            <button
              type="button"
              onClick={limpiarFormulario}
              className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* LISTA DE FACTURAS */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Facturas Registradas</h3>
        {listaFacturas.length === 0 ? (
          <p className="text-gray-400">No hay facturas registradas</p>
        ) : (
          listaFacturas.map((factura) => (
            <div
              key={factura.id}
              className="border border-gray-400 p-4 rounded bg-gray-800"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <p><strong>ID:</strong> {factura.id}</p>
                  <p><strong>Estado:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      factura.Estado === 'Pagado' ? 'bg-green-600' :
                      factura.Estado === 'Pendiente' ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}>
                      {factura.Estado}
                    </span>
                  </p>
                  <p><strong>Fecha:</strong> {factura.Fecha?.toDate?.()?.toLocaleDateString() || 'N/A'}</p>
                  <p><strong>Total:</strong> {formatPrice(factura.Total)}</p>
                  <p><strong>Cliente:</strong> {factura.clienteNombre || factura.Cliente?.id || 'N/A'}</p>
                  <p><strong>Vendedor:</strong> {factura.vendedorNombre || factura.Vendedor?.id || 'N/A'}</p>
                  <p><strong>Método Pago:</strong> {factura.metodoPagoNombre || factura.MetodoPago?.id || 'N/A'}</p>
                  
                  {factura.Detalles && factura.Detalles.length > 0 && (
                    <div>
                      <strong>Productos:</strong>
                      <div className="ml-4 text-sm space-y-1 mt-1">
                        {factura.Detalles.map((detalle, index) => (
                          <div key={index} className="bg-gray-700 p-2 rounded">
                            <span className="font-medium">{detalle.Producto}</span>
                            <br />
                            <span>Cantidad: {detalle.Cantidad} - Precio: {formatPrice(detalle.PrecioUnitario)} - Subtotal: {formatPrice(detalle.Subtotal)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleEditar(factura)}
                    className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(factura.id)} 
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
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

export default Facturas;