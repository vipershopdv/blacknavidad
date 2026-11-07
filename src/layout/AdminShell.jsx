import { useState } from "react";
import Sidebar from "./Sidebar";

export default function AdminShell({ page, setPage, children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`admin-layout${collapsed ? " admin-layout-collapsed" : ""}`}>
      <Sidebar page={page} setPage={setPage} collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((value) => !value)} />
      <main className="admin-workspace">{children}</main>
    </div>
  );
}
