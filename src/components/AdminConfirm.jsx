import { useEffect, useId, useRef } from "react";

export default function AdminConfirm({ title, icon: Icon, children, confirmLabel, danger, busy, error, onCancel, onConfirm }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog ref={ref} className="admin-dialog" aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}>
      <header className="admin-dialog-header">
        <div className="admin-dialog-title">
          <span className={danger ? "admin-dialog-symbol is-danger" : "admin-dialog-symbol"}><Icon aria-hidden="true" /></span>
          <h2 id={titleId}>{title}</h2>
        </div>
      </header>
      <div className="admin-dialog-message">{children}</div>
      {error && <p className="admin-dialog-error" role="alert">{error}</p>}
      <footer className="admin-dialog-actions">
        <button type="button" className="admin-button admin-button-secondary" onClick={onCancel} disabled={busy}>Cancelar</button>
        <button type="button" className={`admin-button ${danger ? "admin-button-danger" : "admin-button-primary"}`}
          onClick={onConfirm} disabled={busy}>{confirmLabel}</button>
      </footer>
    </dialog>
  );
}
