import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "./config.js";

// Obtener todas las comisiones
async function getComisiones() {
  try {
    const comisionesSnapshot = await getDocs(collection(db, "Comision"));
    const comisiones = comisionesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return comisiones;
  } catch (error) {
    console.error("Error al obtener comisiones:", error);
    throw error;
  }
}

// Crear una nueva comisión (dinámica)
async function createComision({ id, porcentaje, idMetodoPago }) {
  try {
    if (!id || porcentaje == null || !idMetodoPago) {
      throw new Error("Faltan datos para crear la comisión");
    }

    const metodoPagoRef = doc(db, "Metodo_Pago", idMetodoPago);

    await setDoc(doc(db, "Comision", id), {
      Porcentaje: parseFloat(porcentaje),
      ID_MetodoPago: metodoPagoRef,
    });

    console.log("Comisión creada correctamente.");
  } catch (error) {
    console.error("Error al crear la comisión:", error);
    throw error;
  }
}

// Actualizar porcentaje de una comisión
async function updateComision(idComision, nuevoPorcentaje, nuevoMetodoPagoID) {
  try {
    const refComision = doc(db, "Comision", idComision);
    const metodoPagoRef = doc(db, "Metodo_Pago", nuevoMetodoPagoID);

    await updateDoc(refComision, {
      Porcentaje: parseFloat(nuevoPorcentaje),
      ID_MetodoPago: metodoPagoRef
    });

    console.log("Comisión actualizada.");
  } catch (error) {
    console.error("Error al actualizar la comisión:", error);
  }
}

// Eliminar comisión
async function deleteComision(idComision) {
  try {
    await deleteDoc(doc(db, "Comision", idComision));
    console.log("Comisión eliminada.");
  } catch (error) {
    console.error("Error al eliminar la comisión:", error);
    throw error;
  }
}

// Obtener métodos de pago disponibles
async function getMetodosPago() {
  try {
    const snapshot = await getDocs(collection(db, "Metodo_Pago"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error al obtener métodos de pago:", error);
    throw error;
  }
}

export const comisiones = {
  getComisiones,
  createComision,
  updateComision,
  deleteComision,
  getMetodosPago,
};
