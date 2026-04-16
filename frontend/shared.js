window.API = {
  base: 'http://localhost:3000',
  async request(path, options = {}) {
    const response = await fetch(this.base + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })

    const text = await response.text()
    let data = null

    try {
      data = text ? JSON.parse(text) : null
    } catch (error) {
      throw new Error('Invalid JSON response from server')
    }

    if (!response.ok) {
      const message = data?.error || data?.message || response.statusText
      throw new Error(message)
    }

    return data
  },
  list(entity) {
    return this.request(`/${entity}`)
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

window.entityManager = function (entity, initialForm, columns, options = {}) {
  return {
    entity,
    items: [],
    selected: null,
    form: JSON.parse(JSON.stringify(initialForm)),
    stats: null,
    history: null,
    message: '',
    error: '',
    columns,
    async loadList() {
      try {
        this.items = await API.list(entity)
        this.error = ''
      } catch (err) {
        this.error = err.message
      }
    },
    selectItem(item) {
      this.selected = item
      this.form = JSON.parse(JSON.stringify({ ...initialForm, ...item }))
      this.stats = null
      this.history = null
      this.message = ''
      this.error = ''
      if (options.stats) {
        this.loadStats(item.id)
      }
      if (options.history) {
        this.loadHistory(item.id)
      }
    },
    async createItem() {
      try {
        await API.create(entity, this.form)
        this.message = 'Créé avec succès.'
        this.error = ''
        this.form = JSON.parse(JSON.stringify(initialForm))
        this.loadList()
      } catch (err) {
        this.error = err.message
      }
    },
    async updateItem() {
      if (!this.selected) {
        this.error = 'Sélectionner un élément pour mettre à jour.'
        return
      }
      try {
        await API.update(entity, this.selected.id, this.form)
        this.message = 'Mis à jour avec succès.'
        this.error = ''
        this.loadList()
      } catch (err) {
        this.error = err.message
      }
    },
    async deleteItem(id) {
      if (!confirm('Supprimer cet élément ?')) return
      try {
        await API.delete(entity, id)
        this.message = 'Supprimé avec succès.'
        this.error = ''
        if (this.selected?.id === id) {
          this.clearSelection()
        }
        this.loadList()
      } catch (err) {
        this.error = err.message
      }
    },
    async loadStats(id) {
      if (!options.stats) return
      try {
        this.stats = await API.stats(entity, id)
        this.error = ''
      } catch (err) {
        this.error = err.message
      }
    },
    async loadHistory(id) {
      if (!options.history) return
      try {
        this.history = await API.history(entity, id)
        this.error = ''
      } catch (err) {
        this.error = err.message
      }
    },
    clearSelection() {
      this.selected = null
      this.form = JSON.parse(JSON.stringify(initialForm))
      this.stats = null
      this.history = null
      this.message = ''
      this.error = ''
    },
  }
}
