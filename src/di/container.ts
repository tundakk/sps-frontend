import 'reflect-metadata'; // This must be the first import
// container.ts

import { Container } from "inversify";

import { AuthenticationModule } from "./modules/authentication.module";
import { SessionModule } from "./modules/session.module";
import { StudentModule } from './modules/student.module';
import { AuthenticatedApiClientModule } from "./modules/authenticated-api-client.module";
import { CookieStorageModule } from './modules/cookie-storage.module';
import { ApiClientModule } from './modules/api-client.module';
import { SqliteModule } from './modules/sqlite.module';
import { PresenterModule } from './modules/presenter.module';


import { DI_RETURN_TYPES, DI_SYMBOLS } from "./types";

const ApplicationContainer = new Container({
  defaultScope: "Singleton",
});

export const initializeContainer = () => {
  ApplicationContainer.load(
    AuthenticationModule, 
    SessionModule, 
    StudentModule, 
    AuthenticatedApiClientModule,
    CookieStorageModule,
    ApiClientModule,
    SqliteModule,
    PresenterModule
  );
};

export const destroyContainer = () => {
  ApplicationContainer.unload(
    AuthenticationModule, 
    SessionModule, 
    StudentModule, 
    AuthenticatedApiClientModule,
    CookieStorageModule,
    ApiClientModule,
    SqliteModule,
    PresenterModule
  );
};

if (process.env.NODE_ENV !== "test") {
  initializeContainer();
}

export function getInjection<K extends keyof DI_RETURN_TYPES>(
  symbol: K,
): DI_RETURN_TYPES[K] {
  return ApplicationContainer.get(DI_SYMBOLS[symbol]);
}

export { ApplicationContainer };