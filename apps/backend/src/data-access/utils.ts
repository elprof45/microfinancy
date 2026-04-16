/**
 * Data-access layer utilities
 * Helpers for hydrating relations and formatting responses
 */

/**
 * Hydrate a single entity with related entity names
 */
export const hydrateEntity = (entity: any, hydrators: Record<string, (id: any) => Promise<any> | any> = {}) => {
  return entity
}

/**
 * Hydrate list of entities
 */
export const hydrateEntities = (entities: any[], hydrators: Record<string, (id: any) => Promise<any> | any> = {}) => {
  return entities
}

/**
 * Add related entity name fields to response
 * Reduces frontend need for secondary lookups
 */
export const enrichWithNames = (item: any, relations: Record<string, string>) => {
  const enriched = { ...item }

  Object.entries(relations).forEach(([idField, nameField]) => {
    const id = item[idField]
    if (id && item[nameField.split('.')[0]]) {
      // Extract name from nested relation
      const parts = nameField.split('.')
      let value: any = item[idField]

      // Try to extract from object (ex: agence.nom from agenceId if item has agence object)
      if (parts.length > 1 && item[parts[0]]) {
        value = item[parts[0]][parts[1]]
      }

      enriched[`${idField}Name`] = value
    }
  })

  return enriched
}

/**
 * Example enrichment maps for each entity
 */
export const enrichmentMaps = {
  agence: { societeId: 'societe.nom' },
  utilisateur: { societeId: 'societe.nom', agenceId: 'agence.nom' },
  clientTotine: { agenceId: 'agence.nom', agentCollecteurId: 'agentCollecteur.nom' },
  carnet: { clientId: 'client.nom' },
  cotisation: { clientId: 'client.nom', carnetId: 'carnet.numeroCarnet', agenceId: 'agence.nom' },
  compte: { societeId: 'societe.nom' },
  mouvementEpargne: { compteId: 'compte.numeroCompte', agenceId: 'agence.nom' },
  mouvementItem: { carnetId: 'carnet.numeroCarnet' },
  mouvementTotine: { agenceId: 'agence.nom', clientId: 'client.nom' },
  clientSolde: { clientId: 'client.nom', compteId: 'compte.numeroCompte' },
}

/**
 * Hydrate a single entity
 */
export const hydrateOne = (item: any, entityType: string) => {
  const map = enrichmentMaps[entityType as keyof typeof enrichmentMaps] || {}
  return enrichWithNames(item, map)
}

/**
 * Hydrate multiple entities
 */
export const hydrateMany = (items: any[], entityType: string) => {
  return items.map((item) => hydrateOne(item, entityType))
}

/**
 * Format Prisma response to API response format
 * Handles Decimal types and dates
 */
export const formatResponse = (data: any): any => {
  if (data === null || data === undefined) {
    return data
  }

  if (Array.isArray(data)) {
    return data.map(formatResponse)
  }

  if (typeof data !== 'object') {
    return data
  }

  // Handle Prisma Decimal type
  if (data.constructor.name === 'Decimal' || (data.toFixed && typeof data.toFixed === 'function')) {
    return parseFloat(data.toString())
  }

  // Handle JS Objects and Prisma objects
  const formatted: any = {}

  Object.entries(data).forEach(([key, value]) => {
    formatted[key] = formatResponse(value)
  })

  return formatted
}
