const USER_KEY = 'cloudvault_user';

/**
 * Simulates a login — accepts any non-empty email/password.
 * Stores user to localStorage and returns the user object.
 */
export function login(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const user = {
    id: 'usr_' + Math.random().toString(36).slice(2, 10),
    name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    email,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

/**
 * Simulates registration.
 */
export function register(name, email, password) {
  if (!name || !email || !password) {
    throw new Error('All fields are required.');
  }

  const user = {
    id: 'usr_' + Math.random().toString(36).slice(2, 10),
    name,
    email,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

/**
 * Clears the current session.
 */
export function logout() {
  localStorage.removeItem(USER_KEY);
}

/**
 * Returns the current user or null.
 */
export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Returns true if a user is currently logged in.
 */
export function isAuthenticated() {
  return Boolean(getUser());
}
