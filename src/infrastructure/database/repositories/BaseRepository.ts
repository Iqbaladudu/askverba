/**
 * Base Repository Pattern Implementation
 * Provides common database operations with PayloadCMS integration
 */

import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { createLogger } from '@/core/utils/logger'
import { ApiError } from '@/core/types/api.types'
import { ERROR_CODES } from '@/core/constants/errors'

// Base entity interface
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

// Query options for repository operations
export interface QueryOptions {
  where?: Record<string, unknown>
  sort?: string
  limit?: number
  page?: number
  depth?: number
  populate?: string[]
}

// Create data type (excludes auto-generated fields)
export type CreateData<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>

// Update data type (partial, excludes auto-generated fields)
export type UpdateData<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>

// Repository result with pagination
export interface RepositoryResult<T> {
  docs: T[]
  totalDocs: number
  limit: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// Abstract base repository class
export abstract class BaseRepository<T extends BaseEntity> {
  protected logger = createLogger(`Repository:${this.collectionSlug}`)
  protected payload: Payload | null = null

  constructor(protected collectionSlug: string) {}

  /**
   * Get PayloadCMS instance
   */
  protected async getPayload(): Promise<Payload> {
    if (!this.payload) {
      this.payload = await getPayload({ config })
    }
    return this.payload
  }

  /**
   * Handle repository errors
   */
  protected handleError(error: unknown, operation: string): never {
    this.logger.error(`${operation} failed`, error as Error)
    
    if (error instanceof Error) {
      // Map common PayloadCMS errors to our error codes
      if (error.message.includes('not found')) {
        throw new ApiError(ERROR_CODES.DATABASE.RECORD_NOT_FOUND, error.message)
      }
      if (error.message.includes('duplicate')) {
        throw new ApiError(ERROR_CODES.DATABASE.DUPLICATE_ENTRY, error.message)
      }
      if (error.message.includes('validation')) {
        throw new ApiError(ERROR_CODES.VALIDATION.INVALID_FORMAT, error.message)
      }
    }
    
    throw new ApiError(ERROR_CODES.DATABASE.QUERY_FAILED, 'Database operation failed')
  }

  /**
   * Find a single record by ID
   */
  async findById(id: string, options: Partial<QueryOptions> = {}): Promise<T | null> {
    try {
      const payload = await this.getPayload()
      
      const result = await payload.findByID({
        collection: this.collectionSlug,
        id,
        depth: options.depth || 1,
      })

      this.logger.debug('Found record by ID', { id, collection: this.collectionSlug })
      return result as T
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return null
      }
      this.handleError(error, 'findById')
    }
  }

  /**
   * Find multiple records with query options
   */
  async findMany(options: QueryOptions = {}): Promise<RepositoryResult<T>> {
    try {
      const payload = await this.getPayload()
      
      const result = await payload.find({
        collection: this.collectionSlug,
        where: options.where,
        sort: options.sort,
        limit: options.limit || 10,
        page: options.page || 1,
        depth: options.depth || 1,
      })

      this.logger.debug('Found records', { 
        collection: this.collectionSlug, 
        count: result.docs.length,
        total: result.totalDocs 
      })

      return result as RepositoryResult<T>
    } catch (error) {
      this.handleError(error, 'findMany')
    }
  }

  /**
   * Find a single record by query
   */
  async findOne(where: Record<string, unknown>, options: Partial<QueryOptions> = {}): Promise<T | null> {
    try {
      const result = await this.findMany({ ...options, where, limit: 1 })
      return result.docs[0] || null
    } catch (error) {
      this.handleError(error, 'findOne')
    }
  }

  /**
   * Create a new record
   */
  async create(data: CreateData<T>): Promise<T> {
    try {
      const payload = await this.getPayload()
      
      const result = await payload.create({
        collection: this.collectionSlug,
        data: data as any,
      })

      this.logger.info('Created record', { 
        collection: this.collectionSlug, 
        id: result.id 
      })

      return result as T
    } catch (error) {
      this.handleError(error, 'create')
    }
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: UpdateData<T>): Promise<T> {
    try {
      const payload = await this.getPayload()
      
      const result = await payload.update({
        collection: this.collectionSlug,
        id,
        data: data as any,
      })

      this.logger.info('Updated record', { 
        collection: this.collectionSlug, 
        id 
      })

      return result as T
    } catch (error) {
      this.handleError(error, 'update')
    }
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<void> {
    try {
      const payload = await this.getPayload()
      
      await payload.delete({
        collection: this.collectionSlug,
        id,
      })

      this.logger.info('Deleted record', { 
        collection: this.collectionSlug, 
        id 
      })
    } catch (error) {
      this.handleError(error, 'delete')
    }
  }

  /**
   * Count records matching query
   */
  async count(where: Record<string, unknown> = {}): Promise<number> {
    try {
      const result = await this.findMany({ where, limit: 1 })
      return result.totalDocs
    } catch (error) {
      this.handleError(error, 'count')
    }
  }

  /**
   * Check if a record exists
   */
  async exists(where: Record<string, unknown>): Promise<boolean> {
    try {
      const count = await this.count(where)
      return count > 0
    } catch (error) {
      this.handleError(error, 'exists')
    }
  }

  /**
   * Bulk create records
   */
  async createMany(data: CreateData<T>[]): Promise<T[]> {
    try {
      const results: T[] = []
      
      // PayloadCMS doesn't have native bulk create, so we create one by one
      // In a transaction-like manner
      for (const item of data) {
        const result = await this.create(item)
        results.push(result)
      }

      this.logger.info('Created multiple records', { 
        collection: this.collectionSlug, 
        count: results.length 
      })

      return results
    } catch (error) {
      this.handleError(error, 'createMany')
    }
  }

  /**
   * Bulk update records
   */
  async updateMany(where: Record<string, unknown>, data: UpdateData<T>): Promise<number> {
    try {
      // Find all matching records first
      const records = await this.findMany({ where, limit: 1000 }) // Reasonable limit
      
      let updatedCount = 0
      for (const record of records.docs) {
        await this.update(record.id, data)
        updatedCount++
      }

      this.logger.info('Updated multiple records', { 
        collection: this.collectionSlug, 
        count: updatedCount 
      })

      return updatedCount
    } catch (error) {
      this.handleError(error, 'updateMany')
    }
  }

  /**
   * Bulk delete records
   */
  async deleteMany(where: Record<string, unknown>): Promise<number> {
    try {
      // Find all matching records first
      const records = await this.findMany({ where, limit: 1000 }) // Reasonable limit
      
      let deletedCount = 0
      for (const record of records.docs) {
        await this.delete(record.id)
        deletedCount++
      }

      this.logger.info('Deleted multiple records', { 
        collection: this.collectionSlug, 
        count: deletedCount 
      })

      return deletedCount
    } catch (error) {
      this.handleError(error, 'deleteMany')
    }
  }
}

// Custom API Error class
class ApiError extends Error {
  constructor(public code: string, message: string, public details?: Record<string, unknown>) {
    super(message)
    this.name = 'ApiError'
  }
}

export { ApiError }
