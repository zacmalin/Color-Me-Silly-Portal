// /public/assets/js/components/modals.js

class Modal {
    constructor(options = {}) {
        this.options = {
            closeOnEscape: true,
            closeOnOverlayClick: true,
            onOpen: null,
            onClose: null,
            size: 'md',
            ...options
        };

        this.isOpen = false;
        this.modal = null;
        this.overlay = null;
        this.closeButton = null;
        this.content = null;
        this.previousActiveElement = null;

        this.handleEscapeKey = this.handleEscapeKey.bind(this);
        this.handleOverlayClick = this.handleOverlayClick.bind(this);
    }

    /**
     * Create modal elements
     * @param {string|HTMLElement} content - Modal content
     */
    createModal(content) {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        
        // Create modal container
        this.modal = document.createElement('div');
        this.modal.className = `modal modal-${this.options.size}`;
        
        // Create close button if needed
        if (this.options.showClose !== false) {
            this.closeButton = document.createElement('button');
            this.closeButton.className = 'modal-close';
            this.closeButton.innerHTML = '×';
            this.closeButton.addEventListener('click', () => this.close());
            this.modal.appendChild(this.closeButton);
        }

        // Add content
        this.content = document.createElement('div');
        this.content.className = 'modal-content';
        if (typeof content === 'string') {
            this.content.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this.content.appendChild(content);
        }
        
        this.modal.appendChild(this.content);
        this.overlay.appendChild(this.modal);
    }

    /**
     * Open modal
     * @param {string|HTMLElement} content - Modal content
     */
    open(content) {
        if (this.isOpen) return;

        this.createModal(content);
        document.body.appendChild(this.overlay);
        
        // Store the currently focused element
        this.previousActiveElement = document.activeElement;

        // Add event listeners
        if (this.options.closeOnEscape) {
            document.addEventListener('keydown', this.handleEscapeKey);
        }
        if (this.options.closeOnOverlayClick) {
            this.overlay.addEventListener('click', this.handleOverlayClick);
        }

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Animation timing
        requestAnimationFrame(() => {
            this.overlay.classList.add('active');
            this.modal.classList.add('modal-enter');
        });

        // Focus handling
        this.trapFocus();
        this.isOpen = true;

        // Callback
        if (typeof this.options.onOpen === 'function') {
            this.options.onOpen();
        }
    }

    /**
     * Close modal
     */
    close() {
        if (!this.isOpen) return;

        // Animation
        this.modal.classList.remove('modal-enter');
        this.modal.classList.add('modal-leave');
        this.overlay.classList.remove('active');

        // Remove after animation
        const cleanup = () => {
            document.body.removeChild(this.overlay);
            document.body.style.overflow = '';
            
            // Remove event listeners
            if (this.options.closeOnEscape) {
                document.removeEventListener('keydown', this.handleEscapeKey);
            }
            if (this.options.closeOnOverlayClick) {
                this.overlay.removeEventListener('click', this.handleOverlayClick);
            }

            // Restore focus
            if (this.previousActiveElement) {
                this.previousActiveElement.focus();
            }

            this.isOpen = false;

            // Callback
            if (typeof this.options.onClose === 'function') {
                this.options.onClose();
            }
        };

        this.modal.addEventListener('animationend', cleanup, { once: true });
    }

    /**
     * Update modal content
     * @param {string|HTMLElement} content - New content
     */
    update(content) {
        if (!this.isOpen) return;

        if (typeof content === 'string') {
            this.content.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this.content.innerHTML = '';
            this.content.appendChild(content);
        }
    }

    /**
     * Handle escape key press
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleEscapeKey(event) {
        if (event.key === 'Escape') {
            this.close();
        }
    }

    /**
     * Handle overlay click
     * @param {MouseEvent} event - Mouse event
     */
    handleOverlayClick(event) {
        if (event.target === this.overlay) {
            this.close();
        }
    }

    /**
     * Trap focus within modal
     */
    trapFocus() {
        const focusableElements = this.modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        firstFocusable.focus();

        this.modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        });
    }

    /**
     * Create confirmation modal
     * @param {string} message - Confirmation message
     * @param {Object} options - Modal options
     * @returns {Promise} Resolves with boolean
     */
    static confirm(message, options = {}) {
        return new Promise((resolve) => {
            const content = document.createElement('div');
            content.className = 'modal-confirm';
            
            const messageEl = document.createElement('p');
            messageEl.textContent = message;
            content.appendChild(messageEl);
            
            const actions = document.createElement('div');
            actions.className = 'modal-actions';
            
            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'btn btn-primary';
            confirmBtn.textContent = options.confirmText || 'Confirm';
            
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn btn-secondary';
            cancelBtn.textContent = options.cancelText || 'Cancel';
            
            actions.appendChild(cancelBtn);
            actions.appendChild(confirmBtn);
            content.appendChild(actions);

            const modal = new Modal({
                ...options,
                onClose: () => resolve(false)
            });

            confirmBtn.addEventListener('click', () => {
                modal.close();
                resolve(true);
            });

            cancelBtn.addEventListener('click', () => {
                modal.close();
                resolve(false);
            });

            modal.open(content);
        });
    }
}

export default Modal;