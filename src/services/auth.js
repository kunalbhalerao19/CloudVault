
import './amplifyConfig';

import {
  signUp,
  confirmSignUp,
  signIn,
  signOut,
  getCurrentUser,
} from 'aws-amplify/auth';

export async function register(name, email, password) {
  if (!name || !email || !password) {
    throw new Error('All fields are required.');
  }

  const result = await signUp({
    username: email.trim().toLowerCase(),
    password,
    options: {
      userAttributes: {
        email: email.trim().toLowerCase(),
        name: name.trim(),
      },
    },
  });

  return {
    isSignUpComplete: result.isSignUpComplete,
    nextStep: result.nextStep,
  };
}

export async function confirmRegistration(email, code) {
  return await confirmSignUp({
    username: email.trim().toLowerCase(),
    confirmationCode: code.trim(),
  });
}

export async function login(email, password) {
  const result = await signIn({
    username: email.trim().toLowerCase(),
    password,
  });

  if (!result.isSignedIn) {
    throw new Error(
      `Additional sign-in step required: ${result.nextStep.signInStep}`
    );
  }

  return await getCurrentUser();
}

export async function logout() {
  await signOut();
}

export async function getUser() {
  try {
    const user = await getCurrentUser();

    return {
      id: user.userId,
      name: user.username,
      email: user.signInDetails?.loginId ?? user.username,
    };
  } catch {
    return null;
  }
}

export async function isAuthenticated() {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}
