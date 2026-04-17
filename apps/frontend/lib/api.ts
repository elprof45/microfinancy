export type EntityFieldConfig = {
  name: string
  label: string
  type: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select'
  required?: boolean
  placeholder?: string
  options?: Array<{ value: string | number; label: string }>
}

export type EntityConfig = {
  label: string
  apiPath: string
  fields: EntityFieldConfig[]
  listColumns: string[]
}

export type EntityKey =
  | 'societes'
  | 'agences'
  | 'users'
  | 'client-totines'
  | 'carnets'
  | 'cotisations'
  | 'comptes'
  | 'mouvement-epargnes'
  | 'mouvement-items'
  | 'client-soldes'
  | 'mouvement-totines'

export const entityConfigs: Record<EntityKey, EntityConfig> = {
  societes: {
    label: 'Sociétés',
    apiPath: 'societies',
    listColumns: ['id', 'nom', 'raisonSociale', 'email', 'telephone'],
    fields: [
      { name: 'nom', label: 'Nom', type: 'text', required: true, placeholder: 'Nom société' },
      { name: 'raisonSociale', label: 'Raison sociale', type: 'text', placeholder: 'Raison sociale' },
      { name: 'identifiant', label: 'Identifiant', type: 'text', placeholder: 'Identifiant interne' },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'contact@example.com' },
      { name: 'telephone', label: 'Téléphone', type: 'text', placeholder: '+228...' },
      { name: 'adresse', label: 'Adresse', type: 'textarea', placeholder: 'Adresse complète' },
    ],
  },
  agences: {
    label: 'Agences',
    apiPath: 'agences',
    listColumns: ['id', 'code', 'nom', 'adresse', 'telephone'],
    fields: [
      { name: 'code', label: 'Code', type: 'text', required: true, placeholder: 'AG-...' },
      { name: 'nom', label: 'Nom', type: 'text', required: true, placeholder: 'Nom agence' },
      { name: 'adresse', label: 'Adresse', type: 'textarea', placeholder: 'Adresse' },
      { name: 'telephone', label: 'Téléphone', type: 'text', placeholder: '+228...' },
      { name: 'societeId', label: 'Société (ID)', type: 'number', required: true, placeholder: 'ID société' },
    ],
  },
  users: {
    label: 'Utilisateurs',
    apiPath: 'users',
    listColumns: ['id', 'nom', 'email', 'telephone', 'role'],
    fields: [
      { name: 'nom', label: 'Nom', type: 'text', required: true, placeholder: 'Nom utilisateur' },
      { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'email@example.com' },
      { name: 'motDePasseHash', label: 'Mot de passe', type: 'text', placeholder: 'Mot de passe' },
      { name: 'telephone', label: 'Téléphone', type: 'text', placeholder: '+228...' },
      { name: 'role', label: 'Rôle', type: 'select', required: true, options: [
        { value: 'ADMIN', label: 'ADMIN' },
        { value: 'CAISSIER', label: 'CAISSIER' },
        { value: 'USER', label: 'USER' },
      ] },
      { name: 'societeId', label: 'Société (ID)', type: 'number', required: true, placeholder: 'ID société' },
      { name: 'agenceId', label: 'Agence (ID)', type: 'number', placeholder: 'ID agence' },
    ],
  },
  'client-totines': {
    label: 'Clients Totine',
    apiPath: 'client-totines',
    listColumns: ['id', 'numeroClient', 'nom', 'telephone', 'email'],
    fields: [
      { name: 'numeroClient', label: 'Numéro client', type: 'text', required: true, placeholder: 'CL-0001' },
      { name: 'nom', label: 'Nom', type: 'text', required: true, placeholder: 'Nom client' },
      { name: 'telephone', label: 'Téléphone', type: 'text', placeholder: '+228...' },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'client@example.com' },
      { name: 'agentCollecteurId', label: 'Agent collecteur (ID)', type: 'number', placeholder: 'ID agent' },
      { name: 'agenceId', label: 'Agence (ID)', type: 'number', required: true, placeholder: 'ID agence' },
    ],
  },
  carnets: {
    label: 'Carnets',
    apiPath: 'carnets',
    listColumns: ['id', 'numeroCarnet', 'clientTotineId', 'agentCollecteurId'],
    fields: [
      { name: 'numeroCarnet', label: 'Numéro carnet', type: 'text', required: true, placeholder: 'CN-0001' },
      { name: 'agentCollecteurId', label: 'Agent collecteur (ID)', type: 'number', placeholder: 'ID agent' },
      { name: 'clientTotineId', label: 'Client Totine (ID)', type: 'number', required: true, placeholder: 'ID client' },
    ],
  },
  cotisations: {
    label: 'Cotisations',
    apiPath: 'cotisations',
    listColumns: ['id', 'mois', 'annee', 'mise', 'soldeDisponible'],
    fields: [
      { name: 'mois', label: 'Mois', type: 'text', required: true, placeholder: 'JANVIER' },
      { name: 'annee', label: 'Année', type: 'number', required: true, placeholder: '2026' },
      { name: 'mise', label: 'Mise', type: 'number', required: true, placeholder: '50000' },
      { name: 'soldeDisponible', label: 'Solde disponible', type: 'number', placeholder: '50000' },
      { name: 'clientId', label: 'Client (ID)', type: 'number', required: true, placeholder: 'ID client' },
      { name: 'carnetId', label: 'Carnet (ID)', type: 'number', placeholder: 'ID carnet' },
      { name: 'agenceId', label: 'Agence (ID)', type: 'number', placeholder: 'ID agence' },
      { name: 'agentCollecteurId', label: 'Agent collecteur (ID)', type: 'number', placeholder: 'ID agent' },
    ],
  },
  comptes: {
    label: 'Comptes',
    apiPath: 'comptes',
    listColumns: ['id', 'numeroCompte', 'typeCompte', 'solde', 'soldeDisponible'],
    fields: [
      { name: 'numeroCompte', label: 'Numéro compte', type: 'text', required: true, placeholder: 'CP-0001' },
      { name: 'typeCompte', label: 'Type compte', type: 'text', required: true, placeholder: 'EPARGNE' },
      { name: 'solde', label: 'Solde', type: 'number', required: true, placeholder: '100000' },
      { name: 'soldeDisponible', label: 'Solde disponible', type: 'number', placeholder: '100000' },
      { name: 'deviseId', label: 'Devise', type: 'text', placeholder: 'XOF' },
      { name: 'clientId', label: 'Client (ID)', type: 'number', placeholder: 'ID client' },
      { name: 'agenceId', label: 'Agence (ID)', type: 'number', placeholder: 'ID agence' },
    ],
  },
  'mouvement-epargnes': {
    label: 'Mouvements épargne',
    apiPath: 'mouvement-epargnes',
    listColumns: ['id', 'reference', 'type', 'montant', 'statut'],
    fields: [
      { name: 'reference', label: 'Référence', type: 'text', required: true, placeholder: 'ME-0001' },
      { name: 'type', label: 'Type', type: 'text', required: true, placeholder: 'VERSEMENT' },
      { name: 'montant', label: 'Montant', type: 'number', required: true, placeholder: '25000' },
      { name: 'soldeAvant', label: 'Solde avant', type: 'number', placeholder: '100000' },
      { name: 'soldeApres', label: 'Solde après', type: 'number', placeholder: '125000' },
      { name: 'dateMouvement', label: 'Date du mouvement', type: 'date', required: true },
      { name: 'statut', label: 'Statut', type: 'text', placeholder: 'VALIDE' },
      { name: 'observations', label: 'Observations', type: 'textarea', placeholder: 'Observations' },
      { name: 'agenceId', label: 'Agence (ID)', type: 'number', placeholder: 'ID agence' },
      { name: 'clientId', label: 'Client (ID)', type: 'number', placeholder: 'ID client' },
      { name: 'compteId', label: 'Compte (ID)', type: 'number', placeholder: 'ID compte' },
      { name: 'creeParId', label: 'Créé par (ID)', type: 'number', placeholder: 'ID utilisateur' },
    ],
  },
  'mouvement-items': {
    label: 'Mouvements items',
    apiPath: 'mouvement-items',
    listColumns: ['id', 'reference', 'type', 'montant', 'statut'],
    fields: [
      { name: 'reference', label: 'Référence', type: 'text', required: true, placeholder: 'MI-0001' },
      { name: 'type', label: 'Type', type: 'text', required: true, placeholder: 'DEPOT' },
      { name: 'montant', label: 'Montant', type: 'number', required: true, placeholder: '15000' },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'compteId', label: 'Compte (ID)', type: 'number', placeholder: 'ID compte' },
      { name: 'caissierId', label: 'Caissier (ID)', type: 'number', placeholder: 'ID utilisateur' },
      { name: 'statut', label: 'Statut', type: 'text', placeholder: 'VALIDE' },
    ],
  },
  'client-soldes': {
    label: 'Soldes clients',
    apiPath: 'client-soldes',
    listColumns: ['id', 'clientId', 'soldeTotal', 'agenceId'],
    fields: [
      { name: 'clientId', label: 'Client (ID)', type: 'number', required: true, placeholder: 'ID client' },
      { name: 'soldeTotal', label: 'Solde total', type: 'number', required: true, placeholder: '75000' },
      { name: 'agenceId', label: 'Agence (ID)', type: 'number', placeholder: 'ID agence' },
      { name: 'agentCollecteurId', label: 'Agent collecteur (ID)', type: 'number', placeholder: 'ID agent' },
    ],
  },
  'mouvement-totines': {
    label: 'Mouvements totines',
    apiPath: 'mouvement-totines',
    listColumns: ['id', 'jour', 'montant', 'carnetId', 'utilisateurId'],
    fields: [
      { name: 'jour', label: 'Jour', type: 'number', required: true, placeholder: '12' },
      { name: 'montant', label: 'Montant', type: 'number', required: true, placeholder: '25000' },
      { name: 'carnetId', label: 'Carnet (ID)', type: 'number', placeholder: 'ID carnet' },
      { name: 'agenceId', label: 'Agence (ID)', type: 'number', placeholder: 'ID agence' },
      { name: 'utilisateurId', label: 'Utilisateur (ID)', type: 'number', placeholder: 'ID utilisateur' },
      { name: 'clientTotineId', label: 'Client Totine (ID)', type: 'number', placeholder: 'ID client' },
    ],
  },
}

