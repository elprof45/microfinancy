export type ValidationRule = {
  required?: boolean
  minLength?: number
  min?: number
  max?: number
  format?: 'email' | 'date'
  label?: string
}

export type ValidationSchema = Record<string, ValidationRule>

export const validationSchemas: Record<string, ValidationSchema> = {
  societes: {
    nom: { required: true, minLength: 2, label: 'Nom' },
    raisonSociale: { required: true, minLength: 2, label: 'Raison sociale' },
    email: { required: false, format: 'email', label: 'Email' },
    telephone: { required: false, label: 'Téléphone' },
    adresse: { required: false, label: 'Adresse' },
  },
  agences: {
    code: { required: true, minLength: 1, label: 'Code' },
    nom: { required: true, minLength: 2, label: 'Nom' },
    adresse: { required: false, label: 'Adresse' },
    telephone: { required: false, label: 'Téléphone' },
    societeId: { required: true, label: 'Société' },
  },
  users: {
    nom: { required: true, minLength: 2, label: 'Nom' },
    email: { required: true, format: 'email', label: 'Email' },
    motDePasseHash: { required: false, minLength: 3, label: 'Mot de passe' },
    role: { required: true, label: 'Rôle' },
    societeId: { required: true, label: 'Société' },
    agenceId: { required: false, label: 'Agence' },
  },
  'client-totines': {
    numeroClient: { required: true, minLength: 1, label: 'Numéro client' },
    nom: { required: true, minLength: 2, label: 'Nom' },
    telephone: { required: false, label: 'Téléphone' },
    email: { required: false, format: 'email', label: 'Email' },
    agentCollecteurId: { required: false, label: 'Agent collecteur' },
    agenceId: { required: true, label: 'Agence' },
  },
  carnets: {
    numeroCarnet: { required: true, minLength: 1, label: 'Numéro carnet' },
    clientTotineId: { required: true, label: 'Client Totine' },
  },
  cotisations: {
    mois: { required: true, minLength: 1, label: 'Mois' },
    annee: { required: true, min: 0, label: 'Année' },
    mise: { required: true, min: 0, label: 'Mise' },
    clientId: { required: true, label: 'Client' },
  },
  comptes: {
    numeroCompte: { required: true, minLength: 1, label: 'Numéro compte' },
    typeCompte: { required: true, label: 'Type compte' },
    solde: { required: true, min: 0, label: 'Solde' },
  },
  'mouvement-epargnes': {
    reference: { required: true, minLength: 1, label: 'Référence' },
    type: { required: true, label: 'Type' },
    montant: { required: true, min: 0, label: 'Montant' },
    dateMouvement: { required: true, format: 'date', label: 'Date du mouvement' },
    statut: { required: false, label: 'Statut' },
  },
  'mouvement-items': {
    reference: { required: true, minLength: 1, label: 'Référence' },
    type: { required: true, label: 'Type' },
    montant: { required: true, min: 0, label: 'Montant' },
    date: { required: true, format: 'date', label: 'Date' },
    statut: { required: false, label: 'Statut' },
  },
  'client-soldes': {
    clientId: { required: true, label: 'Client' },
    soldeTotal: { required: true, min: 0, label: 'Solde total' },
  },
  'mouvement-totines': {
    jour: { required: true, min: 0, label: 'Jour' },
    montant: { required: true, min: 0, label: 'Montant' },
    carnetId: { required: true, label: 'Carnet' },
  },
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateField(value: unknown, rules: ValidationRule) {
  if (!rules) return null

  if (rules.required && (value === undefined || value === null || value === '')) {
    return `${rules.label || 'Champ'} est requis`
  }

  if (value === undefined || value === null || value === '') {
    return null
  }

  const stringValue = String(value)

  if (rules.minLength && stringValue.length < rules.minLength) {
    return `${rules.label} doit être au moins ${rules.minLength} caractères`
  }

  if (rules.format === 'email' && !emailRegex.test(stringValue)) {
    return `${rules.label} doit être un email valide`
  }

  if (rules.format === 'date' && Number.isNaN(Date.parse(stringValue))) {
    return `${rules.label} doit être une date valide`
  }

  if (rules.min !== undefined && parseFloat(stringValue) < rules.min) {
    return `${rules.label} doit être supérieur ou égal à ${rules.min}`
  }

  if (rules.max !== undefined && parseFloat(stringValue) > rules.max) {
    return `${rules.label} doit être inférieur ou égal à ${rules.max}`
  }

  return null
}

export function validateObject(obj: Record<string, unknown>, schema: ValidationSchema) {
  const errors: Record<string, string> = {}

  Object.entries(schema).forEach(([key, rules]) => {
    const error = validateField(obj[key], rules)
    if (error) {
      errors[key] = error
    }
  })

  return Object.keys(errors).length ? errors : null
}

export function formatFormData(
  formData: Record<string, unknown>,
  schema: ValidationSchema,
  parseFunctions: Record<string, (value: unknown) => unknown> = {}
) {
  const formatted: Record<string, unknown> = { ...formData }

  Object.entries(formatted).forEach(([key, value]) => {
    if (value === '') {
      delete formatted[key]
      return
    }

    if (parseFunctions[key]) {
      formatted[key] = parseFunctions[key](value)
      return
    }

    const schemaRule = schema[key]
    const shouldParseNumber =
      key.endsWith('Id') ||
      key === 'solde' ||
      key === 'soldeDisponible' ||
      key === 'mise' ||
      key === 'annee' ||
      key === 'montant' ||
      key === 'jour' ||
      key === 'clientId' ||
      key === 'carnetId' ||
      key === 'compteId' ||
      key === 'agenceId' ||
      key === 'agentCollecteurId' ||
      key === 'utilisateurId' ||
      key === 'clientTotineId' ||
      key === 'creeParId'

    if (shouldParseNumber && typeof value === 'string') {
      const num = parseFloat(value)
      formatted[key] = Number.isNaN(num) ? value : num
      return
    }

    if (schemaRule?.format === 'date' && typeof value === 'string') {
      formatted[key] = value
      return
    }
  })

  return formatted
}

/**
 * Map backend validation errors to form field errors
 * Backend returns: { details: [{ field: "email", code: "INVALID_EMAIL", message: "..." }] }
 * Frontend needs: { email: "Invalid email format" }
 */
export function mapBackendErrors(details: Array<{ field: string; code: string; message: string }>): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!Array.isArray(details)) {
    return errors
  }

  details.forEach((error) => {
    errors[error.field] = error.message || `Erreur: ${error.code}`
  })

  return errors
}
