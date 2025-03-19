import { CookieOptions } from "@/src/core/dtos/cookie.dto";

export interface ICookieStorageService {
  getCookie(key: string): string | null;
  setCookie(key: string, value: string, options?: CookieOptions): void;
  removeCookie(key: string): void;
}
