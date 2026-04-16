/**
 * Enhanced API Client with better error handling and retry logic
 */
window.API = {
  base: '',
  maxRetries: 3,
  retryDelay: 1000, // milliseconds
  debug: false, // Set to true for console logging

  /**
   * Log API calls (debug mode)
   */
  log(...args) {
    if (this.debug) {
      console.log('[API]', ...args)
    }
  },

  /**
   * Sleep for ms milliseconds (for retry backoff)
   */
  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  },

  /**
   * Core request method with retry logic
   */
  async request(path, options = {}, retryCount = 0) {
    const method = options.method || 'GET'
    this.log(`${method} ${this.base}${path}`)

    try {
      const response = await fetch(this.base + path, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      })

      const text = await response.text()
      let data = null

      try {
        data = text ? JSON.parse(text) : null
      } catch (error) {
        throw {
          type: 'PARSE_ERROR',
          message: 'Réponse invalide du serveur',
          statusCode: response.status,
        }
      }

      // Handle non-2xx responses
      if (!response.ok) {
        const errorType = this.classifyError(response.status, data)
        throw {
          type: errorType,
          message: data?.error || data?.message || response.statusText,
          statusCode: response.status,
          details: data?.details,
        }
      }

      this.log(`✓ ${method} ${path}`, data)
      return data?.data !== undefined ? data.data : data
    } catch (err) {
      // Network errors or fetch failures - retry if applicable
      if (
        (err.type === 'NETWORK_ERROR' ||
          err.message === 'Failed to fetch' ||
          !err.type) &&
        retryCount < this.maxRetries
      ) {
        const delay = this.retryDelay * Math.pow(2, retryCount)
        this.log(`Retrying... (${retryCount + 1}/${this.maxRetries}) after ${delay}ms`)
        await this.sleep(delay)
        return this.request(path, options, retryCount + 1)
      }

      // Throw enhanced error
      throw {
        type: err.type || 'UNKNOWN_ERROR',
        message: err.message || 'Une erreur inconnue s\'est produite',
        statusCode: err.statusCode || 500,
        details: err.details,
        userMessage: this.getUserFriendlyMessage(err),
      }
    }
  },

  /**
   * Classify error by status code
   */
  classifyError(statusCode, data) {
    if (statusCode === 400) return 'VALIDATION_ERROR'
    if (statusCode === 401) return 'AUTH_ERROR'
    if (statusCode === 403) return 'PERMISSION_ERROR'
    if (statusCode === 404) return 'NOT_FOUND_ERROR'
    if (statusCode >= 500) return 'SERVER_ERROR'
    return 'API_ERROR'
  },

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(err) {
    switch (err.type) {
      case 'VALIDATION_ERROR':
        return 'Veuillez vérifier vos données'
      case 'NETWORK_ERROR':
        return 'Problème de connexion - vérifiez internet'
      case 'AUTH_ERROR':
        return 'Authentification requise'
      case 'PERMISSION_ERROR':
        return 'Vous n\'avez pas la permission'
      case 'NOT_FOUND_ERROR':
        return 'Ressource inexistante'
      case 'SERVER_ERROR':
        return 'Erreur serveur - réessayez plus tard'
      case 'PARSE_ERROR':
        return 'Erreur dans la réponse serveur'
      default:
        return err.message || 'Une erreur s\'est produite'
    }
  },

  // CRUD methods
  list(entity, params = {}) {
    const query = new URLSearchParams(params).toString()
    const path = query ? `/${entity}?${query}` : `/${entity}`
    return this.request(path)
  },
  get(entity, id) {
    return this.request(`/${entity}/${id}`)
  },
  create(entity, data) {
    return this.request(`/${entity}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  update(entity, id, data) {
    return this.request(`/${entity}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
  delete(entity, id) {
    return this.request(`/${entity}/${id}`, {
      method: 'DELETE',
    })
  },
  stats(entity, id) {
    return this.request(`/${entity}/${id}/stats`)
  },
  history(entity, id) {
    return this.request(`/${entity}/${id}/history`)
  },
}

/**
 * Enhanced Entity Manager with validation and better error handling
 */
window.entityManager = function (entity, initialForm, columns, options = {}) {
  const schemaKey = entity.replace('-', '')
  const schema = window.ValidationSchemas?.[schemaKey] || {}

  return {
    entity,
    items: [],
    selected: null,
    form: JSON.parse(JSON.stringify(initialForm)),
    stats: null,
    history: null,
    message: '',
    messageType: '', // 'success' or 'error'
    error: '',
    errors: {}, // Field-level errors
    columns,
    loading: false,
    formValidating: false,

    /**
     * Load all items
     */
    async loadList() {
      this.loading = true
      this.error = ''
      try {
        this.items = await API.list(entity)
        this.message = ''
      } catch (err) {
        this.error = err.userMessage || err.message
        this.messageType = 'error'
      } finally {
        this.loading = false
      }
    },

    /**
     * Select item for editing
     */
    selectItem(item) {
      this.selected = item
      this.form = JSON.parse(JSON.stringify({ ...initialForm, ...item }))
      this.stats = null
      this.history = null
      this.message = ''
      this.error = ''
      this.errors = {}
      this.messageType = ''

      if (options.stats) {
        this.loadStats(item.id)
      }
      if (options.history) {
        this.loadHistory(item.id)
      }
    },

    /**
     * Validate form
     */
    validateForm() {
      this.formValidating = true
      const errors = window.validateObject(this.form, schema)
      this.errors = errors || {}
      this.formValidating = false
      return !errors
    },

    /**
     * Create new item
     */
    async createItem() {
      if (!this.validateForm()) {
        this.error = 'Veuillez corriger les erreurs du formulaire'
        this.messageType = 'error'
        return
      }

      this.loading = true
      this.error = ''
      this.message = ''

      try {
        const formattedData = window.formatFormData(
          this.form,
          schema,
          options.parseFunctions
        )
        await API.create(entity, formattedData)
        this.message = '✓ Créé avec succès'
        this.messageType = 'success'
        this.errors = {}
        this.form = JSON.parse(JSON.stringify(initialForm))
        this.selected = null
        await this.loadList()
      } catch (err) {
        this.error = err.userMessage || err.message
        this.messageType = 'error'
        // If validation error with details, populate field errors
        if (err.type === 'VALIDATION_ERROR' && err.details) {
          this.errors = {}
          err.details.forEach((detail) => {
            if (detail.field) {
              this.errors[detail.field] = detail.message
            }
          })
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * Update existing item
     */
    async updateItem() {
      if (!this.selected) {
        this.error = 'Sélectionner un élément pour mettre à jour'
        this.messageType = 'error'
        return
      }

      if (!this.validateForm()) {
        this.error = 'Veuillez corriger les erreurs du formulaire'
        this.messageType = 'error'
        return
      }

      this.loading = true
      this.error = ''
      this.message = ''

      try {
        const formattedData = window.formatFormData(
          this.form,
          schema,
          options.parseFunctions
        )
        await API.update(entity, this.selected.id, formattedData)
        this.message = '✓ Mis à jour avec succès'
        this.messageType = 'success'
        this.errors = {}
        await this.loadList()
        this.clearSelection()
      } catch (err) {
        this.error = err.userMessage || err.message
        this.messageType = 'error'
        if (err.type === 'VALIDATION_ERROR' && err.details) {
          this.errors = {}
          err.details.forEach((detail) => {
            if (detail.field) {
              this.errors[detail.field] = detail.message
            }
          })
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete item
     */
    async deleteItem(id) {
      if (!confirm('Êtes-vous certain ? Cette action ne peut pas être annulée.')) {
        return
      }

      this.loading = true
      this.error = ''
      this.message = ''

      try {
        await API.delete(entity, id)
        this.message = '✓ Supprimé avec succès'
        this.messageType = 'success'
        if (this.selected?.id === id) {
          this.clearSelection()
        }
        await this.loadList()
      } catch (err) {
        this.error = err.userMessage || err.message
        this.messageType = 'error'
      } finally {
        this.loading = false
      }
    },

    /**
     * Load stats for item
     */
    async loadStats(id) {
      if (!options.stats) return
      try {
        this.stats = await API.stats(entity, id)
      } catch (err) {
        this.error = `Stats: ${err.userMessage || err.message}`
      }
    },

    /**
     * Load history for item
     */
    async loadHistory(id) {
      if (!options.history) return
      try {
        this.history = await API.history(entity, id)
      } catch (err) {
        this.error = `History: ${err.userMessage || err.message}`
      }
    },

    /**
     * Clear selection
     */
    clearSelection() {
      this.selected = null
      this.form = JSON.parse(JSON.stringify(initialForm))
      this.stats = null
      this.history = null
      this.message = ''
      this.error = ''
      this.errors = {}
      this.messageType = ''
    },

    /**
     * Check if field has error
     */
    hasError(field) {
      return !!this.errors[field]
    },

    /**
     * Get error for field
     */
    getError(field) {
      return this.errors[field] || ''
    },
  }
}
