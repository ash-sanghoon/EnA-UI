import React, { createContext, useContext, useReducer } from 'react';
import { endpoints } from '../utils/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false
      };
    case ActionTypes.LOGOUT:
      return {
        ...initialState
      };
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (credentials) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      const response = await endpoints.auth.login(credentials);
      localStorage.setItem('token', response.token);
      dispatch({ type: ActionTypes.SET_USER, payload: response.user });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
    }
  };

  const logout = async () => {
    try {
      await endpoints.auth.logout();
      localStorage.removeItem('token');
      dispatch({ type: ActionTypes.LOGOUT });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};