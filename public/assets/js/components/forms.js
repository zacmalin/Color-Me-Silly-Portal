// /public/assets/js/components/forms.js

import utils from '../core/utils.js';

class FormHandler {
    constructor(formElement, options = {}) {
        this.form = formElement;
        this.options = {
            validateOnChange: true,
            validateOnBlur: true,
            autoComplete: 'off',
            ...options
        };

        this.validators = new Map();
        this.errors = new Map();
        this.init();
    }

    /**
     * Initialize form handler
     */
    init() {
        this.form.setAttribute('novalidate', true);
        this.form.setAttribute('autocomplete', this.options.autoComplete);

        // Bind event listeners
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        if (this.options.validateOnChange) {
            this.form.addEventListener('change', (e) => this.handleChange(e));
        }
        if (this.options.validateOnBlur) {
            this.form.addEventListener('blur', (e) => this.handleBlur(e), true);
        }
    }

    /**
     * Add field validator
     * @param {string} fieldName - Field name
     * @param {Function} validatorFn - Validator function
     * @param {string} errorMessage - Error message
     */
    addValidator(fieldName, validatorFn, errorMessage) {
        if (!this.validators.has(fieldName)) {
            this.validators.set(fieldName, []);
        }
        this.validators.get(fieldName).push({ fn: validatorFn, message: errorMessage });
    }

    /**
     * Handle form submission
     * @param {Event} event - Submit event
     */
    async handleSubmit(event) {
        event.preventDefault();
        if (await this.validateForm()) {
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());
            
            try {
                if (this.options.onSubmit) {
                    await this.options.onSubmit(data);
                }
                if (this.options.resetOnSubmit) {
                    this.form.reset();
                }
            } catch (error) {
                console.error('Form submission error:', error);
                this.showError('form', error.message || 'An error occurred');
            }
        }
    }

    /**
     * Handle field change
     * @param {Event} event - Change event
     */
    handleChange(event) {
        const field = event.target;
        if (field.name) {
            this.validateField(field);
        }
    }

    /**
     * Handle field blur
     * @param {Event} event - Blur event
     */
    handleBlur(event) {
        const field = event.target;
        if (field.name) {
            this.validateField(field);
        }
    }

    /**
     * Validate entire form
     * @returns {boolean} Form validity
     */
    async validateForm() {
        let isValid = true;
        this.clearErrors();

        for (const field of this.form.elements) {
            if (field.name && !await this.validateField(field)) {
                isValid = false;
            }
        }

        return isValid;
    }

    /**
     * Validate single field
     * @param {HTMLElement} field - Field to validate
     * @returns {boolean} Field validity
     */
    async validateField(field) {
        const validators = this.validators.get(field.name);
        if (!validators) return true;

        for (const { fn, message } of validators) {
            try {
                const isValid = await fn(field.value, field);
                if (!isValid) {
                    this.showError(field.name, message);
                    return false;
                }
            } catch (error) {
                this.showError(field.name, error.message);
                return false;
            }
        }

        this.clearError(field.name);
        return true;
    }

    /**
     * Show error message
     * @param {string} fieldName - Field name
     * @param {string} message - Error message
     */
    showError(fieldName, message) {
        this.errors.set(fieldName, message);
        const errorElement = this.form.querySelector(`[data-error="${fieldName}"]`);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        const field = this.form.elements[fieldName];
        if (field) {
            field.classList.add('is-invalid');
        }
    }

    /**
     * Clear error message
     * @param {string} fieldName - Field name
     */
    clearError(fieldName) {
        this.errors.delete(fieldName);
        const errorElement = this.form.querySelector(`[data-error="${fieldName}"]`);
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }

        const field = this.form.elements[fieldName];
        if (field) {
            field.classList.remove('is-invalid');
        }
    }

    /**
     * Clear all error messages
     */
    clearErrors() {
        this.errors.clear();
        this.form.querySelectorAll('[data-error]').forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
        this.form.querySelectorAll('.is-invalid').forEach(field => {
            field.classList.remove('is-invalid');
        });
    }

    /**
     * Set form values
     * @param {Object} values - Form values
     */
    setValues(values) {
        Object.entries(values).forEach(([name, value]) => {
            const field = this.form.elements[name];
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = Boolean(value);
                } else if (field.type === 'radio') {
                    const radio = this.form.querySelector(`input[name="${name}"][value="${value}"]`);
                    if (radio) radio.checked = true;
                } else {
                    field.value = value;
                }
            }
        });
    }

    /**
     * Get form values
     * @returns {Object} Form values
     */
    getValues() {
        const formData = new FormData(this.form);
        return Object.fromEntries(formData.entries());
    }

    /**
     * Reset form
     */
    reset() {
        this.form.reset();
        this.clearErrors();
    }
}

export default FormHandler;