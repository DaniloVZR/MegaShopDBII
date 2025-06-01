import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './config.js';

// Obtener todas las facturas con datos relacionados
async function getFacturas() {
    try {
        const facturasSnapshot = await getDocs(collection(db, "Factura"));
        
        const facturas = await Promise.all(
            facturasSnapshot.docs.map(async (docSnap) => {
                const data = docSnap.data();
                let clienteNombre = "Sin cliente";
                let vendedorNombre = "Sin vendedor";
                let metodoPagoNombre = "Sin método";

                // Obtener nombre del cliente
                if (data.Cliente) {
                    try {
                        const clienteSnap = await getDoc(data.Cliente);
                        if (clienteSnap.exists()) {
                            const clienteData = clienteSnap.data();
                            clienteNombre = `${clienteData.Nombre || ""} ${clienteData.Apellido || ""}`.trim() || 
                                          clienteData.Correo || "Sin nombre";
                        }
                    } catch (error) {
                        console.error("Error al obtener cliente:", error);
                    }
                }

                // Obtener nombre del vendedor
                if (data.Vendedor) {
                    try {
                        const vendedorSnap = await getDoc(data.Vendedor);
                        if (vendedorSnap.exists()) {
                            const vendedorData = vendedorSnap.data();
                            vendedorNombre = `${vendedorData.Nombre || ""} ${vendedorData.Apellido || ""}`.trim() || 
                                           vendedorData.Correo || "Sin nombre";
                        }
                    } catch (error) {
                        console.error("Error al obtener vendedor:", error);
                    }
                }

                // Obtener nombre del método de pago
                if (data.MetodoPago) {
                    try {
                        const metodoSnap = await getDoc(data.MetodoPago);
                        if (metodoSnap.exists()) {
                            const metodoData = metodoSnap.data();
                            metodoPagoNombre = metodoData.Nombre || metodoData.nombre || "Sin nombre";
                        }
                    } catch (error) {
                        console.error("Error al obtener método de pago:", error);
                    }
                }

                // Procesar detalles para obtener nombres de productos
                let detallesConNombres = [];
                if (data.Detalles && Array.isArray(data.Detalles)) {
                    detallesConNombres = await Promise.all(
                        data.Detalles.map(async (detalle) => {
                            let nombreProducto = detalle.Producto || "Producto desconocido";
                            
                            // Si no hay nombre del producto, intentar obtenerlo de la referencia
                            if (detalle.ID_Producto && !detalle.Producto) {
                                try {
                                    const productoSnap = await getDoc(detalle.ID_Producto);
                                    if (productoSnap.exists()) {
                                        const productoData = productoSnap.data();
                                        nombreProducto = productoData.nombre || productoData.Nombre || "Producto desconocido";
                                    }
                                } catch (error) {
                                    console.error("Error al obtener producto:", error);
                                }
                            }

                            return {
                                ...detalle,
                                Producto: nombreProducto
                            };
                        })
                    );
                }

                return {
                    id: docSnap.id,
                    ...data,
                    clienteNombre,
                    vendedorNombre,
                    metodoPagoNombre,
                    Detalles: detallesConNombres
                };
            })
        );

        // Ordenar por fecha (más recientes primero)
        return facturas.sort((a, b) => {
            const fechaA = a.Fecha?.toDate ? a.Fecha.toDate() : new Date(0);
            const fechaB = b.Fecha?.toDate ? b.Fecha.toDate() : new Date(0);
            return fechaB - fechaA;
        });
        
    } catch (error) {
        console.error("Error al obtener facturas:", error);
        throw error;
    }
}

