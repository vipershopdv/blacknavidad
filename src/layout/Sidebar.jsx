import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalculator, faChevronDown, faChevronLeft, faChevronRight, faFire, faHouse, faPlus, faTrash,
} from "@fortawesome/free-solid-svg-icons";

const menuItems = [
  { key: "home", label: "Inicio", icon: faHouse },
  { key: "register", label: "Registrar cliente", icon: faPlus },
  { key: "fuentes", label: "Ingresar fuentes", icon: faFire },
  { key: "accounting", label: "Contabilidad", icon: faCalculator },
  { key: "delete", label: "Eliminar clientes", icon: faTrash },
];

export default function Sidebar({ page, setPage, collapsed, onToggleCollapsed }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = menuItems.find((item) => item.key === page) ?? menuItems[0];

  return (
    <aside className={`admin-sidebar${collapsed ? " admin-sidebar-collapsed" : ""}`}>
      <div className="admin-sidebar-heading">
        <p>Panel general</p>
        <button type="button" className="admin-icon-button admin-sidebar-toggle"
          aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
          aria-expanded={!collapsed} aria-controls="admin-navigation" onClick={onToggleCollapsed}>
          <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronLeft} />
        </button>
      </div>
      <button type="button" className="admin-mobile-nav admin-button admin-button-secondary"
        aria-expanded={mobileOpen} aria-controls="admin-navigation"
        aria-label={`Cambiar sección: ${current.label}`}
        onClick={() => setMobileOpen((open) => !open)}>
        <FontAwesomeIcon icon={current.icon} />
        <span>{current.label}</span>
        <FontAwesomeIcon icon={faChevronDown} className="admin-chevron" />
      </button>
      <nav id="admin-navigation" aria-label="Administración"
        className={`admin-nav${mobileOpen ? " admin-nav-open" : ""}`}>
        {menuItems.map(({ key, label, icon }) => (
          <button type="button" key={key} className="admin-nav-item"
            aria-current={key === page ? "page" : undefined}
            aria-label={label}
            data-label={label}
            onClick={() => {
              setPage(key);
              setMobileOpen(false);
            }}>
            <FontAwesomeIcon icon={icon} />
            <span className="admin-nav-label">{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
