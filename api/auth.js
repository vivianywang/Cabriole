// React Native Firebase Authentication
// Using Firebase REST API (compatible with React Native)

const FIREBASE_API_KEY = "AIzaSyDN2NaHsWKHo9l4wvwpbvPnCRib0SM4GUw";

/**
 * Sign up new user with Firebase REST API
 */
export const signup = async (name, email, password) => {
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      let message = 'Sign up failed';
      if (data.error) {
        if (data.error.message === 'EMAIL_EXISTS') {
          message = 'Email already in use';
        } else if (data.error.message === 'INVALID_EMAIL') {
          message = 'Invalid email address';
        } else if (data.error.message === 'WEAK_PASSWORD') {
          message = 'Password should be at least 6 characters';
        } else {
          message = data.error.message;
        }
      }
      throw new Error(message);
    }

    return {
      token: data.idToken,
      user: {
        id: data.localId,
        name: name,
        email: data.email,
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Login user with Firebase REST API
 */
export const login = async (email, password) => {
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      let message = 'Login failed';
      if (data.error) {
        if (data.error.message === 'INVALID_LOGIN_CREDENTIALS' || 
            data.error.message === 'EMAIL_NOT_FOUND' ||
            data.error.message === 'INVALID_PASSWORD') {
          message = 'Invalid email or password';
        } else if (data.error.message === 'USER_DISABLED') {
          message = 'This account has been disabled';
        } else {
          message = data.error.message;
        }
      }
      throw new Error(message);
    }

    return {
      token: data.idToken,
      user: {
        id: data.localId,
        name: data.displayName || 'User',
        email: data.email,
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Sign out user
 */
export const logout = async () => {
  return Promise.resolve();
};

/**
 * Verify token with Firebase
 */
export const verifyToken = async (token) => {
  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: token,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error('Invalid token');
    }

    const user = data.users[0];
    return {
      valid: true,
      user: {
        id: user.localId,
        name: user.displayName || 'User',
        email: user.email,
      },
    };
  } catch (error) {
    throw new Error('Invalid token');
  }
};