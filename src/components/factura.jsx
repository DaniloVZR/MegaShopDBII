import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseconfig';
import { useEffect, useState } from 'react';

export const Factura = () => {
    const [facturas, setFacturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function getFacturas() {        
        try {
            const facturasData = await getDocs(collection(db, "Factura"));
            const facturas = facturasData.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return facturas;
        } catch (error) {
            console.error("Error al obtener las facturas:", error);
            setError("Error al cargar las facturas");
            return [];
        }
    }

    async function createFactura() {
        try {
            const clienteRef = doc(db, "usuarios", "Usuario001");
            const vendedorRef = doc(db, "usuarios", "Usuario002");
            const metodoPago = doc(db, "Metodo_Pago", '3');
            const producto = doc(db, "productos", "electrodomestico1");

            await setDoc(doc(db, "Factura", "Factura02"), {
                Estado: "Pagado",
                Fecha: new Date("2025-04-22T23:59:59-05:00"),
                Total: 2000000,
                Cliente: clienteRef,
                Vendedor: vendedorRef,
                MetodoPago: metodoPago,
                Detalles: [
                    {
                        Cantidad: 1,
                        ID_Producto: producto,
                        PrecioUnitario: 2000000,
                        Producto: 'nevera',
                        Subtotal: 2000000
                    }
                ]
            });

            console.log("Factura creada con referencias.");
            // Actualizar la lista de facturas después de crear una nueva
            const updatedFacturas = await getFacturas();
            setFacturas(updatedFacturas);
        } catch (error) {
            console.error("Error al crear la factura:", error);
            setError("Error al crear la factura");
        }
    }

    async function updateFactura(idFactura) {
        try {
            const facturaRef = doc(db, "Factura", idFactura);

            await updateDoc(facturaRef, {
                Estado: "Pendiente",
            });

            console.log("Factura actualizada.");
            // Actualizar la lista de facturas después de modificar
            const updatedFacturas = await getFacturas();
            setFacturas(updatedFacturas);
        } catch (error) {
            console.error("Error al actualizar la factura:", error);
            setError("Error al actualizar la factura");
        }
    }

    async function deleteFactura(idFactura) {
        try {
            await deleteDoc(doc(db, "Factura", idFactura));
            console.log("Factura eliminada.");
            // Actualizar la lista de facturas después de eliminar
            const updatedFacturas = await getFacturas();
            setFacturas(updatedFacturas);
        } catch (error) {
            console.error("Error al eliminar la factura:", error);
            setError("Error al eliminar la factura");
        }
    }

    useEffect(() => {
        const fetchFacturas = async () => {
            setLoading(true);
            try {
                const facturasData = await getFacturas();
                setFacturas(facturasData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFacturas();
    }, []);

    if (loading) return <div>Cargando facturas...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Facturas</h1>
            
            <button onClick={createFactura}>Crear Factura de Ejemplo</button>
            
            <h2>Listado de Facturas</h2>
            <ul>
                {facturas.map(factura => (
                    <li key={factura.id}>
                        <div>ID: {factura.id}</div>
                        <div>Estado: {factura.Estado}</div>
                        <div>Total: ${factura.Total}</div>
                        <div>Fecha: {factura.Fecha?.toDate().toLocaleString()}</div>
                        
                        <button onClick={() => updateFactura(factura.id)}>
                            Cambiar a Pendiente
                        </button>
                        
                        <button onClick={() => deleteFactura(factura.id)}>
                            Eliminar
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};