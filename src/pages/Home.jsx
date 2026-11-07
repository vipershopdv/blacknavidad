import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck, faFire, faHourglassHalf, faInbox, faMagnifyingGlass, faPlus, faXmark,
} from "@fortawesome/free-solid-svg-icons";
import ClientCard from "../components/ClientCard";
import ClientModal from "../components/ClientModal";

const columns = [
  { key: "waiting", title: "En espera", icon: faHourglassHalf, states: ["espera"] },
  { key: "ready", title: "Listo", icon: faFire, states: ["listo"] },
  { key: "delivered", title: "Entregado", icon: faCircleCheck, states: ["entregado", "atendido"] },
];

export default function Home({
  clients, updateClientStatus, updateClient, printClientTicket, onRegister,
}) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const selectedClient = clients.find((client) => client.id === selectedId);
  const query = search.trim().toLocaleLowerCase("es");
  const filteredClients = useMemo(
    () => clients.filter(({ id, nombre }) =>
      `${id ?? ""} ${nombre ?? ""}`.toLocaleLowerCase("es").includes(query)),
    [clients, query],
  );

  return (
    <>
      <div className="dashboard-toolbar">
        <h1>Dashboard</h1>
        <div className="dashboard-actions">
          <div className="dashboard-search">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            <input type="search" aria-label="Buscar por ID o nombre"
              placeholder="Buscar por ID o nombre"
              value={search} onChange={(event) => setSearch(event.target.value)} />
            {search && (
              <button type="button" className="admin-icon-button" aria-label="Limpiar búsqueda"
                onClick={() => setSearch("")}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
          </div>
          <button type="button" className="admin-button admin-button-primary" onClick={onRegister}>
            <FontAwesomeIcon icon={faPlus} />
            Registrar cliente
          </button>
        </div>
      </div>

      <div className="orders-board">
        {columns.map(({ key, title, icon, states }) => {
          const items = filteredClients.filter(({ estado }) => states.includes(estado));
          return (
            <section key={key} className="orders-column" data-lane={key} aria-labelledby={`orders-${key}`}>
              <header className="orders-column-header">
                <FontAwesomeIcon icon={icon} className="orders-status" aria-hidden="true" />
                <h2 id={`orders-${key}`}>{title}</h2>
                <span className="orders-count" aria-label={`${items.length} ${items.length === 1 ? "pedido" : "pedidos"}`}>{items.length}</span>
              </header>
              {items.length ? (
                <div className="orders-column-list">
                  {items.map((client) => (
                    <ClientCard key={client.id} client={client} onClick={() => setSelectedId(client.id)} />
                  ))}
                </div>
              ) : (
                <p className="orders-empty">
                  <FontAwesomeIcon icon={faInbox} />
                  {query ? "Sin coincidencias" : "No hay pedidos"}
                </p>
              )}
            </section>
          );
        })}
      </div>

      {selectedClient && (
        <ClientModal
          key={selectedId}
          client={selectedClient}
          onClose={() => setSelectedId(null)}
          updateClientStatus={updateClientStatus}
          updateClient={updateClient}
          printClientTicket={printClientTicket}
        />
      )}
    </>
  );
}
