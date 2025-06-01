import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './config.js';

// Obtener todos los tipos de producto
async function getTipoProducto() {
    try {
        const tipoProductoSnapshot = await getDocs(collection(db, "tipo_producto"));
        const tipoProducto = tipoProductoSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return tipoProducto;
    } catch (error) {
        console.error("Error al obtener tipos de producto:", error);
        throw error;
    }
}

// Crear un nuevo tipo de producto (dinámico)
async function createTipoProducto({ id, nombre }) {
    try {
        if (!id || !nombre) {
            throw new Error("Faltan datos para crear el tipo de producto");
        }

        const docRef = doc(db, "tipo_producto", id);

        // Verificar si el ID ya existe
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            throw new Error("El tipo de producto con este ID ya existe");
        }

        await setDoc(docRef, {
            nombre: nombre
        });

        console.log("Tipo de producto creado correctamente.");
    } catch (error) {
        console.error("Error al crear el tipo de producto:", error);
        throw error;
    }
}

// Actualizar tipo de producto
async function updateTipoProducto(idTipoProducto, { nombre }) {
    try {
        const tipoProductoRef = doc(db, "tipo_producto", idTipoProducto);
        
        const updateData = {};
        
        if (nombre !== undefined) updateData.nombre = nombre;

        await updateDoc(tipoProductoRef, updateData);
        console.log("Tipo de producto actualizado.");
    } catch (error) {
        console.error("Error al actualizar el tipo de producto:", error);
        throw error;
    }
}

// Eliminar tipo de producto
async function deleteTipoProducto(idTipoProducto) {
    try {
        await deleteDoc(doc(db, "tipo_producto", idTipoProducto));
        console.log("Tipo de producto eliminado.");
    } catch (error) {
        console.error("Error al eliminar el tipo de producto:", error);
        throw error;
    }
}

export const tipoProducto = {
    getTipoProducto,
    createTipoProducto,
    updateTipoProducto,
    deleteTipoProducto
};