import { useMemo, useState } from 'react';

export default function ClientsPage({ invoices = [], formatCurrency }) {
  const [search, setSearch] = useState('');

  const clients = useMemo(() => {
    const map = new Map();
    // Las facturas vienen de la más nueva a la más vieja:
    // el primer registro de cada cliente trae su nombre y fecha más recientes.
    invoices.forEach((invoice) => {
      const key = invoice.nit || `name:${invoice.client.trim().toLowerCase()}`;
      const current = map.get(key) || {
        key,
        nit: invoice.nit || '',
        name: invoice.client,
        count: 0,
        total: 0,
        last: invoice.issuedAt,
      };
      if (invoice.status !== 'Cancelada') {
        current.count += 1;
        current.total += invoice.total;
      }
      map.set(key, current);
    });
    return [...map.values()];
  }, [invoices]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(term) || client.nit.includes(term),
    );
  }, [clients, search]);

  return (
    <>
      <div className="page-header">
        <div className="page-title">Clientes</div>
        <div className="page-sub">Clientes registrados a partir de las facturas emitidas</div>
      </div>

      <div className="actions-row">
        <input
          className="search-input"
          type="text"
          placeholder="Buscar por nombre o NIT..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>NIT</th>
              <th>Razón social</th>
              <th>Facturas</th>
              <th>Total facturado</th>
              <th>Última factura</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="5">
                  {clients.length === 0
                    ? 'No hay clientes. Aparecerán al emitir facturas.'
                    : 'Ningún cliente coincide con la búsqueda.'}
                </td>
              </tr>
            ) : (
              filtered.map((client) => (
                <tr key={client.key}>
                  <td>{client.nit || '—'}</td>
                  <td>{client.name}</td>
                  <td>{client.count}</td>
                  <td>{formatCurrency(client.total)}</td>
                  <td>{client.last}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}