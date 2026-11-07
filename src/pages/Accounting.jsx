import { LuCircleCheck, LuClock, LuFlame, LuLayers, LuReceiptText, LuUsers, LuWallet } from "react-icons/lu";
import AdminSection from "../layout/AdminSection";
import { formatMoney } from "../data/orderDisplay";

export default function Accounting({ clients = [] }) {
  const summary = { total: 0, cash: 0, pending: 0, sources: 0, espera: 0, listo: 0, entregado: 0 };
  for (const client of clients) {
    summary.total += Number(client.total || 0);
    summary.cash += Number(client.adelanto || 0);
    summary.pending += Number(client.debe || 0);
    summary.sources += Number(client.fuentes || 0);
    const status = client.estado === "atendido" ? "entregado" : client.estado;
    if (["espera", "listo", "entregado"].includes(status)) summary[status]++;
  }

  const collected = summary.total > 0 ? Math.round((summary.cash / summary.total) * 100) : 0;
  const metrics = [
    ["Total de pedidos", formatMoney(summary.total), LuReceiptText],
    ["En caja", formatMoney(summary.cash), LuWallet],
    ["Por cobrar", formatMoney(summary.pending), LuClock],
    ["Fuentes", summary.sources, LuLayers],
    ["Clientes", clients.length, LuUsers],
  ];
  const statuses = [
    ["En espera", summary.espera, LuClock],
    ["Listo", summary.listo, LuFlame],
    ["Entregado", summary.entregado, LuCircleCheck],
  ];

  return (
    <AdminSection title="Contabilidad">
      <dl className="admin-metrics">
        {metrics.map(([label, value, Icon]) => (
          <div className="admin-metric" key={label}>
            <dt><Icon aria-hidden="true" /> {label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className="admin-accounting-details">
        <section className="admin-page-body">
          <h2 className="admin-section-heading">Estado de cobro</h2>
          <div className="admin-collection-caption">
            <span>Cobrado</span><strong>{collected}%</strong>
          </div>
          <progress className="admin-collection-progress" aria-label="Porcentaje cobrado"
            value={Math.min(100, Math.max(0, collected))} max={100} />
        </section>
        <section className="admin-page-body">
          <h2 className="admin-section-heading">Pedidos por estado</h2>
          <dl className="admin-accounting-statuses">
            {statuses.map(([label, count, Icon]) => (
              <div key={label}><dt><Icon aria-hidden="true" /> {label}</dt><dd>{count}</dd></div>
            ))}
          </dl>
        </section>
      </div>
    </AdminSection>
  );
}
