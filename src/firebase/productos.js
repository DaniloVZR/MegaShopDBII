import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './config.js';

async function getProductos() {
    try {
        const productosSnapshot = await getDocs(collection(db, "productos"));

        const productos = await Promise.all(
            productosSnapshot.docs.map(async (docSnap) => {
                const data = docSnap.data();
                let proveedorNombre = "Sin proveedor";
                let tipoNombre = "Sin tipo";

                // Obtener nombre del proveedor
                if (data.proveedor) {
                    try {
                        let proveedorDocRef;
                        
                        if (data.proveedor.id) {
                            proveedorDocRef = data.proveedor;
                        } else {
                            proveedorDocRef = doc(db, "usuarios", data.proveedor);
                        }
                        
                        const proveedorSnap = await getDoc(proveedorDocRef);
                        if (proveedorSnap.exists()) {
                            const proveedorData = proveedorSnap.data();
                            proveedorNombre = `${proveedorData.Nombre || ""} ${proveedorData.Apellido || ""}`.trim() || 
                                            proveedorData.Correo || "Sin nombre";
                        }
                    } catch (error) {
                        console.error("Error al obtener proveedor:", error);
                    }
                }

                // Obtener nombre del tipo
                if (data.tipo) {
                    try {
                        let tipoDocRef;
                        
                        if (data.tipo.id) {
                            tipoDocRef = data.tipo;
                        } else {
                            tipoDocRef = doc(db, "tipo_producto", data.tipo);
                        }
                        
                        const tipoSnap = await getDoc(tipoDocRef);
                        if (tipoSnap.exists()) {
                            tipoNombre = tipoSnap.data().nombre || "Sin nombre";
                        }
                    } catch (error) {
                        console.error("Error al obtener tipo:", error);
                    }
                }

                return {
                    id: docSnap.id,
                    ...data,
                    proveedorNombre,
                    tipoNombre,
                };
            })
        );

        return productos;
    } catch (error) {
        console.error("Error al obtener productos:", error);
        throw error;
    }
}

async function createProducto(data) {
    try {
        const { nombre, precio, proveedor, tipo } = data;
        const nuevoDoc = doc(collection(db, "productos"));

        await setDoc(nuevoDoc, {
            nombre: nombre,
            precio: parseFloat(precio),
            proveedor: doc(db, "usuarios", proveedor),
            tipo: doc(db, "tipo_producto", tipo)
        });

        return nuevoDoc.id;
    } catch (error) {
        console.error("Error al crear producto:", error);
        throw error;
    }
}

async function updateProducto(idProducto, data) {
    try {
        const productoRef = doc(db, "productos", idProducto);
        const updateData = {};

        if (data.nombre) updateData.nombre = data.nombre;
        if (data.precio) updateData.precio = parseFloat(data.precio);
        if (data.proveedor) updateData.proveedor = doc(db, "usuarios", data.proveedor);
        if (data.tipo) updateData.tipo = doc(db, "tipo_producto", data.tipo);

        await updateDoc(productoRef, updateData);
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        throw error;
    }
}

async function deleteProducto(idProducto) {
    try {
        await deleteDoc(doc(db, "productos", idProducto));
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        throw error;
    }
}

export const producto = {
    getProductos,
    createProducto,
    updateProducto,
    deleteProducto
};