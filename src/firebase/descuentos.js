import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from './config.js';

async function getDescuentos() {
    try {
        const descuentosSnapshot = await getDocs(collection(db, "Descuento"));

        const descuentos = await Promise.all(
            descuentosSnapshot.docs.map(async (docSnap) => {
                const data = docSnap.data();
                let tipoNombre = "Desconocido";

                // Verificar si Id_Tipo existe y es una referencia válida
                if (data.Id_Tipo) {
                    try {
                        let tipoDocRef;
                        
                        // Debug: verificar qué tipo de dato es Id_Tipo
                        console.log("Id_Tipo data:", data.Id_Tipo);
                        
                        // Si Id_Tipo es una referencia de Firestore
                        if (data.Id_Tipo.id) {
                            tipoDocRef = data.Id_Tipo;
                            console.log("Usando referencia existente:", data.Id_Tipo.id);
                        } else {
                            // Si Id_Tipo es solo un string ID
                            tipoDocRef = doc(db, "tipo_producto", data.Id_Tipo);
                            console.log("Creando nueva referencia para:", data.Id_Tipo);
                        }
                        
                        const tipoSnap = await getDoc(tipoDocRef);
                        if (tipoSnap.exists()) {
                            tipoNombre = tipoSnap.data().nombre || "Sin nombre";
                            console.log("Tipo encontrado:", tipoNombre);
                        } else {
                            console.log("Documento de tipo no encontrado");
                        }
                    } catch (error) {
                        console.error("Error al obtener tipo de producto:", error);
                    }
                }

                return {
                    id: docSnap.id,
                    ...data,
                    tipoNombre,
                };
            })
        );

        return descuentos;
    } catch (error) {
        console.error("Error al obtener descuentos:", error);
        throw error;
    }
}

async function createDescuento(data) {
    try {
        const { FechaInicio, FechaFinal, Id_Tipo, Porcentaje } = data;
        const nuevoDoc = doc(collection(db, "Descuento"));

        await setDoc(nuevoDoc, {
            FechaInicio: Timestamp.fromDate(new Date(FechaInicio)),
            FechaFinal: Timestamp.fromDate(new Date(FechaFinal)),
            Id_Tipo: doc(db, "tipo_producto", Id_Tipo), // Crear referencia
            Porcentaje: parseFloat(Porcentaje),
        });

        return nuevoDoc.id;
    } catch (error) {
        console.error("Error al crear el descuento:", error);
        throw error;
    }
}

async function updateDescuento(idDescuento, data) {
    try {
        const descuentoRef = doc(db, "Descuento", idDescuento);
        const updateData = {};

        if (data.FechaInicio)
            updateData.FechaInicio = Timestamp.fromDate(new Date(data.FechaInicio));
        if (data.FechaFinal)
            updateData.FechaFinal = Timestamp.fromDate(new Date(data.FechaFinal));
        if (data.Id_Tipo)
            updateData.Id_Tipo = doc(db, "tipo_producto", data.Id_Tipo);
        if (data.Porcentaje)
            updateData.Porcentaje = parseFloat(data.Porcentaje);

        await updateDoc(descuentoRef, updateData);
    } catch (error) {
        console.error("Error al actualizar el descuento:", error);
        throw error;
    }
}

async function deleteDescuento(idDescuento) {
    try {
        await deleteDoc(doc(db, "Descuento", idDescuento));
    } catch (error) {
        console.error("Error al eliminar el descuento:", error);
        throw error;
    }
}

export const descuentos = {
    getDescuentos,
    createDescuento,
    updateDescuento,
    deleteDescuento,
};