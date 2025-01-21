// /public/assets/js/core/api.js

/**
 * API Handler for Color Me Silly Portal
 */

class Api {
    constructor() {
        this.baseUrl = '/api/v1';
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    /**
     * Set authorization token
     * @param {string} token - JWT token
     */
    setToken(token) {
        if (token) {
            this.headers['Authorization'] = `Bearer ${token}`;
        } else {
            delete this.headers['Authorization'];
        }
    }

    /**
     * Handle API response
     * @param {Response} response - Fetch response
     * @returns {Promise} Parsed response
     */
    async handleResponse(response) {
        const data = await response.json();

        if (!response.ok) {
            throw {
                status: response.status,
                message: data.message || 'An error occurred',
                errors: data.errors
            };
        }

        return data;
    }

    /**
     * Make API request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise} API response
     */
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.headers,
                    ...options.headers
                }
            });
            return await this.handleResponse(response);
        } catch (error) {
            if (error.status === 401) {
                // Handle unauthorized access
                window.dispatchEvent(new CustomEvent('unauthorized'));
            }
            throw error;
        }
    }

    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @returns {Promise} API response
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request data
     * @returns {Promise} API response
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request data
     * @returns {Promise} API response
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @returns {Promise} API response
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    /**
     * Upload file
     * @param {string} endpoint - API endpoint
     * @param {FormData} formData - Form data with file
     * @param {Function} onProgress - Progress callback
     * @returns {Promise} API response
     */
    async uploadFile(endpoint, formData, onProgress = null) {
        const xhr = new XMLHttpRequest();
        
        return new Promise((resolve, reject) => {
            xhr.upload.addEventListener('progress', (event) => {
                if (onProgress && event.lengthComputable) {
                    const progress = (event.loaded / event.total) * 100;
                    onProgress(progress);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.response));
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Upload failed'));
            });

            xhr.open('POST', `${this.baseUrl}${endpoint}`);
            
            // Add authorization header if it exists
            if (this.headers['Authorization']) {
                xhr.setRequestHeader('Authorization', this.headers['Authorization']);
            }

            xhr.send(formData);
        });
    }
}

// Create and export singleton instance
const api = new Api();
export default api;