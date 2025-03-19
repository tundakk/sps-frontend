import { ContainerModule } from "inversify";
import { DI_SYMBOLS } from "../types";
import { IApiClientService } from "@/src/application/ports/api-client.port";
import { ApiClientService } from "@/src/infrastructure/services/api-client.service";

export const ApiClientModule = new ContainerModule((bind) => {
  bind<IApiClientService>(DI_SYMBOLS.IApiClientService)
    .to(ApiClientService)
    .inSingletonScope();
});