import { ContainerModule } from 'inversify';
import { DI_SYMBOLS } from '../types';
import { IStudentPresenter } from '@/src/application/ports/presenters/student-presenter.port';
import { StudentPresenter } from '@/src/interface-adapters/presenters/student.presenter';

/**
 * Presenter module for registering all presenters in the DI container
 */
export const PresenterModule = new ContainerModule((bind) => {
  bind<IStudentPresenter>(DI_SYMBOLS.IStudentPresenter)
    .to(StudentPresenter)
    .inSingletonScope();
    
  // Register other presenters here when needed
});