import { useMemo, useState } from 'react';
import SupplierModal from '../modals/SupplierModal';
import ConfirmModal from '../modals/ConfirmModal';

export default function SuppliersPage({
  suppliers = [],
  onAddSupplier,
  onEditSupplier,
  onDeleteSupplier,
}) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(term) ||
        supplier.nit.toLowerCase().includes(term),
    );
  }, [suppliers, search]);

  const notify = (message) => {
    setSuccessMsg(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSave = (data) => {
    if (editTarget) {
      onEditSupplier(editTarget.nit, data);
      notify('Proveedor actualizado correctamente.');
    } else {
      onAddSupplier(data);
      notify('Proveedor registrado correctamente.');
    }
    setShowModal(false);
    setEditTarget(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditTarget(null);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDeleteSupplier(deleteTarget.nit);
      setDeleteTarget(null);
      notify('Proveedor eliminado correctamente.');
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">Proveedores</div>
        <div className="page-sub">Directorio de proveedores registrados</div>
      </div>

      <div className="success-banner" style={{ display: showSuccess ? 'block' : 'none' }}>
        {successMsg}
      </div>

      <div className="actions-row">
        <input
          className="search-input"
          type="text"
          placeholder="Buscar proveedor..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button
          className="btn-primary"
          type="button"
          onClick={() => {
            setEditTarget(null);
            setShowModal(true);
          }}
        >
          + Nuevo proveedor
        </button>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>NIT</th>
              <th>Proveedor</th>
              <th>Especialidad</th>
              <th>Contacto</th>
              <th>Estado</th>
              <th style={{ width: '150px' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="6">No hay proveedores registrados.</td>
              </tr>
            ) : (
              filtered.map((supplier) => (
                <tr key={supplier.nit}>
                  <td>{supplier.nit}</td>
                  <td>{supplier.name}</td>
                  <td>{supplier.specialty}</td>
                  <td>{supplier.contact}</td>
                  <td>
                    <span className={`badge ${supplier.status === 'Activo' ? 'badge-ok' : 'badge-out'}`}>
                      {supplier.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-secondary"
                      type="button"
                      style={{ padding: '4px 10px', fontSize: '12px', marginRight: '6px' }}
                      onClick={() => {
                        setEditTarget(supplier);
                        setShowModal(true);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-delete-row"
                      type="button"
                      onClick={() => setDeleteTarget(supplier)}
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <SupplierModal
        open={showModal}
        supplier={editTarget}
        existingNits={suppliers.map((s) => s.nit)}
        onClose={handleCloseModal}
        onSave={handleSave}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Confirmar eliminación"
        text="¿Deseas eliminar este proveedor?"
        detail={deleteTarget ? `${deleteTarget.nit} — ${deleteTarget.name}` : '—'}
        confirmLabel="Sí, eliminar"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}