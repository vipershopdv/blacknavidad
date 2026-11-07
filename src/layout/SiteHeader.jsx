import { useEffect, useRef, useState } from "react";
import { LuChevronDown, LuHouse, LuLayoutDashboard, LuLogOut, LuShoppingBag, LuUser } from "react-icons/lu";

export default function SiteHeader({ user, isHome, onHome, onAccess, onLogout }) {
  const [open, setOpen] = useState(false);
  const accountRef = useRef(null);
  const accountButton = useRef(null);
  const name = user?.email?.split("@")[0] || "Admin";

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event) => {
      if (!accountRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      accountButton.current?.focus();
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-inner">
        <nav className="admin-global-nav" aria-label="Navegación principal">
          <button type="button" aria-current={isHome ? "page" : undefined}
            onClick={() => { setOpen(false); onHome(); }}>
            <LuHouse aria-hidden="true" /> Inicio
          </button>
          <a href="https://viper-shop.com/" target="_blank" rel="noopener noreferrer">
            <LuShoppingBag aria-hidden="true" /> Viper Shop
          </a>
        </nav>
        <div className="admin-account" ref={accountRef}>
          <button ref={accountButton} type="button"
            className={`admin-account-trigger${user ? " admin-account-signed-in" : ""}`}
            aria-label={user ? `Abrir opciones de ${name}` : "Acceso administrativo"}
            aria-expanded={user ? open : undefined} aria-controls={user && open ? "admin-account-menu" : undefined}
            onClick={() => user ? setOpen((value) => !value) : onAccess()}>
            <LuUser aria-hidden="true" />
            {user && (
              <>
                <span className="admin-account-name">{name}</span>
                <LuChevronDown aria-hidden="true" className="admin-chevron" />
              </>
            )}
          </button>
          {user && open && (
            <div id="admin-account-menu" className="admin-account-menu">
              {isHome && (
                <button type="button" onClick={() => { setOpen(false); onAccess(); }}>
                  <LuLayoutDashboard aria-hidden="true" /> Panel administrador
                </button>
              )}
              <button type="button" className="admin-account-logout" onClick={() => {
                setOpen(false);
                void onLogout();
              }}>
                <LuLogOut aria-hidden="true" /> Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
