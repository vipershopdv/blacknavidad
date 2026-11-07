import { useState } from "react";
import { LuCheck, LuClock, LuFlame, LuMinus, LuPlus, LuSave, LuSearch } from "react-icons/lu";
import AdminConfirm from "../components/AdminConfirm";
import AdminSection from "../layout/AdminSection";

export default function InputSources({ clients, updateFuentes }) {
  const [search, setSearch] = useState("");
  const [changes, setChanges] = useState({});
  const [confirm, setConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const active = clients.filter(({ estado }) => estado === "espera" || estado === "listo");
  const pending = active.filter((client) => changes[client.id] !== undefined && changes[client.id] !== client.fuentesListas);
  const query = search.trim().toLowerCase();
  const visible = active.filter(({ id }) => id.toLowerCase().includes(query))
    .sort((a, b) => Number(a.fuentesListas >= a.fuentes) - Number(b.fuentesListas >= b.fuentes));

  const changeCount = (client, delta) => {
    setChanges((current) => {
      const baseline = client.fuentesListas ?? 0;
      const next = Math.min(client.fuentes, Math.max(0, (current[client.id] ?? baseline) + delta));
      const updated = { ...current };
      if (next === baseline) delete updated[client.id];
      else updated[client.id] = next;
      return updated;
    });
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      for (const client of pending) {
        await updateFuentes(client.id, changes[client.id], client.fuentes);
        setChanges((current) => {
          const remaining = { ...current };
          delete remaining[client.id];
          return remaining;
        });
      }
      setConfirm(false);
    } catch {
      setError("No se pudieron guardar todos los cambios. Revisa los pendientes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminSection title="Ingresar fuentes" actions={
      <label className="admin-inline-search">
        <LuSearch aria-hidden="true" />
        <input type="search" aria-label="Buscar ID de pedido" placeholder="Buscar ID de pedido"
          value={search} onChange={(event) => setSearch(event.target.value)} />
      </label>
    }>
      {visible.length ? (
        <ul className="admin-source-grid" role="list">
          {visible.map((client) => {
            const ready = changes[client.id] ?? client.fuentesListas ?? 0;
            const done = ready >= client.fuentes;
            const status = done ? "complete" : ready > 0 ? "progress" : "waiting";
            const StatusIcon = done ? LuCheck : ready > 0 ? LuFlame : LuClock;
            return (
              <li key={client.id} className="admin-source-card" data-progress={status}>
                <div className="admin-source-heading">
                  <span className="admin-source-code">{client.id}</span>
                  <span className="admin-source-status">
                    <StatusIcon aria-hidden="true" /> {done ? "Completo" : ready > 0 ? "En proceso" : "Pendiente"}
                  </span>
                </div>
                <p className="admin-source-name">{client.nombre}</p>
                <div className="admin-source-controls">
                  <div className="admin-source-progress">
                    <span><strong>{ready}/{client.fuentes}</strong> listas</span>
                    <progress value={ready} max={client.fuentes} aria-label={`Fuentes listas de ${client.id}`} />
                  </div>
                  <div className="admin-stepper">
                    <button type="button" className="admin-icon-button admin-source-minus"
                      aria-label={`Restar una fuente a ${client.id}`} disabled={ready === 0}
                      onClick={() => changeCount(client, -1)}><LuMinus aria-hidden="true" /></button>
                    <button type="button" className="admin-icon-button admin-source-plus"
                      aria-label={`Sumar una fuente a ${client.id}`} disabled={done}
                      onClick={() => changeCount(client, 1)}><LuPlus aria-hidden="true" /></button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : <p className="admin-page-body admin-empty-text">{query ? "No se encontraron pedidos con ese ID." : "No hay pedidos para actualizar."}</p>}
      <footer className="admin-page-actions">
        {pending.length > 0 && <span className="admin-action-note">{pending.length} {pending.length === 1 ? "pedido con cambios" : "pedidos con cambios"}</span>}
        <button type="button" className="admin-button admin-button-primary" disabled={!pending.length}
          onClick={() => { setError(""); setConfirm(true); }}>
          <LuSave aria-hidden="true" /> Guardar cambios
        </button>
      </footer>
      {confirm && <AdminConfirm title="Guardar fuentes listas" icon={LuSave}
        confirmLabel={saving ? "Guardando..." : "Guardar"} busy={saving} error={error}
        onCancel={() => setConfirm(false)} onConfirm={save}>
        Se actualizarán las fuentes listas de {pending.length} {pending.length === 1 ? "pedido" : "pedidos"}.
      </AdminConfirm>}
    </AdminSection>
  );
}
