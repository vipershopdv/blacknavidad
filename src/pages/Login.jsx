import { useRef, useState } from "react";
import { LuArrowLeft, LuEye, LuEyeOff, LuLockKeyhole, LuLogIn, LuMail, LuShieldCheck } from "react-icons/lu";
import { isAdmin, supabase } from "../supabase/config";

export default function Login({ onBackToPublic }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);

  const handleChange = ({ target }) => {
    setForm((current) => ({ ...current, [target.name]: target.value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (pending.current) return;

    pending.current = true;
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
      pending.current = false;
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page" aria-labelledby="admin-login-title">
      <section className="admin-login-panel">
        <header className="admin-login-heading">
          <span className="admin-login-symbol"><LuShieldCheck aria-hidden="true" /></span>
          <h1 id="admin-login-title">Acceso administrador</h1>
          <p>Ingresa con tu cuenta de Inv. Salas.</p>
        </header>

        <form className="admin-login-form" onSubmit={handleSubmit} aria-busy={loading}>
          <div className="admin-login-field">
            <label htmlFor="admin-email">Correo electrónico</label>
            <div className="admin-login-input">
              <LuMail aria-hidden="true" />
              <input id="admin-email" type="email" name="email" autoComplete="username"
                required disabled={loading} value={form.email} onChange={handleChange}
                placeholder="correo@ejemplo.com" autoCapitalize="none" spellCheck={false}
                aria-describedby={error ? "admin-login-error" : undefined} />
            </div>
          </div>
          <div className="admin-login-field">
            <label htmlFor="admin-password">Contraseña</label>
            <div className="admin-login-input">
              <LuLockKeyhole aria-hidden="true" />
              <input id="admin-password" type={showPassword ? "text" : "password"} name="password"
                autoComplete="current-password" required disabled={loading}
                value={form.password} onChange={handleChange} placeholder="Ingresa tu contraseña"
                aria-describedby={error ? "admin-login-error" : undefined} />
              <button type="button" className="admin-icon-button admin-login-toggle" disabled={loading}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-controls="admin-password" aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}>
                {showPassword ? <LuEyeOff aria-hidden="true" /> : <LuEye aria-hidden="true" />}
              </button>
            </div>
          </div>

          {error && <p className="admin-login-error" id="admin-login-error" role="alert">{error}</p>}
          <button type="submit" className="admin-button admin-button-primary admin-login-submit" disabled={loading}>
            <LuLogIn aria-hidden="true" /> {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
        {onBackToPublic && (
          <footer className="admin-login-footer">
            <button type="button" className="admin-button admin-button-secondary" onClick={onBackToPublic}>
              <LuArrowLeft aria-hidden="true" /> Volver a la consulta
            </button>
          </footer>
        )}
      </section>
    </main>
  );
}
