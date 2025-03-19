// // users.module.ts
// import { ContainerModule, interfaces } from "inversify";

// import { UserService } from "@/src/infrastructure/services/users.service";
// import { IUserService } from "@/src/application/ports/users.service.port";
// import { MockUsersService } from "@/src/infrastructure/services/users.service.mock";

// import { DI_SYMBOLS } from "../types";
// const initializeModule = (bind: interfaces.Bind) => {
//   if (process.env.NODE_ENV === "test") {
//     bind<IUserService>(DI_SYMBOLS.IUserService).to(MockUsersService);
//   } else {
//     bind<IUserService>(DI_SYMBOLS.IUserService).to(UserService);
//   }
// };

// export const UsersModule = new ContainerModule(initializeModule);
