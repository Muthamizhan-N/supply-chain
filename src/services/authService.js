import { apiClient, USE_MOCK_DATA } from './api';

const TOKEN_KEY = 'trackgpt_auth_token';
const USER_KEY = 'trackgpt_auth_user';

const simulateLatency = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Authentication Service for TrackGPT Enterprise Platform
 * Supports both real REST API backend endpoints and isolated mock mode.
 */
export const authService = {
  /**
   * Sign In with email and password
   * @param {Object} credentials { email, password, rememberMe }
   * @returns {Promise<{ user: Object, token: string }>}
   */
  signIn: async ({ email, password, rememberMe = false }) => {
    if (USE_MOCK_DATA) {
      await simulateLatency();

      // Basic validation for mock authentication
      if (!email || !password) {
        throw { message: 'Please provide both email address and password', status: 400 };
      }

      // Check password minimum length in mock mode
      if (password.length < 6) {
        throw { message: 'Invalid password. Password must be at least 6 characters long.', status: 401 };
      }

      const mockUser = {
        id: 'usr_subash_001',
        fullName: email.includes('subash') ? 'Subash Kumar' : email.split('@')[0].replace('.', ' ').replace(/^./, (c) => c.toUpperCase()),
        email: email.toLowerCase(),
        companyName: 'Subash Enterprise Supply Chain Ltd.',
        role: 'Supply Chain Director',
        avatar: null,
      };

      const mockToken = `trackgpt_jwt_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Store in localStorage or sessionStorage based on rememberMe
      if (rememberMe) {
        localStorage.setItem(TOKEN_KEY, mockToken);
        localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      } else {
        sessionStorage.setItem(TOKEN_KEY, mockToken);
        sessionStorage.setItem(USER_KEY, JSON.stringify(mockUser));
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }

      return { user: mockUser, token: mockToken };
    }

    // Real API Call
    try {
      const response = await apiClient.post('/auth/signin', { email, password });
      const { user, token } = response.data;
      
      const storage = rememberMe ? localStorage : sessionStorage;
      if (token) storage.setItem(TOKEN_KEY, token);
      if (user) storage.setItem(USER_KEY, JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      throw {
        message: error.response?.data?.message || error.message || 'Authentication failed. Please verify your credentials.',
        status: error.response?.status || 500,
      };
    }
  },

  /**
   * Sign Up / Create new account
   * @param {Object} accountData { fullName, email, companyName, password }
   * @returns {Promise<{ user: Object, token: string }>}
   */
  signUp: async ({ fullName, email, companyName, password }) => {
    if (USE_MOCK_DATA) {
      await simulateLatency(500);

      if (!fullName || !email || !companyName || !password) {
        throw { message: 'All required registration fields must be completed', status: 400 };
      }

      const newUser = {
        id: `usr_${Date.now()}`,
        fullName,
        email: email.toLowerCase(),
        companyName,
        role: 'Supply Chain Manager',
        avatar: null,
      };

      const mockToken = `trackgpt_jwt_mock_${Date.now()}`;
      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));

      return { user: newUser, token: mockToken, message: 'Account registered successfully' };
    }

    try {
      const response = await apiClient.post('/auth/signup', {
        fullName,
        email,
        companyName,
        password,
      });
      const { user, token } = response.data;
      if (token) localStorage.setItem(TOKEN_KEY, token);
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      return response.data;
    } catch (error) {
      throw {
        message: error.response?.data?.message || error.message || 'Failed to create account. Please try again.',
        status: error.response?.status || 500,
      };
    }
  },

  /**
   * Request Password Reset link
   * @param {string} email
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  requestPasswordReset: async (email) => {
    if (USE_MOCK_DATA) {
      await simulateLatency(450);
      if (!email || !email.includes('@')) {
        throw { message: 'Please provide a valid registered email address', status: 400 };
      }
      return {
        success: true,
        message: 'If an account exists for this email address, password reset instructions will be sent to it.',
      };
    }

    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw {
        message: error.response?.data?.message || error.message || 'Unable to initiate password reset request.',
        status: error.response?.status || 500,
      };
    }
  },

  /**
   * Sign Out and purge stored tokens
   */
  signOut: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  /**
   * Retrieve active authenticated user if stored
   * @returns {Object|null}
   */
  getCurrentUser: () => {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * Check if token exists in session
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return Boolean(localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY));
  },
};