// Crear una nueva factura
async function createFactura({ 
    id, 
    estado, 
    fecha, 
    total, 
    clienteId, 
    vendedorId, 
    metodoPagoId, 
    detalles 
}) {
    try {
        // Validaciones
        if (!estado || !fecha || total == null || !clienteId || !vendedorId || !metodoPagoId || !detalles || detalles.length === 0) {
            throw new Error("Faltan datos obligatorios para crear la factura");
        }

        // Validar que los detalles sean válidos
        const detallesValidos = detalles.filter(detalle => 
            detalle.idProducto && 
            parseFloat(detalle.cantidad) > 0 && 
            parseFloat(detalle.precioUnitario) > 0
        );

        if (detallesValidos.length === 0) {
            throw new Error("Debe incluir al menos un producto válido");
        }

        // Generar ID si no se proporciona
        const facturaId = id || `FAC-${Date.now()}`;

        // Crear referencias
        const clienteRef = doc(db, "usuarios", clienteId);
        const vendedorRef = doc(db, "usuarios", vendedorId);
        const metodoPagoRef = doc(db, "Metodo_Pago", metodoPagoId);

        // Verificar que las referencias existan
        const [clienteExists, vendedorExists, metodoExists] = await Promise.all([
            getDoc(clienteRef),
            getDoc(vendedorRef),
            getDoc(metodoPagoRef)
        ]);

        if (!clienteExists.exists()) {
            throw new Error("El cliente seleccionado no existe");
        }
        if (!vendedorExists.exists()) {
            throw new Error("El vendedor seleccionado no existe");
        }
        if (!metodoExists.exists()) {
            throw new Error("El método de pago seleccionado no existe");
        }

        // Procesar detalles
        const detallesConReferencias = await Promise.all(
            detallesValidos.map(async (detalle) => {
                const productoRef = doc(db, "productos", detalle.idProducto);
                const productoSnap = await getDoc(productoRef);
                
                if (!productoSnap.exists()) {
                    throw new Error(`El producto con ID ${detalle.idProducto} no existe`);
                }

                const productoData = productoSnap.data();
                
                return {
                    Cantidad: parseInt(detalle.cantidad),
                    ID_Producto: productoRef,
                    PrecioUnitario: parseFloat(detalle.precioUnitario),
                    Producto: detalle.producto || productoData.nombre || productoData.Nombre || "Producto sin nombre",
                    Subtotal: parseFloat(detalle.subtotal)
                };
            })
        );

        // Verificar que el ID de factura no exista
        const facturaExistente = await getDoc(doc(db, "Factura", facturaId));
        if (facturaExistente.exists()) {
            throw new Error("Ya existe una factura con este ID");
        }

        // Crear la factura
        await setDoc(doc(db, "Factura", facturaId), {
            Estado: estado,
            Fecha: Timestamp.fromDate(new Date(fecha)),
            Total: parseFloat(total),
            Cliente: clienteRef,
            Vendedor: vendedorRef,
            MetodoPago: metodoPagoRef,
            Detalles: detallesConReferencias,
            FechaCreacion: Timestamp.now()
        });

        console.log("Factura creada correctamente con ID:", facturaId);
        return facturaId;
        
    } catch (error) {
        console.error("Error al crear la factura:", error);
        throw error;
    }
}

// Actualizar factura
async function updateFactura(idFactura, { estado, fecha, total, clienteId, vendedorId, metodoPagoId, detalles }) {
    try {
        const facturaRef = doc(db, "Factura", idFactura);
        
        // Verificar que la factura existe
        const facturaExistente = await getDoc(facturaRef);
        if (!facturaExistente.exists()) {
            throw new Error("La factura no existe");
        }
        
        const updateData = {
            FechaModificacion: Timestamp.now()
        };
        
        if (estado !== undefined) updateData.Estado = estado;
        if (fecha !== undefined) updateData.Fecha = Timestamp.fromDate(new Date(fecha));
        if (total !== undefined) updateData.Total = parseFloat(total);
        
        if (clienteId !== undefined) {
            const clienteRef = doc(db, "usuarios", clienteId);
            const clienteExists = await getDoc(clienteRef);
            if (!clienteExists.exists()) {
                throw new Error("El cliente seleccionado no existe");
            }
            updateData.Cliente = clienteRef;
        }
        
        if (vendedorId !== undefined) {
            const vendedorRef = doc(db, "usuarios", vendedorId);
            const vendedorExists = await getDoc(vendedorRef);
            if (!vendedorExists.exists()) {
                throw new Error("El vendedor seleccionado no existe");
            }
            updateData.Vendedor = vendedorRef;
        }
        
        if (metodoPagoId !== undefined) {
            const metodoPagoRef = doc(db, "Metodo_Pago", metodoPagoId);
            const metodoExists = await getDoc(metodoPagoRef);
            if (!metodoExists.exists()) {
                throw new Error("El método de pago seleccionado no existe");
            }
            updateData.MetodoPago = metodoPagoRef;
        }
        
        // Procesar detalles si se proporcionan
        if (detalles !== undefined) {
            const detallesValidos = detalles.filter(detalle => 
                detalle.idProducto && 
                parseFloat(detalle.cantidad) > 0 && 
                parseFloat(detalle.precioUnitario) > 0
            );

            if (detallesValidos.length === 0) {
                throw new Error("Debe incluir al menos un producto válido");
            }

            const detallesConReferencias = await Promise.all(
                detallesValidos.map(async (detalle) => {
                    const productoRef = doc(db, "productos", detalle.idProducto);
                    const productoSnap = await getDoc(productoRef);
                    
                    if (!productoSnap.exists()) {
                        throw new Error(`El producto con ID ${detalle.idProducto} no existe`);
                    }

                    const productoData = productoSnap.data();
                    
                    return {
                        Cantidad: parseInt(detalle.cantidad),
                        ID_Producto: productoRef,
                        PrecioUnitario: parseFloat(detalle.precioUnitario),
                        Producto: detalle.producto || productoData.nombre || productoData.Nombre || "Producto sin nombre",
                        Subtotal: parseFloat(detalle.subtotal)
                    };
                })
            );

            updateData.Detalles = detallesConReferencias;
        }
        
        await updateDoc(facturaRef, updateData);
        console.log("Factura actualizada correctamente");
        
    } catch (error) {
        console.error("Error al actualizar la factura:", error);
        throw error;
    }
}

