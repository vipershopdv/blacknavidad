import { useEffect, useRef, useState } from "react";
import { LuCheck, LuPencil, LuPrinter, LuReceiptText, LuSave, LuX } from "react-icons/lu";
import OrderDetails from "./OrderDetails";
import { statusLabels } from "../data/orderDisplay";

export default function ClientModal({ client, onClose, updateClient, printClientTicket }) {
  const [mode, setMode] = useState("details");
  const [formData, setFormData] = useState(client);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  if (!client) return null;

  const editing = mode === "edit";
  const confirming = mode === "deliver";
  const changeMode = (nextMode) => {
    setError("");
    setMode(nextMode);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!editing || saving) return;
    const total = Number(formData.total);
    const adelanto = Number(formData.adelanto);
    if (adelanto > total) {
      setError("El adelanto no puede superar el total.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await updateClient(client.id, {
        nombre: formData.nombre,
        contenido: formData.contenido,
        whatsapp: formData.whatsapp,
        fuentes: Number(formData.fuentes),
        total,
        adelanto,
      });
      changeMode("details");
    } catch {
      setError("No se pudo guardar el pedido. Revisa los datos e intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelivery = async () => {
    if (saving) return;
    setError("");
    setSaving(true);
    try {
      await updateClient(client.id, { estado: "entregado", adelanto: Number(client.total || 0) });
      onClose();
    } catch {
      setError("No se pudo actualizar el estado. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog ref={dialogRef} aria-labelledby="order-dialog-title" className="admin-dialog"
      onCancel={(event) => {
        event.preventDefault();
        if (saving) return;
        if (mode === "details") onClose();
        else changeMode("details");
      }}>
      <header className="admin-dialog-header">
        <div className="admin-dialog-title">
          <span className="admin-dialog-symbol">{confirming ? <LuCheck aria-hidden="true" /> : <LuReceiptText aria-hidden="true" />}</span>
          <div>
            <h2 id="order-dialog-title">{confirming ? "Confirmar entrega" : editing ? `Editar pedido ${client.id}` : `Pedido ${client.id}`}</h2>
            {!confirming && <span className="admin-status-badge" data-status={client.estado}>{statusLabels[client.estado]}</span>}
          </div>
        </div>
        <button type="button" className="admin-icon-button admin-button-secondary" aria-label="Cerrar modal"
          disabled={saving} onClick={onClose}><LuX aria-hidden="true" /></button>
      </header>

      {confirming ? (
        <>
          <p className="admin-dialog-message">El pedido {client.id} quedará entregado y su saldo pasará a S/ 0.00.</p>
          {error && <p role="alert" className="admin-dialog-error">{error}</p>}
          <footer className="admin-dialog-actions">
            <button type="button" className="admin-button admin-button-secondary" disabled={saving}
              onClick={() => changeMode("details")}>Cancelar</button>
            <button type="button" className="admin-button admin-button-primary" disabled={saving} onClick={handleDelivery}>
              <LuCheck aria-hidden="true" /> {saving ? "Guardando..." : "Confirmar entrega"}
            </button>
          </footer>
        </>
      ) : (
        <form onSubmit={handleSave}>
          <OrderDetails client={client} formData={editing ? formData : null}
            onChange={({ target }) => setFormData({ ...formData, [target.name]: target.value })} />
          {error && <p role="alert" className="admin-dialog-error">{error}</p>}
          <footer className="admin-dialog-actions" key={mode}>
            {editing ? (
              <>
                <button type="button" className="admin-button admin-button-secondary" disabled={saving}
                  onClick={() => changeMode("details")}>Cancelar</button>
                <button className="admin-button admin-button-primary" disabled={saving}>
                  <LuSave aria-hidden="true" /> {saving ? "Guardando..." : "Guardar"}
                </button>
              </>
            ) : (
              <>
                <button type="button" className="admin-button admin-button-secondary" onClick={() => printClientTicket(client)}>
                  <LuPrinter aria-hidden="true" /> Imprimir
                </button>
                {client.estado === "espera" && <button type="button" className="admin-button admin-button-primary"
                  onClick={() => { setFormData(client); changeMode("edit"); }}>
                  <LuPencil aria-hidden="true" /> Editar
                </button>}
                {client.estado === "listo" && <button type="button" className="admin-button admin-button-primary"
                  onClick={() => changeMode("deliver")}>
                  <LuCheck aria-hidden="true" /> Marcar entregado
                </button>}
              </>
            )}
          </footer>
        </form>
      )}
    </dialog>
  );
}
