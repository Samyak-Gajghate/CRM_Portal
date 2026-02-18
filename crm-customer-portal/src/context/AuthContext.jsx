import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    console.log('AuthProvider rendering');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('AuthProvider useEffect running');
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        console.log('Setting loading false');
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });
            const { token, role, username: responseUsername } = response.data;

            localStorage.setItem('token', token);
            const userData = { username: responseUsername, role };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return true;
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            await api.post('/auth/register', { ...userData, role: 'CUSTOMER' });
            return true;
        } catch (error) {
            console.error('Registration failed', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
