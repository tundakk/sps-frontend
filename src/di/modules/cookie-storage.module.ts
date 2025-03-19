import { ContainerModule, interfaces } from "inversify";
import { ICookieStorageService } from "@/src/application/ports/cookie-storage.port";
import { CookieStorageService } from "@/src/infrastructure/services/cookie-storage.service";
import { DI_SYMBOLS } from "../types";

const initializeModule = (bind: interfaces.Bind) => {
  bind<ICookieStorageService>(DI_SYMBOLS.ICookieStorageService)
    .to(CookieStorageService)
    .inSingletonScope();
};

export const CookieStorageModule = new ContainerModule(initializeModule);
