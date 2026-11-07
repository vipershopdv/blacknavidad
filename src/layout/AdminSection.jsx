export default function AdminSection({ title, actions, children }) {
  return (
    <section className="admin-page-panel">
      <header className="admin-page-header">
        <h1>{title}</h1>
        {actions}
      </header>
      {children}
    </section>
  );
}
