import { ContainerModule } from "inversify";

import { ISessionService } from "@/src/application/ports/session.service.port";
import { SessionService } from "@/src/infrastructure/services/session.service";
import { SqliteSessionService } from "@/src/infrastructure/services/session-sqlite.service";
import { MockSessionService } from "@/src/infrastructure/services/session.service.mock";

import { DI_SYMBOLS } from "../types";

export const SessionModule = new ContainerModule((bind) => {
  // Select the appropriate implementation based on environment
  if (process.env.NODE_ENV === "test") {
    bind<ISessionService>(DI_SYMBOLS.ISessionService).to(MockSessionService).inSingletonScope();
    console.log("Using MockSessionService for testing");
  } else if (process.env.USE_SQLITE_SESSIONS === "true") {
    bind<ISessionService>(DI_SYMBOLS.ISessionService).to(SqliteSessionService).inSingletonScope();
    console.log("Using SqliteSessionService for persistent storage");
  } else {
    bind<ISessionService>(DI_SYMBOLS.ISessionService).to(SessionService).inSingletonScope();
    console.log("Using in-memory SessionService");
  }
});