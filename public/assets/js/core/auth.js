// /public/assets/js/core/auth.js

import api from './api.js';

class Auth {
    constructor() {
        this.tokenKey = 'cms_auth_token';
        this.userKey = 'cms_user';
        this.token = localStorage.getItem(this.tokenKey);
        this.user = JSON.parse(localStorage.getItem(this.userKey));
        
        // Set token in API if exists
        if (this.token) {
            api.setToken(this.token);
        }
    }

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} Login response
     */
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password });
            this.setSession(response.token, response.user);
            return response;
        } catch (error) {
            this.clearSession();
            throw error;
        }
    }

    /**
     * Register new user
     * @param {Object} userData - User registration data
     * @returns {Promise} Registration response
     */
    async register(userData) {
        const response = await api.post('/auth/register', userData);
        this.setSession(response.token, response.user);
        return response;
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearSession();
            window.location.href = '/login';
        }
    }

    /**
     * Set authentication session
     * @param {string} token - JWT token
     * @param {Object} user - User data
     */
    setSession(token, user) {
        this.token = token;
        this.user = user;
        
        // Store in localStorage
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));
        
        // Set token in API
        api.setToken(token);
    }

    /**
     * Clear authentication session
     */
    clearSession() {
        this.token = null;
        this.user = null;
        
        // Remove from localStorage
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        
        // Clear token from API
        api.setToken(null);
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        return !!this.token;
    }

    /**
     * Get current user
     * @returns {Object|null} User data
     */
    getUser() {
        return this.user;
    }

    /**
     * Check if user has specific role
     * @param {string} role - Role to check
     * @returns {boolean} Whether user has role
     */
    hasRole(role) {
        return this.user?.roles?.includes(role) || false;
    }

    /**
     * Check if user has specific permission
     * @param {string} permission - Permission to check
     * @returns {boolean} Whether user has permission
     */
    hasPermission(permission) {
        return this.user?.permissions?.includes(permission) || false;
    }

    /**
     * Refresh authentication token
     * @returns {Promise} Refresh response
     */
    async refreshToken() {
        try {
            const response = await api.post('/auth/refresh');
            this.setSession(response.token, response.user);
            return response;
        } catch (error) {
            this.clearSession();
            throw error;
        }
    }

    /**
     * Update user profile
     * @param {Object} userData - Updated user data
     * @returns {Promise} Update response
     */
    async updateProfile(userData) {
        const response = await api.put('/auth/profile', userData);
        this.setSession(this.token, response.user);
        return response;
    }

    /**
     * Change user password
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise} Password change response
     */
    async changePassword(currentPassword, newPassword) {
        return await api.post('/auth/password', {
            current_password: currentPassword,
            new_password: newPassword
        });
    }

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise} Password reset request response
     */
    async requestPasswordReset(email) {
        return await api.post('/auth/password/reset', { email });
    }

    /**
     * Reset password with token
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     * @returns {Promise} Password reset response
     */
    async resetPassword(token, newPassword) {
        return await api.post('/auth/password/reset/confirm', {
            token,
            password: newPassword
        });
    }

    /**
     * Initialize auth event listeners
     */
    initEventListeners() {
        // Listen for unauthorized events
        window.addEventListener('unauthorized', () => {
            this.clearSession();
            window.location.href = '/login';
        });

        // Check token expiration periodically
        setInterval(() => {
            if (this.token) {
                // Add your token expiration check logic here
                // For example, check if token is about to expire and refresh it
            }
        }, 60000); // Check every minute
    }
}

// Create and export singleton instance
const auth = new Auth();
auth.initEventListeners();
export default auth;