export const entityKeys = Object.keys(entityConfigs) as EntityKey[]

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3030'

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message = payload?.error || payload?.message || response.statusText
    const error: any = new Error(message)
    error.status = response.status
    error.details = payload?.details
    throw error
  }

  return payload?.data ?? payload
}

export const api = {
  list(entity: EntityKey) {
    return apiRequest<any[]>(`/${entityConfigs[entity].apiPath}`)
  },
  get(entity: EntityKey, id: number | string) {
    return apiRequest<any>(`/${entityConfigs[entity].apiPath}/${id}`)
  },
  create(entity: EntityKey, data: Record<string, unknown>) {
    return apiRequest<any>(`/${entityConfigs[entity].apiPath}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  update(entity: EntityKey, id: number | string, data: Record<string, unknown>) {
    return apiRequest<any>(`/${entityConfigs[entity].apiPath}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
  remove(entity: EntityKey, id: number | string) {
    return apiRequest<any>(`/${entityConfigs[entity].apiPath}/${id}`, {
      method: 'DELETE',
    })
  },
  stats(entity: EntityKey, id: number | string) {
    return apiRequest<any>(`/${entityConfigs[entity].apiPath}/${id}/stats`)
  },
  history(entity: EntityKey, id: number | string) {
    return apiRequest<any>(`/${entityConfigs[entity].apiPath}/${id}/history`)
  },
  async health(entity: EntityKey) {
    try {
      const result = await apiRequest<any[]>(`/${entityConfigs[entity].apiPath}`)
      return {
        status: 'ok' as const,
        count: Array.isArray(result) ? result.length : 0,
        message: 'Disponible',
      }
    } catch (error: any) {
      return {
        status: 'error' as const,
        count: undefined,
        message: error?.message || 'Indisponible',
      }
    }
  },
}
