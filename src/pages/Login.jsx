import { useState } from "react";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faEnvelope,
  faLock,
  faShieldHalved,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

import { isAdmin, supabase } from "../supabase/config";

export default function Login({
  onBackToPublic,
}) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });
      if (error) throw error;
      if (!isAdmin(data.user)) {
        await supabase.auth.signOut({ scope: "local" });
        setError("Esta cuenta no tiene acceso de administrador.");
      }
    } catch {
      setError("No se pudo iniciar sesión. Verifica tus datos y conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#eef5fb] text-slate-950">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(135deg,_rgba(14,165,233,0.18),_rgba(255,255,255,0.92)_45%,_rgba(16,185,129,0.13))]" />
        <div className="absolute left-0 top-24 h-px w-full bg-white/80" />
        <div className="absolute -left-28 top-28 h-72 w-72 rounded-full bg-sky-200/45 blur-3xl" />
        <div className="absolute -right-28 top-16 h-96 w-96 rounded-full bg-cyan-200/45 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-100/50 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-4 flex items-center justify-between gap-3 rounded-[28px] border border-white/80 bg-white/85 px-4 py-3 shadow-[0_18px_60px_rgba(15,23,42,0.10)] backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-lg shadow-slate-900/20">
              IM
            </div>

            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">
                Inv. Salas
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                Edición Navidad
              </p>
            </div>
          </div>

          {onBackToPublic && (
            <button
              onClick={onBackToPublic}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
              Volver
            </button>
          )}
        </header>

        <div className="grid flex-1 items-center gap-5 pb-4 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="hidden lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/90 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-700 shadow-sm">
              <FontAwesomeIcon icon={faShieldHalved} />
              Creado por BLACK SALAS
            </div>

            <h1 className="mt-6 text-[4.6rem] font-black leading-[0.92] tracking-tight text-slate-950">
              Sistema
              <br />
              Horneados
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              Panel exclusivo para administradores
            </p>
          </section>

          <section className="mx-auto w-full max-w-[520px] rounded-[34px] border border-white/90 bg-white/85 p-5 shadow-[0_35px_100px_rgba(15,23,42,0.16)] backdrop-blur-2xl sm:p-7">
              <div className="mb-8 lg:hidden">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/90 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700 shadow-sm">
                  <FontAwesomeIcon icon={faShieldHalved} />
                  Creado por BLACK SALAS
                </div>

              <h1 className="mt-5 text-[2.55rem] font-black leading-[0.95] tracking-tight text-slate-950">
                  Sistema Horneados
                </h1>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                  Panel exclusivo para administradores
                </p>
              </div>

              <div className="mb-7">
              <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Bienvenido
                </h2>
              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                  Inicia sesión para continuar
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                    Correo electrónico
                  </label>
                <div className="flex h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 shadow-sm transition focus-within:border-sky-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-100">
                  <FontAwesomeIcon icon={faEnvelope} className="text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="correo@gmail.com"
                    className="w-full bg-transparent text-slate-950 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                    Contraseña
                  </label>
                <div className="flex h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 shadow-sm transition focus-within:border-sky-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-100">
                  <FontAwesomeIcon icon={faLock} className="text-slate-400" />
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="********"
                    className="w-full bg-transparent text-slate-950 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-emerald-500 text-base font-black text-white shadow-[0_20px_45px_rgba(16,185,129,0.28)] transition hover:-translate-y-0.5 hover:bg-emerald-400 hover:shadow-[0_26px_55px_rgba(16,185,129,0.34)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
                  {loading ? "Ingresando..." : "Ingresar"}
                </button>
              </form>
          </section>
        </div>
      </div>
    </main>
  );
}
