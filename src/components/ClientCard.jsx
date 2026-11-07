import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { LuChevronRight, LuLayers } from "react-icons/lu";
import { formatMoney } from "../data/orderDisplay";

export default function ClientCard({ client, onClick }) {
  const sendWhatsApp = () => {
    if (!client?.whatsapp) return;

    const message = `Hola ${client?.nombre ?? ""};

Ya puedes venir a recoger lo que mandó a hornear con nosotros.

ID de espera: ${client?.id ?? ""}

N. de fuentes: ${client?.fuentes ?? ""}

Monto total:
${formatMoney(client?.total)}

Adelanto:
${formatMoney(client?.adelanto)}

Debe:
${formatMoney(client?.debe)}

Gracias por su preferencia.
¡Feliz Navidad!`;

    window.open(
      `https://wa.me/${client.whatsapp}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const debe = Number(client?.debe || 0);
  const fuentes = client?.fuentes ?? 0;
  const showWhatsApp = client?.estado === "listo" && client?.whatsapp;

  return (
    <article className="admin-order" data-status={client.estado}>
      <button type="button" className="admin-order-details" onClick={onClick}
        aria-label={`Ver pedido ${client?.id} de ${client?.nombre}`}>
        <span className="admin-order-heading">
          <strong>{client.id}</strong>
          <span className="admin-order-sources" aria-label={`${fuentes} ${fuentes === 1 ? "fuente" : "fuentes"}`}>
            <LuLayers aria-hidden="true" /> {fuentes}
          </span>
        </span>
        <span className="admin-order-name">{client.nombre}</span>
        <span className="admin-order-meta">
          <span>Total <strong>{formatMoney(client.total)}</strong></span>
          <span>Saldo <strong className={debe > 0 ? "admin-order-balance" : undefined}>{formatMoney(debe)}</strong></span>
        </span>
        {!showWhatsApp && <LuChevronRight className="admin-order-arrow" aria-hidden="true" />}
      </button>
      {showWhatsApp && (
        <button type="button" className="admin-icon-button admin-order-whatsapp"
          onClick={sendWhatsApp} aria-label={`Enviar WhatsApp del pedido ${client.id}`}>
          <FontAwesomeIcon icon={faWhatsapp} aria-hidden="true" />
        </button>
      )}
    </article>
  );
}

