import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './config.js';

// Función para obtener tipo producto
async function getMetodoPago() {
    try {
        const metodoPagoData = await getDocs(collection(db, "Metodo_Pago"));
        const metodoPago = metodoPagoData.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));        
        return metodoPago;        
    } catch (error) {
        console.error("Error al obtener los Metodos de Pago:", error);
        throw error;
    }
}

// Función para añadir metodo de pago
async function createMetodoPago({ id, Metodo }) {
    try {
        if (!id || !Metodo) {
            throw new Error("Faltan datos para crear el meotod de Pago");
        }
                
        const docRef = doc(db, "Metodo_Pago", id);

        // Verificar si el ID ya existe
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {            
            throw new Error("El metodo de pago con este ID ya existe");            
        }

        // Crear el documento con ID personalizado
        await setDoc(docRef, {
            Metodo: Metodo
        });

        console.log(`Metodo de pago creado correctamente`);
    } catch (error) {
        console.error("Error al crear el método de pago:", error);
        throw error;
    }
}

// Función para editar usuarios
async function updateMetodoPago(idMetodoPago, { Metodo }) {
    try {
        const metodoPagoRef = doc(db, "Metodo_Pago", idMetodoPago);

        const updateData = {};

        if (Metodo !== undefined) updateData.Metodo = Metodo;
        
        await updateDoc(metodoPagoRef, updateData);
        
        console.log("Metodo de Pago actualizado!");

    } catch (error) {
        console.error("Error al actualizar el metodo de pago:", error);
        throw error;
    }
}

// Función para eliminar usuarios
async function deleteMetodoPago(idMetodoPago) {
    try {        
        await deleteDoc(doc(db, "Metodo_Pago", idMetodoPago));        
        console.log("Metodo de pago eliminado");
    } catch (error) {
        console.error("Error al eliminar el metodo de pago:", error);
        throw error;
    }
}

export const metodoPago = {
    getMetodoPago,
    createMetodoPago,
    updateMetodoPago,
    deleteMetodoPago
}