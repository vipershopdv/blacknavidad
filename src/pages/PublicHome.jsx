import { useRef, useState } from "react";

import { LuCircleCheck, LuClock3, LuCookingPot, LuHash, LuLoaderCircle, LuPackageCheck, LuSearch } from "react-icons/lu";

import { getClientByCode } from "../supabase/clients";
import PublicClientModal from "../components/PublicClientModal";

const stages = [
  { key: "waiting", icon: LuClock3, label: "En espera", description: "Aún no está listo para recoger." },
  { key: "ready", icon: LuCircleCheck, label: "Listo", description: "Ya puedes recoger tus fuentes." },
  { key: "delivered", icon: LuPackageCheck, label: "Entregado", description: "El pedido ya fue retirado." },
];

const normalizeCode = (value = "") => {
  const raw = String(value).trim().toUpperCase().replace(/\s+/g, "");

  if (!raw) return "";
  if (/^C-\d+$/.test(raw)) return raw;
  if (/^C\d+$/.test(raw)) return `C-${raw.slice(1)}`;
  if (/^\d+$/.test(raw)) return `C-${raw}`;
  return raw;
};

export default function PublicHome() {
  const [serviceId, setServiceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [client, setClient] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const pending = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pending.current) return;

    const code = normalizeCode(serviceId);

    if (!/^C-\d{1,19}$/.test(code)) {
      setError("Ingresa un número de pedido como C-8.");
      return;
    }

    pending.current = true;
    setLoading(true);
    setError("");

    try {
      const result = await getClientByCode(code);

      if (!result) {
        setClient(null);
        setOpenModal(false);
        setError(`No encontramos el pedido ${code}.`);
        return;
      }

      setClient(result);
      setOpenModal(true);
    } catch {
      setError("No pudimos consultar el pedido. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      pending.current = false;
      setLoading(false);
    }
  };

  const closeModal = () => {
    setOpenModal(false);
  };

  return (
    <main className="public-order-page" aria-labelledby="public-order-heading">
      <header className="public-order-heading">
        <div className="public-order-brand"><LuCookingPot aria-hidden="true" /> Inv. Salas <span>Servicio de asados</span></div>
        <h1 id="public-order-heading">Consulta tu pedido</h1>
        <p>Revisa si tus fuentes ya están listas para recoger.</p>
      </header>

      <section className="public-order-panel" aria-label="Consultar por número de pedido">
        <form className="public-order-form" onSubmit={handleSubmit}>
          <label htmlFor="service-code">Número de pedido</label>
          <p id="public-order-help">Escribe el número que aparece en la nota de venta que te entregamos en papel.</p>
          <div className="public-order-controls">
            <div className="public-code-field">
              <LuHash aria-hidden="true" />
              <input id="service-code" type="text" disabled={loading}
                value={serviceId} onChange={(event) => {
                  setServiceId(event.target.value);
                  if (error) setError("");
                }}
                placeholder="Ingrese tu numero de pedido" autoCapitalize="characters" autoComplete="off" spellCheck={false}
                aria-describedby={error ? "public-order-help public-order-error" : "public-order-help"} />
            </div>
            <button type="submit" className="admin-button admin-button-primary public-order-submit" disabled={loading}>
              {loading ? <LuLoaderCircle className="public-order-spinner" aria-hidden="true" /> : <LuSearch aria-hidden="true" />}
              {loading ? "Consultando..." : "Consultar estado"}
            </button>
          </div>
          {error && <p className="public-order-error" id="public-order-error" role="alert">{error}</p>}
        </form>

        <figure className="public-order-example">
          <figcaption>Ubica el número en tu nota</figcaption>
          <div className="public-example-ticket">
            <img src={`${import.meta.env.BASE_URL}nota-venta-ejemplo.png`} width="422" height="547"
              alt="Nota de venta de ejemplo. El número de pedido C-5 está marcado con un círculo, debajo de la dirección web." />
            <span className="public-example-highlight" aria-hidden="true" />
          </div>
        </figure>
      </section>

      <ol className="public-order-states" aria-label="Estados del pedido">
        {stages.map(({ key, icon: Icon, label, description }) => (
          <li key={key} data-stage={key}>
            <span className="public-order-state-icon"><Icon aria-hidden="true" /></span>
            <div><strong>{label}</strong><p>{description}</p></div>
          </li>
        ))}
      </ol>

      {openModal && client && <PublicClientModal client={client} onClose={closeModal} />}
    </main>
  );
}
