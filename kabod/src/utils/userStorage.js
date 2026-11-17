const STORAGE_KEY = 'kabod.registrations.v1';
const VALID_ROLES = new Set(['inventario', 'facturacion']);

const normalize = (value) => value.trim().toLocaleLowerCase();

export function validateRegistration(data) {
  if ([data.fullName, data.username, data.email, data.password, data.confirmPassword, data.role]
    .some((value) => !String(value || '').trim())) {
    return 'Completa todos los campos obligatorios.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    return 'Ingresa un correo electrónico válido.';
  }
  if (!/^[a-zA-Z0-9._-]{3,24}$/.test(data.username.trim())) {
    return 'El usuario debe tener entre 3 y 24 caracteres: letras, números, punto, guion o guion bajo.';
  }
  if (data.password.length < 8 || !/[a-z]/.test(data.password)
    || !/[A-Z]/.test(data.password) || !/[0-9]/.test(data.password)) {
    return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.';
  }
  if (data.password !== data.confirmPassword) {
    return 'Las contraseñas no coinciden.';
  }
  if (!VALID_ROLES.has(data.role)) {
    return 'Selecciona un rol válido.';
  }
  return '';
}

const readUsers = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  const users = JSON.parse(saved);
  if (!Array.isArray(users)) throw new Error('El registro local no tiene un formato válido.');
  return users;
};

const toHex = (buffer) => Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('');
const fromHex = (hex) => new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

const makePasswordHash = async (password, salt) => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const hash = await crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt: fromHex(salt),
    iterations: 120000,
    hash: 'SHA-256',
  }, key, 256);
  return toHex(hash);
};

export async function addRegisteredUser(data) {
  const validationError = validateRegistration(data);
  if (validationError) return { ok: false, error: validationError };

  try {
    const users = readUsers();
    const username = normalize(data.username);
    const email = normalize(data.email);
    if (users.some((user) => normalize(user.username) === username)) {
      return { ok: false, error: 'Ese nombre de usuario ya está registrado.' };
    }
    if (users.some((user) => normalize(user.email) === email)) {
      return { ok: false, error: 'Ese correo electrónico ya está registrado.' };
    }

    const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
    const passwordHash = await makePasswordHash(data.password, salt);
    users.push({
      fullName: data.fullName.trim(),
      username: data.username.trim(),
      email: data.email.trim(),
      role: data.role,
      salt,
      passwordHash,
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return { ok: true };
  } catch {
    return { ok: false, error: 'No se pudo guardar la cuenta en este navegador.' };
  }
}

export async function findRegisteredUser(loginName) {
  const user = readUsers().find((entry) => normalize(entry.username) === loginName);
  if (!user) return null;
  return {
    fullName: user.fullName,
    role: user.role,
    verifyPassword: async (password) => {
      const candidate = await makePasswordHash(password, user.salt);
      const expected = fromHex(user.passwordHash);
      const actual = fromHex(candidate);
      return expected.length === actual.length && expected.every((byte, index) => byte === actual[index]);
    },
  };
}
