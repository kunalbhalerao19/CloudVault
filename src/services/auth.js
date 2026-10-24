
import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  fetchAuthSession,
} from 'aws-amplify/auth';

export async function login(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const result = await signIn({
    username: email,
    password,
  });

  if (result.nextStep?.signInStep !== 'DONE') {
    throw new Error(
      `Additional sign-in step required: ${result.nextStep.signInStep}`
    );
  }

  return await getCurrentUser();
}

export async function register(name, email, password) {
  if (!name || !email || !password) {
    throw new Error('All fields are required.');
  }

  return await signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
        name,
      },
    },
  });
}

export async function logout() {
  await signOut();
}

export async function getUser() {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

export async function isAuthenticated() {
  try {
    await fetchAuthSession();
    return Boolean((await getCurrentUser()).userId);
  } catch {
    return false;
  }
}

export async function getAccessToken() {
  const session = await fetchAuthSession();
  return session.tokens?.accessToken?.toString() ?? null;
}
