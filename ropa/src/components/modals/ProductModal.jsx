import { useEffect, useState } from 'react';

const INITIAL_STATE = {
  code: '',
  category: '',
  name: '',
  stock: '',
  unit: 'und (unidades)',
  cost: '',
  minStock: '',
};

const buildForm = (product) => {
  if (!product) return INITIAL_STATE;
  return {
    code: product.code,
    category: product.category,
    name: product.name,
    stock: String(product.stock),
    unit: product.unit === 'caja' ? 'caja (Aprox. 25 a 40 unidades)' : 'und (unidades)',
    cost: String(product.cost),
    minStock: String(product.minStock),
  };
};

export default function ProductModal({ open, onClose, onSave, product, existingCodes = [] }) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [error, setError] = useState('');
  const isEditing = Boolean(product);

  useEffect(() => {
    if (open) {
      setForm(buildForm(product));
      setError('');
    }
  }, [open, product]);

  if (!open) return null;

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = () => {
    if (!form.code || !form.name || !form.category || form.stock === '' || form.cost === '') {
      setError('Complete todos los campos obligatorios.');
      return;
    }
    const otherCodes = isEditing
      ? existingCodes.filter((code) => code !== product.code)
      : existingCodes;
    if (otherCodes.includes(form.code.trim())) {
      setError('Ya existe un producto con ese código.');
      return;
    }
    setError('');

    const unit = form.unit.split(' ')[0];
    onSave({
      code: form.code.trim(),
      name: form.name.trim(),
      category: form.category,
      stock: parseInt(form.stock, 10) || 0,
      unit,
      cost: parseInt(form.cost, 10) || 0,
      minStock: parseInt(form.minStock, 10) || 0,
    });
  };

  return (
    <div className="modal-overlay open">
      <div className="modal-box">
        <div className="modal-head">
          <div className="modal-title">
            {isEditing ? 'Editar producto' : 'Registrar nuevo producto'}
          </div>
          <button className="modal-close" type="button" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="np-codigo">Código</label>
              <input
                className="field-input"
                id="np-codigo"
                type="text"
                placeholder="Ej: M-001"
                value={form.code}
                onChange={handleChange('code')}
              />
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="np-categoria">Categoría</label>
              <select
                className="field-select"
                id="np-categoria"
                value={form.category}
                onChange={handleChange('category')}
              >
                <option value="">Seleccionar...</option>
                <option>Masculino</option>
                <option>Femenino</option>
                <option>Unisex</option>
              </select>
            </div>
          </div>
          <div className="form-row-full">
            <div className="form-field">
              <label className="field-label" htmlFor="np-nombre">Nombre del producto</label>
              <input
                className="field-input"
                id="np-nombre"
                type="text"
                placeholder="Ej: Bodys en polilycra embonada"
                value={form.name}
                onChange={handleChange('name')}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="np-stock">
                {isEditing ? 'Stock' : 'Stock inicial'}
              </label>
              <input
                className="field-input"
                id="np-stock"
                type="number"
                placeholder="0"
                min="0"
                value={form.stock}
                onChange={handleChange('stock')}
              />
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="np-unidad">Unidad</label>
              <select
                className="field-select"
                id="np-unidad"
                value={form.unit}
                onChange={handleChange('unit')}
              >
                <option>und (unidades)</option>
                <option>caja (Aprox. 25 a 40 unidades)</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="field-label" htmlFor="np-costo">Costo unitario ($)</label>
              <input
                className="field-input"
                id="np-costo"
                type="number"
                placeholder="0"
                min="0"
                value={form.cost}
                onChange={handleChange('cost')}
              />
            </div>
            <div className="form-field">
              <label className="field-label" htmlFor="np-minimo">Stock mínimo</label>
              <input
                className="field-input"
                id="np-minimo"
                type="number"
                placeholder="0"
                min="0"
                value={form.minStock}
                onChange={handleChange('minStock')}
              />
            </div>
          </div>
          <div id="modal-error" style={{ fontSize: '12px', color: '#e24b4a', minHeight: '16px' }}>
            {error}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" type="button" onClick={handleSubmit}>
            {isEditing ? 'Guardar cambios' : 'Guardar producto'}
          </button>
        </div>
      </div>
    </div>
  );
}