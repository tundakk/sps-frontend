import { ContainerModule } from "inversify";
import { ISqliteService } from "@/src/application/ports/sqlite.service.port";
import { SqliteService } from "@/src/infrastructure/services/sqlite.service";
import { DI_SYMBOLS } from "../types";

export const SqliteModule = new ContainerModule((bind) => {
  bind<ISqliteService>(DI_SYMBOLS.ISqliteService).to(SqliteService).inSingletonScope();
});