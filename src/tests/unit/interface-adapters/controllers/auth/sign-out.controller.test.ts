import "reflect-metadata";
import { afterEach, beforeEach, expect, it } from "vitest";

import { SESSION_COOKIE } from "@/config";
import { destroyContainer, initializeContainer } from "@/src/di/container";
import { signInUseCase } from "@/src/application/use-cases/auth/sign-in.use-case";
import { InputParseError } from "@/src/core/errors/common.error";
import { signOutController } from "@/src/interface-adapters/controllers/auth/sign-out.controller";

beforeEach(() => {
  initializeContainer();
});

afterEach(() => {
  destroyContainer();
});

// A great guide on test names
// https://www.epicweb.dev/talks/how-to-write-better-test-names
it("returns blank cookie", async () => {
  const { session } = await signInUseCase({
    username: "one",
    password: "password-one",
  });

  expect(signOutController(session.userId)).resolves.toMatchObject({
    success: true,
    data: {
      name: SESSION_COOKIE,
      value: "",
      attributes: {},
    }
  });
});

it("handles null session gracefully", async () => {
  expect(signOutController(null)).resolves.toMatchObject({
    success: true,
    data: null
  });
});

it("throws for invalid input", () => {
  // Cast to string to satisfy type checking
  expect(signOutController("" as string)).rejects.toBeInstanceOf(InputParseError);
});
