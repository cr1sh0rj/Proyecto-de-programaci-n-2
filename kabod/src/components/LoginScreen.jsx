import { useEffect, useState } from 'react';
import heroImage from '../assets/logo.png';

export default function LoginScreen({ role, error, onSelectRole, onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  useEffect(() => {
    setPass('');
  }, [role]);

  const handleSubmit = () => onLogin({ user, pass });

  return (
    <div id="login-screen" className="screen active">
      <div className="login-wrapper">
        <div className="login-card">
          <img className="brand-image" src={heroImage} alt="Imagen de marca de Symrise" />
          <div className="brand-name">SymriseNexus</div>
          <div className="brand-sub">Para Symrise S.A.S</div>
          <div className="divider-line"></div>
          <div className="login-title">Sistema de Gestión de Perfumes</div>

          <div className="role-tabs">
            <button
              className={`role-tab ${role === 'inventario' ? 'selected' : ''}`}
              id="tab-inv"
              type="button"
              onClick={() => onSelectRole('inventario')}
            >
              <span className="role-icon">📦</span>
              <span>Inventario</span>
            </button>
            <button
              className={`role-tab ${role === 'facturacion' ? 'selected' : ''}`}
              id="tab-fac"
              type="button"
              onClick={() => onSelectRole('facturacion')}
            >
              <span className="role-icon">🧾</span>
              <span>Facturación</span>
            </button>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-user">Usuario</label>
            <input
              className="form-input"
              id="login-user"
              type="text"
              placeholder="Ingrese su usuario"
              value={user}
              onChange={(event) => setUser(event.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-pass">Clave de acceso</label>
            <input
              className="form-input"
              id="login-pass"
              type="password"
              placeholder="••••••••"
              value={pass}
              onChange={(event) => setPass(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSubmit();
              }}
            />
          </div>

          <button className="btn-login" type="button" onClick={handleSubmit}>
            Ingresar al sistema
          </button>

          <div className="error-msg" id="login-error">{error}</div>
          <div className="hint-text">Inventario: inv123 — Facturación: fac123</div>

          {/* Links actuales: Facebook https://www.facebook.com/ | Instagram https://www.instagram.com/ | LinkedIn https://www.linkedin.com/ */}
          <div className="social-links" aria-label="Redes sociales de 
          
          Symrise S.A.S">
            <a
              className="social-link"
              href="https://www.facebook.com/symrisetienda/"
              target="_blank"
              rel="noreferrer"
            >
              Facebook
            </a>
            <a
              className="social-link"
              href="https://www.instagram.com/symrisetienda/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
            <a
              className="social-link"
              href="https://www.linkedin.com/company/symrise"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
