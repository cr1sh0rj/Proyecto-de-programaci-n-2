import { useEffect, useState } from 'react';

const INITIAL_STATE = {
  type: '',
  date: '',
  productCode: '',
  quantity: '',
  responsible: '',
};

export default function MovementModal({ open, onClose, onSave, products = [] }) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({
        ...INITIAL_STATE,
        date: new Date().toISOString().split('T')[0],
      });
      setError('');
    }
  }, [open]);

  if (!open) return null;

  const selected = products.find((product) => product.code === form.productCode);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = () => {
    if (!form.type || !form.date || !form.productCode || !form.quantity || !form.responsible.trim()) {
      setError('Complete todos los campos.');
      return;
    }
    const qty = parseInt(form.quantity, 10);
    if (!qty || qty < 1) {
      setError('La cantidad debe ser un número mayor a 0.');
      return;
    }
    if (form.type === 'Salida' && qty > selected.stock) {
      setError(`Stock insuficiente. Disponible: ${selected.stock} ${selected.unit}`);
      return;
    }
    setError('');
    onSave({
      type: form.type,
      date: form.date,
      productCode: form.productCode,
      quantity: String(qty),
      responsible: form.responsible.trim(),
    });
  };

  return (
    <div className="modal-overlay open">
      <div className="modal-box">
        <div className="modal-head">
          <div className="modal-title">Registrar movimiento</div>
          <button className="modal-close" type="button" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="mov-tipo">Tipo *</label>
              <select
                className="field-select"
                id="mov-tipo"
                value={form.type}
                onChange={handleChange('type')}
              >
                <option value="">Seleccionar...</option>
                <option>Entrada</option>
                <option>Salida</option>
              </select>
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="mov-fecha">Fecha *</label>
              <input
                className="field-input"
                id="mov-fecha"
                type="date"
                value={form.date}
                onChange={handleChange('date')}
              />
            </div>
          </div>
          <div className="form-row-full">
            <div className="form-field">
              <label className="field-label" htmlFor="mov-producto">Producto *</label>
              <select
                className="field-select"
                id="mov-producto"
                value={form.productCode}
                onChange={handleChange('productCode')}
              >
                <option value="">
                  {products.length === 0 ? 'Primero registra productos' : 'Seleccionar...'}
                </option>
                {products.map((product) => (
                  <option key={product.code} value={product.code}>
                    {product.code} — {product.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="mov-categoria">Categoría</label>
              <input
                className="field-input"
                id="mov-categoria"
                type="text"
                value={selected ? selected.category : ''}
                placeholder="Se completa sola"
                disabled
              />
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="mov-cantidad">
                Cantidad *{selected ? ` (stock: ${selected.stock} ${selected.unit})` : ''}
              </label>
              <input
                className="field-input"
                id="mov-cantidad"
                type="number"
                placeholder="0"
                min="1"
                value={form.quantity}
                onChange={handleChange('quantity')}
              />
            </div>
          </div>
          <div className="form-row-full">
            <div className="form-field">
              <label className="field-label" htmlFor="mov-responsable">Responsable *</label>
              <input
                className="field-input"
                id="mov-responsable"
                type="text"
                placeholder="Nombre del responsable..."
                value={form.responsible}
                onChange={handleChange('responsible')}
              />
            </div>
          </div>
          <div id="mov-error" style={{ fontSize: '12px', color: '#e24b4a', minHeight: '16px' }}>
            {error}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" type="button" onClick={handleSubmit}>
            Registrar
          </button>
        </div>
      </div>
    </div>
  );
}