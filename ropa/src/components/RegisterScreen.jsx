import { useState } from 'react';
import { validateRegistration } from '../utils/userStorage';

const INITIAL_FORM = {
  fullName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'inventario',
};

export default function RegisterScreen({ onRegister, onBack }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateRegistration(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    const result = await onRegister(form);
    setSaving(false);
    if (!result.ok) setError(result.error);
  };

  return (
    <div className="screen active">
      <div className="login-wrapper">
        <div className="login-card register-card">
          <div className="brand-name">ColPartFlow</div>
          <div className="brand-sub">Para Colfiters S.A.S</div>
          <div className="divider-line"></div>
          <div className="login-title">Crear cuenta</div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="register-fullname">Nombre completo *</label>
              <input className="form-input" id="register-fullname" autoComplete="name" value={form.fullName} onChange={handleChange('fullName')} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="register-username">Nombre de usuario *</label>
              <input className="form-input" id="register-username" autoComplete="username" value={form.username} onChange={handleChange('username')} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="register-email">Correo electrónico *</label>
              <input className="form-input" id="register-email" type="email" autoComplete="email" value={form.email} onChange={handleChange('email')} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="register-role">Rol *</label>
              <select className="form-input" id="register-role" value={form.role} onChange={handleChange('role')}>
                <option value="inventario">Inventario</option>
                <option value="facturacion">Facturación</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="register-password">Contraseña *</label>
              <input className="form-input" id="register-password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange('password')} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm">Confirmar contraseña *</label>
              <input className="form-input" id="register-confirm" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={handleChange('confirmPassword')} />
            </div>

            <div className="hint-text register-hint">Usa al menos 8 caracteres, con mayúscula, minúscula y número.</div>
            {error && <div className="error-msg" role="alert">{error}</div>}
            <button className="btn-login" type="submit" disabled={saving}>
              {saving ? 'Guardando…' : 'Registrarme'}
            </button>
          </form>
          <button className="btn-text" type="button" onClick={onBack}>Volver al inicio de sesión</button>
        </div>
      </div>
    </div>
  );
}
