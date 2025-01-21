// /public/assets/js/core/state.js

class State {
    constructor() {
        this.state = {};
        this.listeners = new Map();
    }

    /**
     * Initialize state with default values
     * @param {Object} initialState - Initial state values
     */
    init(initialState = {}) {
        this.state = {
            theme: localStorage.getItem('theme') || 'light',
            notifications: [],
            sidebarOpen: true,
            loading: false,
            errors: {},
            ...initialState
        };
    }

    /**
     * Get current state
     * @param {string} key - Optional key to get specific state value
     * @returns {any} State value
     */
    get(key) {
        if (key) {
            return this.state[key];
        }
        return this.state;
    }

    /**
     * Set state value
     * @param {string|Object} keyOrObject - Key or object with values to set
     * @param {any} value - Value to set if key is string
     */
    set(keyOrObject, value) {
        if (typeof keyOrObject === 'object') {
            Object.entries(keyOrObject).forEach(([key, val]) => {
                this.setState(key, val);
            });
        } else {
            this.setState(keyOrObject, value);
        }
    }

    /**
     * Internal setState helper
     * @private
     * @param {string} key - State key
     * @param {any} value - New value
     */
    setState(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;

        // Notify listeners if value changed
        if (oldValue !== value) {
            this.notifyListeners(key, value, oldValue);
        }
    }

    /**
     * Subscribe to state changes
     * @param {string} key - State key to watch
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        
        const listeners = this.listeners.get(key);
        listeners.add(callback);

        // Return unsubscribe function
        return () => listeners.delete(callback);
    }

    /**
     * Notify listeners of state change
     * @private
     * @param {string} key - State key that changed
     * @param {any} newValue - New state value
     * @param {any} oldValue - Previous state value
     */
    notifyListeners(key, newValue, oldValue) {
        const listeners = this.listeners.get(key);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(newValue, oldValue);
                } catch (error) {
                    console.error('Error in state listener:', error);
                }
            });
        }
    }

    /**
     * Reset state to initial values
     * @param {Object} initialState - Optional new initial state
     */
    reset(initialState = {}) {
        this.init(initialState);
    }

    /**
     * Toggle boolean state value
     * @param {string} key - State key to toggle
     */
    toggle(key) {
        if (typeof this.state[key] === 'boolean') {
            this.set(key, !this.state[key]);
        }
    }

    /**
     * Add item to array state
     * @param {string} key - Array state key
     * @param {any} item - Item to add
     */
    addItem(key, item) {
        if (Array.isArray(this.state[key])) {
            this.set(key, [...this.state[key], item]);
        }
    }

    /**
     * Remove item from array state
     * @param {string} key - Array state key
     * @param {Function} predicate - Function to identify item to remove
     */
    removeItem(key, predicate) {
        if (Array.isArray(this.state[key])) {
            this.set(key, this.state[key].filter(item => !predicate(item)));
        }
    }

    /**
     * Update item in array state
     * @param {string} key - Array state key
     * @param {Function} predicate - Function to identify item to update
     * @param {Object} updates - Updates to apply to item
     */
    updateItem(key, predicate, updates) {
        if (Array.isArray(this.state[key])) {
            this.set(key, this.state[key].map(item => 
                predicate(item) ? { ...item, ...updates } : item
            ));
        }
    }

    /**
     * Persist state to localStorage
     * @param {string} key - State key to persist
     */
    persist(key) {
        try {
            localStorage.setItem(key, JSON.stringify(this.state[key]));
        } catch (error) {
            console.error('Error persisting state:', error);
        }
    }

    /**
     * Load persisted state from localStorage
     * @param {string} key - State key to load
     * @returns {any} Loaded state value
     */
    loadPersisted(key) {
        try {
            const value = localStorage.getItem(key);
            if (value) {
                const parsed = JSON.parse(value);
                this.set(key, parsed);
                return parsed;
            }
        } catch (error) {
            console.error('Error loading persisted state:', error);
        }
        return null;
    }
}

// Create and export singleton instance
const state = new State();
state.init();
export default state;