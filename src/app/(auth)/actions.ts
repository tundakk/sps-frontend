"use server";

import { cookies } from "next/headers";
import { handleControllerResponse } from "@/src/utils/action-helpers";
import { signInController } from "@/src/interface-adapters/controllers/auth/sign-in.controller";
import { signOutController } from "@/src/interface-adapters/controllers/auth/sign-out.controller";
import { SESSION_COOKIE } from "@/config";

export async function signIn(formData: FormData) {
  const username = formData.get("username")?.toString();
  const password = formData.get("password")?.toString();

  return handleControllerResponse(
    () => signInController({ username, password }),
    {
      onSuccess: (sessionCookie) => {
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      },
      redirectTo: "/",
      onError: (err) => ({
        error: err instanceof Error ? 
          "Invalid email or password" : 
          "An error occurred. Please try again later."
      })
    }
  );
}

/* 
// Sign up functionality temporarily disabled
export async function signUp(formData: FormData) {
  const username = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();

  try {
    const { cookie, user } = await signUpController({ 
      username, 
      password, 
      confirm_password: confirmPassword 
    });
    
    // Set cookie in the browser
    cookies().set(
      cookie.name,
      cookie.value,
      cookie.attributes
    );

    redirect("/"); // Redirect to home page on success
  } catch (err) {
    if (err instanceof InputParseError) {
      return {
        error: "Please check your input and try again",
      };
    }
    
    if (err instanceof AuthenticationError) {
      return {
        error: "Registration failed. The email may already be in use.",
      };
    }
    
    console.error("Registration error:", err);
    return {
      error: "An error occurred. Please try again later.",
    };
  }
}
*/

export async function signOut() {
  return handleControllerResponse(
    async () => {
      const sessionId = cookies().get(SESSION_COOKIE)?.value;
      return await signOutController(sessionId || null);
    },
    {
      onSuccess: (blankCookie) => {
        if (blankCookie) {
          cookies().set(
            blankCookie.name,
            blankCookie.value,
            blankCookie.attributes
          );
        }
      },
      redirectTo: "/sign-in",
      onError: (err) => {
        console.error("Sign-out error:", err);
        return { error: "An error occurred during sign-out" };
      }
    }
  );
}