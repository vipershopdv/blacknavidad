import { useEffect, useRef } from "react";
import {
  LuCircleCheck, LuClock3, LuHandCoins, LuLayers, LuPackage, LuPackageCheck, LuReceiptText, LuUser, LuWallet, LuX,
} from "react-icons/lu";
import { formatMoney } from "../data/orderDisplay";

const stages = {
  waiting: { title: "En espera", text: "Aún no han salido todas tus fuentes del horno.", icon: LuClock3 },
  ready: { title: "Listo para recoger", text: "Todas tus fuentes están listas para retirar.", icon: LuCircleCheck },
  delivered: { title: "Pedido entregado", text: "Tus fuentes ya fueron retiradas.", icon: LuPackageCheck },
};

export default function PublicClientModal({ client, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  const stage = client.estado === "listo" ? "ready"
    : ["entregado", "atendido"].includes(client.estado) ? "delivered" : "waiting";
  const { title, text, icon: StatusIcon } = stages[stage];
  const totalSources = Number(client.fuentes) || 0;
  const ready = stage === "delivered" ? totalSources : Math.min(totalSources, Math.max(0, Number(client.fuentesListas) || 0));
  const percent = totalSources ? (ready / totalSources) * 100 : 0;
  const details = [
    { label: "Cliente", value: client.nombre, icon: LuUser },
    { label: "Contenido", value: client.contenido, icon: LuPackage },
  ].filter(({ value }) => value?.trim());
  const hasPayment = [client.total, client.adelanto, client.debe].every((value) => value != null);
  const hasBalance = Number(client.debe) > 0;
  const metrics = [
    { label: "Total", value: client.total, icon: LuReceiptText },
    { label: "Adelanto", value: client.adelanto, icon: LuHandCoins },
    { label: "Saldo", value: client.debe, icon: LuWallet, balance: true },
  ];

  return (
    <dialog ref={dialogRef} className="admin-dialog public-result" data-stage={stage}
      aria-labelledby="public-result-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <header className="public-result-header">
        <div className="public-result-top">
          <span className="public-result-status"><StatusIcon aria-hidden="true" /> {title}</span>
          <button type="button" className="admin-icon-button public-result-close" aria-label="Cerrar resultado" onClick={onClose}>
            <LuX aria-hidden="true" />
          </button>
        </div>
        <h2 className="public-result-number" id="public-result-title">Número de pedido <strong>{client.id}</strong></h2>
        <p className="public-result-caption">{text}</p>
      </header>

      <section className="public-result-section" aria-labelledby="public-progress-title">
        <div className="public-result-progress-title">
          <h3 id="public-progress-title"><LuLayers aria-hidden="true" /> Fuentes listas</h3>
          <strong>{ready} de {totalSources}</strong>
        </div>
        <div className="public-result-progress-track" role="progressbar" aria-labelledby="public-progress-title"
          aria-valuemin={0} aria-valuemax={totalSources || 1} aria-valuenow={ready}
          aria-valuetext={`${ready} de ${totalSources} fuentes listas`}>
          <span className="public-result-progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </section>

      {details.length > 0 && (
        <section className="public-result-section" aria-labelledby="public-details-title">
          <h3 id="public-details-title">Datos del pedido</h3>
          <dl className="public-result-details">
            {details.map(({ label, value, icon: Icon }) => (
              <div key={label}><dt><Icon aria-hidden="true" /> {label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        </section>
      )}

      {hasPayment && (
        <section className="public-result-section" aria-labelledby="public-payment-title">
          <h3 id="public-payment-title">Resumen de pago</h3>
          <dl className="public-payment-summary" data-due={hasBalance}>
            {metrics.map(({ label, value, icon: Icon, balance }) => (
              <div key={label} className={balance ? "public-payment-balance" : undefined}>
                <dt><Icon aria-hidden="true" /> {label}</dt>
                <dd>{formatMoney(value)}</dd>
              </div>
            ))}
          </dl>
          <p className="public-payment-note" data-due={hasBalance}>
            {hasBalance ? "Saldo pendiente de pago" : <><LuCircleCheck aria-hidden="true" /> Sin saldo pendiente</>}
          </p>
        </section>
      )}
    </dialog>
  );
}
