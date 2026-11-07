import { useRef, useState } from "react";
import { LuHash, LuUserPlus, LuWallet } from "react-icons/lu";
import AdminSection from "../layout/AdminSection";
import { formatMoney } from "../data/orderDisplay";

const fields = [
  { name: "nombre", label: "Nombre del cliente", placeholder: "Juan Pérez", autoComplete: "name" },
  { name: "contenido", label: "Contenido", placeholder: "Pollo, pavo..." },
  { name: "fuentes", label: "Número de fuentes", placeholder: "2", type: "number", min: 1, step: 1 },
  { name: "total", label: "Precio total (S/)", placeholder: "150.00", type: "number", min: 0, step: "0.01" },
  { name: "adelanto", label: "Adelanto (S/)", placeholder: "50.00", type: "number", min: 0, step: "0.01" },
  { name: "whatsapp", label: "WhatsApp", placeholder: "51999999999", type: "tel", autoComplete: "tel" },
];

export default function RegisterClient({ addClient, nextCode, estimated }) {
  const [cliente, setCliente] = useState({ nombre: "", contenido: "", fuentes: "", total: "", adelanto: "", whatsapp: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const saldo = Number(cliente.total) - Number(cliente.adelanto);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (pending.current) return;
    setError("");
    if (saldo < 0) {
      setError("El adelanto no puede superar el total.");
      return;
    }

    pending.current = true;
    setSaving(true);
    try {
      await addClient({
        ...cliente,
        fuentes: Number(cliente.fuentes),
        total: Number(cliente.total),
        adelanto: Number(cliente.adelanto),
      });
    } catch {
      setError("No se pudo registrar el pedido. Revisa los datos e intenta de nuevo.");
    } finally {
      pending.current = false;
      setSaving(false);
    }
  };

  return (
    <AdminSection title="Registrar cliente" actions={
      <dl className="admin-register-summary">
        <div>
          <dt><LuHash aria-hidden="true" /> {estimated ? "Próximo ID estimado" : "Próximo ID"}</dt>
          <dd aria-live="polite">{nextCode ?? "—"}</dd>
        </div>
        <div>
          <dt><LuWallet aria-hidden="true" /> Saldo pendiente</dt>
          <dd>{formatMoney(Math.max(0, saldo))}</dd>
        </div>
      </dl>
    }>
      <form onSubmit={handleSubmit}>
        <div className="admin-page-body">
          <h2 className="admin-section-heading">Datos del pedido</h2>
          <div className="admin-form-grid">
            {fields.map(({ label, name, ...input }) => (
              <label className="admin-field" key={name}>
                {label}
                <input {...input} name={name} className="admin-field-control" value={cliente[name]}
                  onChange={(event) => setCliente({ ...cliente, [name]: event.target.value })} required />
              </label>
            ))}
          </div>
        </div>
        <footer className="admin-page-actions">
          {error && <p className="admin-action-error" role="alert">{error}</p>}
          <button className="admin-button admin-button-primary" disabled={saving}>
            <LuUserPlus aria-hidden="true" /> {saving ? "Registrando..." : "Registrar cliente"}
          </button>
        </footer>
      </form>
    </AdminSection>
  );
}
