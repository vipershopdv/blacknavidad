import { useEffect, useRef, useState } from "react";

import AdminShell from "./layout/AdminShell";
import SiteHeader from "./layout/SiteHeader";
import "./layout/admin-dashboard.css";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import InputSources from "./pages/InputSources";
import Accounting from "./pages/Accounting";
import PublicHome from "./pages/PublicHome";
import DeleteClients from "./pages/DeleteClients";
import { printClientTicket } from "./data/printOrder";

import { isAdmin, supabase } from "./supabase/config";
import {
  createClient,
  deleteClient as deleteOrder,
  editClient,
  listenClients,
  updateFuentes as saveFuentes,
} from "./supabase/clients";

export default function App() {
  const [view, setView] = useState("public");
  const [page, setPage] = useState("home");
  const [clients, setClients] = useState([]);
  const [clientsLoaded, setClientsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [listError, setListError] = useState("");
  const isAuthenticated = isAdmin(currentUser);

  const refreshClients = useRef(null);

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      setLoading(false);

      if (isAdmin(user)) {
        setView((current) => event === "INITIAL_SESSION" || current === "login" ? "admin" : current);
      } else {
        setClients([]);
        setClientsLoaded(false);
        if (event === "SIGNED_OUT") setView((current) => current === "login" ? current : "public");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const listener = listenClients((data) => {
      setClients(data);
      setClientsLoaded(true);
      setListError("");
    }, () => setListError("No se pudo cargar la lista de pedidos."));
    refreshClients.current = listener.refresh;
    return () => {
      refreshClients.current = null;
      listener.close();
    };
  }, [isAuthenticated]);

  if (!supabase) {
    return (
      <main className="grid min-h-[100svh] place-items-center bg-[#eef4fb] p-5 text-center">
        <p role="alert">BlackNavidad aún no está conectado a Supabase.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-[#eef4fb]">
        <div className="text-lg font-bold text-slate-900">Cargando...</div>
      </main>
    );
  }

  const addClient = async (newClient) => {
    const saved = await createClient(newClient);
    void refreshClients.current?.();
    setPage("home");
    printClientTicket(saved);
  };

  const updateClient = async (id, data) => {
    await editClient(id, data);
    void refreshClients.current?.();
  };

  const updateClientStatus = (id, estado) => updateClient(id, { estado });

  const deleteClient = async (id) => {
    await deleteOrder(id);
    void refreshClients.current?.();
  };

  const updateFuentes = async (id, fuentesListas, totalFuentes) => {
    await saveFuentes(id, fuentesListas, totalFuentes);
    void refreshClients.current?.();
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      setListError("No se pudo cerrar la sesión. Intenta de nuevo.");
      return;
    }
    setCurrentUser(null);
    setClients([]);
    setClientsLoaded(false);
    setPage("home");
    setView("public");
  };

  if (!isAuthenticated && view === "login") {
    return (
      <Login
        onBackToPublic={() => setView("public")}
      />
    );
  }

  const showHome = !isAuthenticated || view === "public";

  return (
    <div className="admin-shell">
      <SiteHeader user={isAuthenticated ? currentUser : null} isHome={showHome}
        onHome={() => setView("public")}
        onAccess={() => setView(isAuthenticated ? "admin" : "login")}
        onLogout={handleLogout} />
      {showHome ? <PublicHome /> : (
        <AdminShell page={page} setPage={setPage}>
          {listError && (
            <p role="alert" className="mb-4 text-sm text-red-700">
              {listError}{" "}
              <button type="button" className="underline" onClick={() => refreshClients.current?.()}>
                Recargar pedidos
              </button>
            </p>
          )}
          {page === "home" && (
            <Home
              clients={clients}
              updateClientStatus={updateClientStatus}
              updateClient={updateClient}
              printClientTicket={printClientTicket}
              onRegister={() => setPage("register")}
            />
          )}
          {page === "register" && <Register addClient={addClient} clients={clients} clientsLoaded={clientsLoaded} />}
          {page === "fuentes" && <InputSources clients={clients} updateFuentes={updateFuentes} />}
          {page === "accounting" && <Accounting clients={clients} />}
          {page === "delete" && <DeleteClients clients={clients} deleteClient={deleteClient} />}
        </AdminShell>
      )}
    </div>
  );
}
