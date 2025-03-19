import { ContainerModule, interfaces } from "inversify";

import { IStudentService } from "@/src/application/ports/student.service.port";
import { StudentService } from "@/src/infrastructure/services/student.service";
import { MockStudentService } from "@/src/infrastructure/services/student.service.mock";

import { DI_SYMBOLS } from "../types";

const initializeModule = (bind: interfaces.Bind) => {
    if (process.env.NODE_ENV === "test") {
        bind<IStudentService>(DI_SYMBOLS.IStudentService).to(MockStudentService);
    } else {
        bind<IStudentService>(DI_SYMBOLS.IStudentService).to(StudentService);
    }
};

export const StudentModule = new ContainerModule(initializeModule);
