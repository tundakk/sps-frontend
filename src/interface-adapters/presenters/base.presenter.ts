import { injectable } from 'inversify';
import { IBasePresenter } from '@/src/application/ports/presenters/base-presenter.port';
import { ServiceResponse, ServiceResponseFactory } from '@/src/core/domain/service-response.model';

/**
 * Base implementation of presenter that handles common formatting logic
 */
@injectable()
export abstract class BasePresenter<T> implements IBasePresenter<T> {
  /**
   * Formats a single entity for presentation
   */
  present(response: ServiceResponse<T>): ServiceResponse<T> {
    if (!response.success) {
      return this.formatError(response);
    }
    
    if (response.data) {
      return ServiceResponseFactory.createSuccess(
        this.formatData(response.data)
      );
    }
    
    return response;
  }
  
  /**
   * Formats a collection of entities for presentation
   */
  presentCollection(response: ServiceResponse<T[]>): ServiceResponse<T[]> {
    if (!response.success) {
      return this.formatError(response);
    }
    
    if (response.data) {
      return ServiceResponseFactory.createSuccess(
        response.data.map(item => this.formatData(item))
      );
    }
    
    return response;
  }
  
  /**
   * Common error formatting logic
   * Override this method in derived classes to customize error formatting
   */
  protected formatError<R>(response: ServiceResponse<R>): ServiceResponse<R> {
    // Common error formatting logic can be added here
    return response;
  }
  
  /**
   * Abstract method to format a single data item
   * Must be implemented by derived classes
   */
  protected abstract formatData(data: T): T;
}