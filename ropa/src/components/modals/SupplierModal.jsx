import { useEffect, useState } from 'react';

const INITIAL_STATE = {
  nit: '',
  name: '',
  specialty: '',
  contact: '',
  status: 'Activo',
};

export default function SupplierModal({ open, onClose, onSave, supplier, existingNits = [] }) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [error, setError] = useState('');
  const isEditing = Boolean(supplier);

  useEffect(() => {
    if (open) {
      setForm(supplier ? { ...supplier } : INITIAL_STATE);
      setError('');
    }
  }, [open, supplier]);

  if (!open) return null;

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = () => {
    if (!form.nit.trim() || !form.name.trim() || !form.specialty.trim() || !form.contact.trim()) {
      setError('Complete todos los campos obligatorios.');
      return;
    }
    if (!isEditing && existingNits.includes(form.nit.trim())) {
      setError('Ya existe un proveedor con ese NIT.');
      return;
    }
    setError('');
    onSave({
      nit: form.nit.trim(),
      name: form.name.trim(),
      specialty: form.specialty.trim(),
      contact: form.contact.trim(),
      status: form.status,
    });
  };

  return (
    <div className="modal-overlay open">
      <div className="modal-box">
        <div className="modal-head">
          <div className="modal-title">
            {isEditing ? 'Editar proveedor' : 'Registrar nuevo proveedor'}
          </div>
          <button className="modal-close" type="button" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="sp-nit">NIT</label>
              <input
                className="field-input"
                id="sp-nit"
                type="text"
                placeholder="Ej: 900123456-7"
                value={form.nit}
                disabled={isEditing}
                onChange={handleChange('nit')}
              />
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="sp-estado">Estado</label>
              <select
                className="field-select"
                id="sp-estado"
                value={form.status}
                onChange={handleChange('status')}
              >
                <option>Activo</option>
                <option>Inactivo</option>
              </select>
            </div>
          </div>
          <div className="form-row-full">
            <div className="form-field">
              <label className="field-label" htmlFor="sp-nombre">Nombre del proveedor</label>
              <input
                className="field-input"
                id="sp-nombre"
                type="text"
                value={form.name}
                onChange={handleChange('name')}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="sp-esp">Especialidad</label>
              <input
                className="field-input"
                id="sp-esp"
                type="text"
                placeholder="Ej: Telas, bodys..."
                value={form.specialty}
                onChange={handleChange('specialty')}
              />
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="sp-contacto">Contacto</label>
              <input
                className="field-input"
                id="sp-contacto"
                type="text"
                placeholder="Teléfono o correo"
                value={form.contact}
                onChange={handleChange('contact')}
              />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#e24b4a', minHeight: '16px' }}>{error}</div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" type="button" onClick={handleSubmit}>
            {isEditing ? 'Guardar cambios' : 'Guardar proveedor'}
          </button>
        </div>
      </div>
    </div>
  );
}