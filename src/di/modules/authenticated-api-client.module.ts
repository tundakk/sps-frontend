import { ContainerModule, interfaces } from "inversify";

import { DI_SYMBOLS } from "../types";
import { AuthenticatedApiClientService } from "@/src/infrastructure/services/authenticated-api-client.service";

const initializeModule = (bind: interfaces.Bind) => {
    bind<AuthenticatedApiClientService>(DI_SYMBOLS.AuthenticatedApiClientService)
        .to(AuthenticatedApiClientService)
        .inSingletonScope();
};

export const AuthenticatedApiClientModule = new ContainerModule(initializeModule);