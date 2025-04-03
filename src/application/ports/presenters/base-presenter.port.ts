import { ServiceResponse } from "@/src/core/domain/service-response.model";

/**
 * Base presenter interface for handling presentation formatting of data
 */
export interface IBasePresenter<T> {
  /**
   * Formats a single entity for presentation
   */
  present(response: ServiceResponse<T>): ServiceResponse<T>;
  
  /**
   * Formats a collection of entities for presentation
   */
  presentCollection(response: ServiceResponse<T[]>): ServiceResponse<T[]>;
}

/**
 * Extended presenter interface for entity operations
 */
export interface IEntityPresenter<TEntity, TDetails> {
  /**
   * Formats a single entity for presentation
   */
  presentEntity(response: ServiceResponse<TEntity>): ServiceResponse<TEntity>;
  
  /**
   * Formats entity details for presentation
   */
  presentEntityDetails(response: ServiceResponse<TDetails>): ServiceResponse<TDetails>;
  
  /**
   * Formats a collection of entities for presentation
   */
  presentEntityCollection(response: ServiceResponse<TEntity[]>): ServiceResponse<TEntity[]>;
  
  /**
   * Formats entity creation response
   */
  presentEntityCreation(response: ServiceResponse<TEntity>): ServiceResponse<TEntity>;
  
  /**
   * Formats entity update response
   */
  presentEntityUpdate(response: ServiceResponse<TEntity>): ServiceResponse<TEntity>;
  
  /**
   * Formats entity deletion response
   */
  presentEntityDeletion(response: ServiceResponse<void>): ServiceResponse<void>;
}