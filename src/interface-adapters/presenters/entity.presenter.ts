import { injectable } from 'inversify';
import { IEntityPresenter } from '@/src/application/ports/presenters/base-presenter.port';
import { ServiceResponse, ServiceResponseFactory } from '@/src/core/domain/service-response.model';
import { BasePresenter } from './base.presenter';

/**
 * Base implementation for entity presenters with common entity operation formatting
 */
@injectable()
export abstract class EntityPresenter<TEntity, TDetails> 
  extends BasePresenter<TEntity> 
  implements IEntityPresenter<TEntity, TDetails> {
  
  /**
   * Formats a single entity for presentation
   */
  presentEntity(response: ServiceResponse<TEntity>): ServiceResponse<TEntity> {
    return this.present(response);
  }
  
  /**
   * Formats entity details for presentation
   */
  presentEntityDetails(response: ServiceResponse<TDetails>): ServiceResponse<TDetails> {
    if (!response.success) {
      return this.formatError(response);
    }
    
    if (response.data) {
      return ServiceResponseFactory.createSuccess(
        this.formatDetails(response.data)
      );
    }
    
    return response;
  }
  
  /**
   * Formats a collection of entities for presentation
   */
  presentEntityCollection(response: ServiceResponse<TEntity[]>): ServiceResponse<TEntity[]> {
    return this.presentCollection(response);
  }
  
  /**
   * Formats entity creation response
   */
  presentEntityCreation(response: ServiceResponse<TEntity>): ServiceResponse<TEntity> {
    return this.presentEntity(response);
  }
  
  /**
   * Formats entity update response
   */
  presentEntityUpdate(response: ServiceResponse<TEntity>): ServiceResponse<TEntity> {
    return this.presentEntity(response);
  }
  
  /**
   * Formats entity deletion response
   */
  presentEntityDeletion(response: ServiceResponse<void>): ServiceResponse<void> {
    return response;
  }
  
  /**
   * Abstract method to format entity details
   * Must be implemented by derived classes
   */
  protected abstract formatDetails(data: TDetails): TDetails;
}