// Eliminar factura
async function deleteFactura(idFactura) {
    try {
        const facturaRef = doc(db, "Factura", idFactura);
        
        // Verificar que la factura existe antes de eliminar
        const facturaExistente = await getDoc(facturaRef);
        if (!facturaExistente.exists()) {
            throw new Error("La factura no existe");
        }
        
        await deleteDoc(facturaRef);
        console.log("Factura eliminada correctamente");
        
    } catch (error) {
        console.error("Error al eliminar la factura:", error);
        throw error;
    }
}

// Obtener usuarios (clientes y vendedores)
async function getUsuarios() {
    try {
        const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
        return usuariosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        throw error;
    }
}

// Obtener métodos de pago
async function getMetodosPago() {
    try {
        const metodosSnapshot = await getDocs(collection(db, "Metodo_Pago"));
        return metodosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error al obtener métodos de pago:", error);
        throw error;
    }
}

// Obtener productos
async function getProductos() {
    try {
        const productosSnapshot = await getDocs(collection(db, "productos"));
        return productosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error al obtener productos:", error);
        throw error;
    }
}

// Obtener una factura específica por ID
async function getFacturaById(idFactura) {
    try {
        const facturaRef = doc(db, "Factura", idFactura);
        const facturaSnap = await getDoc(facturaRef);
        
        if (!facturaSnap.exists()) {
            throw new Error("La factura no existe");
        }

        const data = facturaSnap.data();
        let clienteNombre = "Sin cliente";
        let vendedorNombre = "Sin vendedor";
        let metodoPagoNombre = "Sin método";

        // Obtener datos relacionados igual que en getFacturas
        if (data.Cliente) {
            try {
                const clienteSnap = await getDoc(data.Cliente);
                if (clienteSnap.exists()) {
                    const clienteData = clienteSnap.data();
                    clienteNombre = `${clienteData.Nombre || ""} ${clienteData.Apellido || ""}`.trim() || 
                                  clienteData.Correo || "Sin nombre";
                }
            } catch (error) {
                console.error("Error al obtener cliente:", error);
            }
        }

        if (data.Vendedor) {
            try {
                const vendedorSnap = await getDoc(data.Vendedor);
                if (vendedorSnap.exists()) {
                    const vendedorData = vendedorSnap.data();
                    vendedorNombre = `${vendedorData.Nombre || ""} ${vendedorData.Apellido || ""}`.trim() || 
                                   vendedorData.Correo || "Sin nombre";
                }
            } catch (error) {
                console.error("Error al obtener vendedor:", error);
            }
        }

        if (data.MetodoPago) {
            try {
                const metodoSnap = await getDoc(data.MetodoPago);
                if (metodoSnap.exists()) {
                    const metodoData = metodoSnap.data();
                    metodoPagoNombre = metodoData.Nombre || metodoData.nombre || "Sin nombre";
                }
            } catch (error) {
                console.error("Error al obtener método de pago:", error);
            }
        }

        // Procesar detalles para obtener nombres de productos
        let detallesConNombres = [];
        if (data.Detalles && Array.isArray(data.Detalles)) {
            detallesConNombres = await Promise.all(
                data.Detalles.map(async (detalle) => {
                    let nombreProducto = detalle.Producto || "Producto desconocido";
                    
                    if (detalle.ID_Producto && !detalle.Producto) {
                        try {
                            const productoSnap = await getDoc(detalle.ID_Producto);
                            if (productoSnap.exists()) {
                                const productoData = productoSnap.data();
                                nombreProducto = productoData.nombre || productoData.Nombre || "Producto desconocido";
                            }
                        } catch (error) {
                            console.error("Error al obtener producto:", error);
                        }
                    }

                    return {
                        ...detalle,
                        Producto: nombreProducto
                    };
                })
            );
        }

        return {
            id: facturaSnap.id,
            ...data,
            clienteNombre,
            vendedorNombre,
            metodoPagoNombre,
            Detalles: detallesConNombres
        };
        
    } catch (error) {
        console.error("Error al obtener la factura:", error);
        throw error;
    }
}

export const facturas = {
    getFacturas,
    createFactura,
    updateFactura,
    deleteFactura,
    getUsuarios,
    getMetodosPago,
    getProductos,
    getFacturaById
};