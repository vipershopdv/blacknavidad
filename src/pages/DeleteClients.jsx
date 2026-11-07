import { useState } from "react";
import { LuSearch, LuTrash2 } from "react-icons/lu";
import AdminConfirm from "../components/AdminConfirm";
import OrderDetails from "../components/OrderDetails";
import AdminSection from "../layout/AdminSection";
import { statusLabels } from "../data/orderDisplay";

const normalizeCode = (value) => value.trim().toUpperCase().replace(/\s+/g, "").replace(/^C?-?(\d+)$/, "C-$1");

export default function DeleteClients({ clients, deleteClient }) {
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const query = normalizeCode(code);
  const client = clients.find((order) => order.id === query);

  const handleDelete = async () => {
    if (!confirmation || deleting) return;
    setDeleting(true);
    setError("");
    try {
      await deleteClient(confirmation.id);
      setConfirmation(null);
      setCode("");
    } catch {
      setError("No se pudo eliminar el pedido. Intenta de nuevo.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminSection title="Eliminar clientes" actions={
      <label className="admin-inline-search">
        <LuSearch aria-hidden="true" />
        <input type="search" aria-label="ID del cliente" placeholder="Buscar ID, ej. C-1"
          value={code} onChange={(event) => setCode(event.target.value)} />
      </label>
    }>
      {client ? (
        <>
          <div className="admin-page-body">
            <div className="admin-delete-heading">
              <h2 className="admin-section-heading">Pedido {client.id}</h2>
              <span className="admin-status-badge" data-status={client.estado}>{statusLabels[client.estado]}</span>
            </div>
            <OrderDetails client={client} />
          </div>
          <footer className="admin-page-actions">
            <button type="button" className="admin-button admin-button-danger"
              onClick={() => { setError(""); setConfirmation(client); }}>
              <LuTrash2 aria-hidden="true" /> Eliminar pedido
            </button>
          </footer>
        </>
      ) : <p className="admin-page-body admin-empty-text">{query ? "No se encontró ningún pedido con ese ID." : "Sin pedido seleccionado."}</p>}
      {confirmation && (
        <AdminConfirm title="Eliminar pedido" icon={LuTrash2} danger busy={deleting} error={error}
          confirmLabel={deleting ? "Eliminando..." : "Eliminar"}
          onCancel={() => setConfirmation(null)} onConfirm={handleDelete}>
          Se eliminará el pedido <strong>{confirmation.id}</strong> de {confirmation.nombre}. Esta acción no se puede deshacer.
        </AdminConfirm>
      )}
    </AdminSection>
  );
}
