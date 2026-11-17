import { useState } from 'react';

export default function LoginScreen({ role, error, success, onSelectRole, onLogin, onOpenRegister }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const handleSubmit = () => onLogin({ user, pass });
  const handleSelectRole = (nextRole) => {
    setPass('');
    onSelectRole(nextRole);
  };

  return (
    <div id="login-screen" className="screen active">
      <div className="login-wrapper">
        <div className="login-card">
          <div className="brand-name">KabodNexus</div>
          <div className="brand-sub">Para Kabod S.A.S</div>
          <div className="divider-line"></div>
          <div className="login-title">Sistema de Gestión Empresarial</div>

          <div className="role-tabs">
            <button
              className={`role-tab ${role === 'inventario' ? 'selected' : ''}`}
              id="tab-inv"
              type="button"
              onClick={() => handleSelectRole('inventario')}
            >
              <span className="role-icon">📦</span>
              <span>Inventario</span>
            </button>
            <button
              className={`role-tab ${role === 'facturacion' ? 'selected' : ''}`}
              id="tab-fac"
              type="button"
              onClick={() => handleSelectRole('facturacion')}
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
          {success && <div className="success-msg" role="status">{success}</div>}
          <button className="btn-text" type="button" onClick={onOpenRegister}>Crear una cuenta</button>
          
        </div>
      </div>
    </div>
  );
}
