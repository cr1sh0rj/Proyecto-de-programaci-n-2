import { useMemo, useState } from 'react';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import MainLayout from './components/MainLayout';
import './styles/app.css';
import './styles/responsive.css';
import datosIniciales from './data/datos.json';
import usePersistentState from './utils/usePersistentState';
import {formatCurrency,formatDate,formatDateShort,parseLocalDate,} from './utils/formatters';
import { addRegisteredUser, findRegisteredUser } from './utils/userStorage';

const LOGIN_PASSWORDS = {
  inventario: 'inv123',
  facturacion: 'fac123',
};

const getDefaultUser = (role) =>
  role === 'inventario' ? 'Jefe de Inventario' : 'Facturador';

const INITIAL_PRODUCTS = datosIniciales.productos.map((p) => ({
  code: p.codigo,
  name: p.nombre,
  category: p.categoria,
  stock: p.stock,
  unit: p.unidad,
  cost: p.costo,
  minStock: p.minStock ?? 0,
}));
export default function App() {
  const [screen, setScreen] = useState('login');
  const [role, setRole] = useState('inventario');
  const [userName, setUserName] = useState('');
  const [loginError, setLoginError] = useState('');
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [activePage, setActivePage] = useState('dashboard-inv');
  const [products, setProducts] = usePersistentState('ropa.products.v1', INITIAL_PRODUCTS);
  const [movements, setMovements] = usePersistentState('ropa.movements.v1', []);
  const [invoices, setInvoices] = usePersistentState('ropa.invoices.v1', []);
  const [invoiceCounter, setInvoiceCounter] = usePersistentState('ropa.invoiceCounter.v1', 1);
  const [suppliers, setSuppliers] = usePersistentState('ropa.suppliers.v1', []);
  const RESTOCK_AMOUNT = 50;

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.code, product])),
    [products],
  );

  const handleSelectRole = (nextRole) => {
    setRole(nextRole);
    setLoginError('');
  };

  const handleOpenRegister = () => {
    setLoginError('');
    setRegistrationMessage('');
    setScreen('register');
  };

  const handleRegister = async (newUser) => {
    const result = await addRegisteredUser(newUser);
    if (result.ok) {
      setRole(newUser.role);
      setRegistrationMessage('Cuenta creada correctamente. Ya puedes iniciar sesión.');
      setLoginError('');
      setScreen('login');
    }
    return result;
  };

  const handleLogin = async ({ user, pass }) => {
    if (!pass) {
      setLoginError('Por favor ingrese su clave de acceso.');
      return;
    }

    const normalizedUser = user?.trim().toLocaleLowerCase();
    let registeredUser;
    try {
      registeredUser = normalizedUser ? await findRegisteredUser(normalizedUser) : null;
    } catch {
      setLoginError('No se pudieron leer las cuentas guardadas en este navegador.');
      return;
    }

    if (registeredUser) {
      let passwordMatches;
      try {
        passwordMatches = await registeredUser.verifyPassword(pass);
      } catch {
        setLoginError('No se pudo verificar la cuenta guardada.');
        return;
      }
      if (!passwordMatches) {
        setLoginError('Usuario o contraseña incorrectos.');
        return;
      }
      setRole(registeredUser.role);
      setUserName(registeredUser.fullName);
      setActivePage(registeredUser.role === 'inventario' ? 'dashboard-inv' : 'dashboard-fac');
    } else if (pass !== LOGIN_PASSWORDS[role]) {
      setLoginError('Clave incorrecta. Verifique e intente de nuevo.');
      return;
    } else {
      const name = user?.trim() || getDefaultUser(role);
      setUserName(name);
      setActivePage(role === 'inventario' ? 'dashboard-inv' : 'dashboard-fac');
    }

    setLoginError('');
    setRegistrationMessage('');
    setScreen('main');
  };

  const handleLogout = () => {
    setScreen('login');
    setRole('inventario');
    setUserName('');
    setLoginError('');
    setRegistrationMessage('');
    setActivePage('dashboard-inv');
  };

  const handleAddProduct = (product) => {
    setProducts((prev) => [...prev, product]);
  };
  const handleEditProduct = (oldCode, updated) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.code === oldCode ? { ...product, ...updated } : product,
      ),
    );
    setMovements((prev) =>
      prev.map((movement) =>
        movement.productCode === oldCode
          ? { ...movement, productCode: updated.code, product: updated.name }
          : movement,
      ),
    );
  };
  const handleDeleteProduct = (code) => {
    setProducts((prev) => prev.filter((product) => product.code !== code));
  };
  const handleAddSupplier = (supplier) => {
  setSuppliers((prev) => [...prev, supplier]);
  };

  const handleEditSupplier = (nit, updated) => {
    setSuppliers((prev) =>
      prev.map((supplier) =>
        supplier.nit === nit ? { ...supplier, ...updated } : supplier,
      ),
    );
  };

  const handleDeleteSupplier = (nit) => {
    setSuppliers((prev) => prev.filter((supplier) => supplier.nit !== nit));
  };
    const handleAddMovement = (movement) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.code !== movement.productCode) return product;
        const nextStock =
          movement.type === 'Entrada'
            ? product.stock + movement.qty
            : Math.max(0, product.stock - movement.qty);
        return { ...product, stock: nextStock };
      }),
    );
    setMovements((prev) => [movement, ...prev]);
  };

  const handleDeleteMovement = (id) => {
    const target = movements.find((movement) => movement.id === id);
    if (target?.productCode) {
      setProducts((prev) =>
        prev.map((product) => {
          if (product.code !== target.productCode) return product;
          const nextStock =
            target.type === 'Entrada'
              ? Math.max(0, product.stock - target.qty)
              : product.stock + target.qty;
          return { ...product, stock: nextStock };
        }),
      );
    }
    setMovements((prev) => prev.filter((movement) => movement.id !== id));
  };
    const handleRestock = (codes) => {
    const today = formatDate(new Date());
    const entries = products
      .filter((product) => codes.includes(product.code))
      .map((product) => ({
        id: `${Date.now()}-${Math.random()}`,
        date: today,
        type: 'Entrada',
        product: product.name,
        productCode: product.code,
        category: product.category,
        qty: RESTOCK_AMOUNT,
        quantity: `+${RESTOCK_AMOUNT} ${product.unit}`,
        responsible: 'Orden de reposición',
      }));

    setProducts((prev) =>
      prev.map((product) =>
        codes.includes(product.code)
          ? { ...product, stock: product.stock + RESTOCK_AMOUNT }
          : product,
      ),
    );
    setMovements((prev) => [...entries, ...prev]);
  };

  const handleDeleteInvoice = (id) => {
    setInvoices((prev) =>
       prev.map((invoice) => 
        invoice.id === id ? { ...invoice, status: 'Cancelada' } : invoice,
      ),
    );
  };
  const handleEmitInvoice = ({ client,nit, date, payment, lines }) => {
    const issuedAt = parseLocalDate(date);
    const dueDate = issuedAt ? new Date(issuedAt) : null;
    if (dueDate) {
      dueDate.setDate(dueDate.getDate() + 15);
    }

    const subtotal = lines.reduce(
      (sum, line) => sum + line.quantity * line.price,
      0,
    );
    const ivaTotal = lines.reduce(
      (sum, line) => sum + line.quantity * line.price * (line.iva / 100),
      0,
    );
    const total = subtotal + ivaTotal;

    const status = payment === 'Contado' ? 'Pagada' : 'Pendiente';
    const number = `FV-${String(invoiceCounter).padStart(4, '0')}`;
    setInvoiceCounter((prev) => prev + 1);

    setInvoices((prev) => [
      {
        id: number,
        number,
        client,
        issuedAt: formatDateShort(issuedAt),
        dueAt: formatDateShort(dueDate),
        total,
        nit,
        issuedDate: date,
        subtotal,
        iva: ivaTotal,
        status,
      },
      ...prev,
    ]);

    setProducts((prev) =>
      prev.map((product) => {
        const line = lines.find((item) => item.code === product.code);
        if (!line) return product;
        const nextStock = Math.max(0, product.stock - line.quantity);
        return { ...product, stock: nextStock };
      }),
    );

    const movementEntries = lines.map((line) => {
      const product = productMap.get(line.code);
      const unit = product?.unit || 'und';
      return {
        id: `${Date.now()}-${Math.random()}`,
        date: formatDate(issuedAt),
        type: 'Salida',
        product: line.name,
        category: product?.category || '',
        quantity: `-${line.quantity} ${unit}`,
        responsible: `Factura ${client}`,
      };
    });
    setMovements((prev) => [...movementEntries, ...prev]);
  };

  return (
    <div className="app">
      {screen === 'login' ? (
        <LoginScreen
          role={role}
          error={loginError}
          success={registrationMessage}
          onSelectRole={handleSelectRole}
          onLogin={handleLogin}
          onOpenRegister={handleOpenRegister}
        />
      ) : screen === 'register' ? (
        <RegisterScreen
          onRegister={handleRegister}
          onBack={() => setScreen('login')}
        />
      ) : (
        <MainLayout
          role={role}
          userName={userName}
          activePage={activePage}
          onNavigate={setActivePage}
          onLogout={handleLogout}
          products={products}
          movements={movements}
          invoices={invoices}
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          suppliers={suppliers}
          onAddSupplier={handleAddSupplier}
          onEditSupplier={handleEditSupplier}
          onDeleteSupplier={handleDeleteSupplier}
          onAddMovement={handleAddMovement}
          onRestock={handleRestock}
          onDeleteMovement={handleDeleteMovement}
          onDeleteInvoice={handleDeleteInvoice}
          onEmitInvoice={handleEmitInvoice}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}
