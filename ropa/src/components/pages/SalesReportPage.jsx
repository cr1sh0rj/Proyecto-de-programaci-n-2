import { useMemo, useState } from 'react';

const getMonthKey = (invoice) => {
  if (invoice.issuedDate) return invoice.issuedDate.slice(0, 7);
  // Facturas viejas: solo tienen "dd/mm", se asume el año actual
  const [, month] = (invoice.issuedAt || '').split('/');
  if (!month) return null;
  return `${new Date().getFullYear()}-${month.padStart(2, '0')}`;
};

const getMonthLabel = (key) => {
  const [year, month] = key.split('-').map(Number);
  const label = new Date(year, month - 1, 1).toLocaleDateString('es-CO', {
    month: 'long',
    year: 'numeric',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export default function SalesReportPage({ invoices = [], formatCurrency }) {
  const [onlyPaid, setOnlyPaid] = useState(false);

  const rows = useMemo(() => {
    const included = invoices.filter(
      (invoice) =>
        invoice.status !== 'Cancelada' && (!onlyPaid || invoice.status === 'Pagada'),
    );
    const byMonth = new Map();
    included.forEach((invoice) => {
      const key = getMonthKey(invoice);
      if (!key) return;
      const current = byMonth.get(key) || { key, count: 0, subtotal: 0, iva: 0, total: 0 };
      current.count += 1;
      current.subtotal += invoice.subtotal ?? invoice.total;
      current.iva += invoice.iva ?? 0;
      current.total += invoice.total;
      byMonth.set(key, current);
    });
    return [...byMonth.values()].sort((a, b) => b.key.localeCompare(a.key));
  }, [invoices, onlyPaid]);

  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0);
  const invoiceCount = rows.reduce((sum, row) => sum + row.count, 0);
  const average = rows.length ? grandTotal / rows.length : 0;
  const best = rows.reduce(
    (top, row) => (!top || row.total > top.total ? row : top),
    null,
  );

  return (
    <>
      <div className="page-header">
        <div className="page-title">Reporte de ventas</div>
        <div className="page-sub">Análisis de facturación por período</div>
      </div>

      <div className="actions-row">
        <button
          className={onlyPaid ? 'btn-secondary' : 'btn-primary'}
          type="button"
          onClick={() => setOnlyPaid(false)}
        >
          Todas (sin canceladas)
        </button>
        <button
          className={onlyPaid ? 'btn-primary' : 'btn-secondary'}
          type="button"
          onClick={() => setOnlyPaid(true)}
        >
          Solo pagadas
        </button>
      </div>

      <div className="metrics-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="metric-card">
          <div className="metric-label">Total acumulado</div>
          <div className="metric-value">{formatCurrency(grandTotal)}</div>
          <div className="metric-change" style={{ color: '#6b8299' }}>
            {invoiceCount === 0 ? 'Sin registros aún' : `${invoiceCount} factura(s)`}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Promedio mensual</div>
          <div className="metric-value">{formatCurrency(average)}</div>
          <div className="metric-change" style={{ color: '#6b8299' }}>
            {rows.length === 0 ? 'Sin registros aún' : `${rows.length} mes(es) con ventas`}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Mejor mes</div>
          <div className="metric-value">{best ? getMonthLabel(best.key) : '—'}</div>
          <div className="metric-change" style={{ color: '#6b8299' }}>
            {best ? formatCurrency(best.total) : 'Sin datos'}
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div className="table-title">Ventas por mes</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Mes</th>
              <th>Facturas</th>
              <th>Ventas brutas</th>
              <th>IVA</th>
              <th>Total neto</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="5">No hay datos de ventas. Comienza emitiendo facturas.</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.key}>
                  <td>{getMonthLabel(row.key)}</td>
                  <td>{row.count}</td>
                  <td>{formatCurrency(row.subtotal)}</td>
                  <td>{formatCurrency(row.iva)}</td>
                  <td>{formatCurrency(row.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}