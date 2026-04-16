/**
 * Frontend Validation Schemas
 * Simple validation before API calls
 */

window.ValidationSchemas = {
  societe: {
    nom: { required: true, minLength: 2, label: 'Nom' },
    raisonSociale: { required: true, minLength: 2, label: 'Raison Sociale' },
    email: { required: false, format: 'email', label: 'Email' },
    telephone: { required: false, label: 'Téléphone' },
    adresse: { required: false, label: 'Adresse' },
  },
  agence: {
    code: { required: true, minLength: 1, label: 'Code' },
    nom: { required: true, minLength: 2, label: 'Nom' },
    adresse: { required: false, label: 'Adresse' },
    telephone: { required: false, label: 'Téléphone' },
    societeId: { required: true, label: 'Société' },
  },
  utilisateur: {
    nom: { required: true, minLength: 2, label: 'Nom' },
    email: { required: true, format: 'email', label: 'Email' },
    telephone: { required: false, label: 'Téléphone' },
    role: { required: true, label: 'Rôle' },
    societeId: { required: true, label: 'Société' },
  },
  client: {
    numeroClient: { required: true, minLength: 1, label: 'Numéro Client' },
    nom: { required: true, minLength: 2, label: 'Nom' },
    telephone: { required: false, label: 'Téléphone' },
    email: { required: false, format: 'email', label: 'Email' },
    agenceId: { required: true, label: 'Agence' },
  },
  carnet: {
    numeroCarnet: { required: true, minLength: 1, label: 'Numéro' },
    clientId: { required: true, label: 'Client' },
  },
  cotisation: {
    mois: { required: true, label: 'Mois' },
    annee: { required: true, label: 'Année' },
    mise: { required: true, min: 0, label: 'Mise' },
    clientId: { required: true, label: 'Client' },
  },
  compte: {
    numeroCompte: { required: true, minLength: 1, label: 'Numéro Compte' },
    typeCompte: { required: true, label: 'Type' },
    solde: { required: true, min: 0, label: 'Solde' },
  },
}

/**
 * Validate a single field
 */
window.validateField = (value, rules) => {
  if (!rules) return null

  // Check required
  if (rules.required && (!value || value === '')) {
    return `${rules.label || 'Field'} est requis`
  }

  if (!value || value === '') {
    return null // Optional field with no value
  }

  // Check minLength
  if (rules.minLength && value.toString().length < rules.minLength) {
    return `${rules.label} doit être au moins ${rules.minLength} caractères`
  }

  // Check format (email)
  if (rules.format === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return `${rules.label} doit être un email valide`
    }
  }

  // Check min
  if (rules.min !== undefined && parseFloat(value) < rules.min) {
    return `${rules.label} doit être >= ${rules.min}`
  }

  // Check max
  if (rules.max !== undefined && parseFloat(value) > rules.max) {
    return `${rules.label} doit être <= ${rules.max}`
  }

  return null
}

/**
 * Validate entire object
 */
window.validateObject = (obj, schema) => {
  const errors = {}

  Object.entries(schema).forEach(([key, rules]) => {
    const error = validateField(obj[key], rules)
    if (error) {
      errors[key] = error
    }
  })

  return Object.keys(errors).length > 0 ? errors : null
}

/**
 * Format form data for API
 */
window.formatFormData = (formData, schema, parseFunctions = {}) => {
  const formatted = { ...formData }

  Object.entries(formatted).forEach(([key, value]) => {
    // Parse numbers for numeric fields
    if (
      key.includes('Id') ||
      key === 'solde' ||
      key === 'soldeDisponible' ||
      key === 'mise' ||
      key === 'mois' ||
      key === 'annee'
    ) {
      const num = parseFloat(value)
      formatted[key] = isNaN(num) ? value : num
    }

    // Apply custom parsers if provided
    if (parseFunctions[key]) {
      formatted[key] = parseFunctions[key](value)
    }

    // Remove empty strings, keep null for null fields
    if (value === '') {
      delete formatted[key]
    }
  })

  return formatted
}
