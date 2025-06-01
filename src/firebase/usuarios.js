import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './config.js';

// Función para obtener usuarios
async function getUsuarios() {
    try {
        const usuariosData = await getDocs(collection(db, "usuarios"));
        const usuariosList = usuariosData.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return usuariosList;
    } catch (error) {
        console.error("Error al obtener los usuarios:", error);
        throw error;
    }
}

// Función para añadir usuarios dinámicamente
async function createUsuario(data) {
    try {
        const { Nombre, Apellido, Correo, Celular, Direccion, Roles } = data;
        const nuevoDoc = doc(collection(db, "usuarios"));
        
        await setDoc(nuevoDoc, {            
            Direccion: Direccion || "",
            Celular: Celular || "",
            Apellido: Apellido || "",
            Nombre: Nombre || "",
            Correo: Correo || "",
            Roles: Roles || ["Cliente"],
        });

        return nuevoDoc.id;       
    } catch (error) {
        console.error("Error al crear usuario: ", error);
        throw error;
    }
}

// Función para editar usuarios dinámicamente
async function updateUsuario(documentId, data) {
    try {
        const usuarioRef = doc(db, "usuarios", documentId);
        const updateData = {};
        
        if (data.Nombre !== undefined) updateData.Nombre = data.Nombre;
        if (data.Apellido !== undefined) updateData.Apellido = data.Apellido;
        if (data.Correo !== undefined) updateData.Correo = data.Correo;
        if (data.Celular !== undefined) updateData.Celular = data.Celular;
        if (data.Direccion !== undefined) updateData.Direccion = data.Direccion;
        if (data.Roles !== undefined) updateData.Roles = data.Roles;
        
        await updateDoc(usuarioRef, updateData);
    } catch (error) {
        console.error("Error al actualizar usuario: ", error);
        throw error;
    }
}

// Función para eliminar usuarios
async function deleteUsuario(documentId) {
    try {
        const usuarioRef = doc(db, "usuarios", documentId);
        await deleteDoc(usuarioRef);
    } catch (error) {
        console.error("Error al eliminar usuario: ", error);
        throw error;
    }
}

export const usuario = {
    getUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario
}