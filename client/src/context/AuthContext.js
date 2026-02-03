import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'USER_LOADED':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null,
      };
    case 'AUTH_ERROR':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.type === 'AUTH_ERROR' ? action.payload : null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    if (state.token) {
      loadUser();
    } else {
      dispatch({ type: 'AUTH_ERROR' });
    }
    // eslint-disable-next-line
  }, []);

  async function loadUser() {
    try {
      const res = await api.get('/auth/me');
      dispatch({ type: 'USER_LOADED', payload: res.data.data.user });
    } catch {
      dispatch({ type: 'AUTH_ERROR' });
    }
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data.data;
    localStorage.setItem('token', token);
    dispatch({ type: 'AUTH_SUCCESS', payload: { token, user } });
    return res.data;
  }

  async function register(username, email, password) {
    const res = await api.post('/auth/register', { username, email, password });
    const { token, user } = res.data.data;
    localStorage.setItem('token', token);
    dispatch({ type: 'AUTH_SUCCESS', payload: { token, user } });
    return res.data;
  }

  function logout() {
    api.post('/auth/logout').catch(() => {});
    dispatch({ type: 'LOGOUT' });
  }

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        loading: state.loading,
        error: state.error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
