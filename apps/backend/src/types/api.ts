/**
 * Standardized API Response Types
 * All API endpoints should return responses matching these types
 */

export interface ApiResponse<T = null> {
  success: boolean
  data?: T
  error?: string
  statusCode: number
}

export interface ApiListResponse<T> {
  success: boolean
  data: T[]
  total: number
  skip: number
  take: number
  error?: string
  statusCode: number
}

export interface ApiErrorDetail {
  field?: string
  message: string
}

export interface ApiBadRequestResponse {
  success: false
  statusCode: 400
  error: string
  details?: ApiErrorDetail[]
}

export interface ApiNotFoundResponse {
  success: false
  statusCode: 404
  error: string
}

export interface ApiServerErrorResponse {
  success: false
  statusCode: 500
  error: string
}

/**
 * Helper to create standardized responses
 */
export const createResponse = <T>(
  data: T,
  statusCode: number = 200
): ApiResponse<T> => ({
  success: statusCode >= 200 && statusCode < 300,
  data,
  statusCode,
})

export const createListResponse = <T>(
  data: T[],
  total: number,
  skip: number,
  take: number,
  statusCode: number = 200
): ApiListResponse<T> => ({
  success: statusCode >= 200 && statusCode < 300,
  data,
  total,
  skip,
  take,
  statusCode,
})

export const createErrorResponse = (
  error: string,
  statusCode: number = 500,
  details?: ApiErrorDetail[]
) => ({
  success: false,
  error,
  ...(details && { details }),
  statusCode,
})
