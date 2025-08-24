// contexts/AuthContext.js
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Make sure to define your base_url
const base_url = 'http://192.168.1.23:9000/api'; // Use your actual IP

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);



    useEffect(() => {
        checkAuthState();
    }, []);

    const checkAuthState = async () => {
        try {
            const token = await SecureStore.getItemAsync('authToken');
            const userData = await SecureStore.getItemAsync('userData');

            if (token) {
                setIsAuthenticated(true);
                if (userData) {
                    setUser(JSON.parse(userData));
                }
            }
        } catch (error) {
            console.error('Auth check error:', error);
        } finally {
            setLoading(false);
        }
    };


    const login = async (token, userData) => {
        try {
            await SecureStore.setItemAsync('authToken', token);
            await SecureStore.setItemAsync('userData', JSON.stringify(userData));
            setUser(userData);
            setToken(token)
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Failed to save login data' };
        }
    };

    const signup = async (userData, token) => {
        try {
            await SecureStore.setItemAsync('authToken', token);
            await SecureStore.setItemAsync('userData', JSON.stringify(userData));
            setUser(userData);
            setToken(token)
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: 'Failed to save signup data' };
        }
    };

    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync('authToken');
            await SecureStore.deleteItemAsync('userData');
            setUser(null);
            setIsAuthenticated(false);
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: 'Failed to logout' };
        }
    };


    const value = {
        isAuthenticated,
        loading,
        user,
        login,
        signup,
        logout,
        token
        // Add this to manually refresh user data
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};