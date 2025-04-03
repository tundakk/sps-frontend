import { IAuthenticationService } from "@/src/application/ports/authentication.service.port";
import { ISessionService } from "@/src/application/ports/session.service.port";
import { IApiClientService } from "@/src/application/ports/api-client.port";
import { IStudentService } from "@/src/application/ports/student.service.port";
import { AuthenticatedApiClientService } from "@/src/infrastructure/services/authenticated-api-client.service";
import { ICookieStorageService } from "@/src/application/ports/cookie-storage.port";
import { ISqliteService } from '@/src/application/ports/sqlite.service.port';

export const DI_SYMBOLS = {
  IAuthenticationService: Symbol.for("IAuthenticationService"),
  ISessionService: Symbol.for("ISessionService"),
  IApiClientService: Symbol.for('IApiClientService'),
  IStudentService: Symbol.for("IStudentService"),
  AuthenticatedApiClientService: Symbol.for("AuthenticatedApiClientService"),
  ICookieStorageService: Symbol.for("ICookieStorageService"),
  ISqliteService: Symbol.for('ISqliteService'),
  IStudentPresenter: Symbol.for('IStudentPresenter'),
};

export type DI_RETURN_TYPES = {
  IAuthenticationService: IAuthenticationService;
  ISessionService: ISessionService;
  IApiClientService: IApiClientService;
  IStudentService: IStudentService;
  AuthenticatedApiClientService: AuthenticatedApiClientService;
  ICookieStorageService: ICookieStorageService;
  ISqliteService: ISqliteService; 
  IStudentPresenter: import('@/src/application/ports/presenters/student-presenter.port').IStudentPresenter;
};