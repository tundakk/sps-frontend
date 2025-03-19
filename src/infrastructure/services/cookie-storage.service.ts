import { injectable } from 'inversify';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { cookies } from 'next/headers';
import { ICookieStorageService } from '@/src/application/ports/cookie-storage.port';
import { CookieOptions } from '@/src/core/dtos/cookie.dto';

@injectable()
export class CookieStorageService implements ICookieStorageService {
  getCookie(key: string): string | null {
    // For server components, use Next.js cookies() API
    if (typeof window === 'undefined') {
      return cookies().get(key)?.value || null;
    }
    // For client components, use cookies-next
    return getCookie(key)?.toString() || null;
  }
  
  setCookie(key: string, value: string, options?: CookieOptions): void {
    if (typeof window === 'undefined') {
      cookies().set(key, value, options);
    } else {
      setCookie(key, value, options);
    }
  }
  
  removeCookie(key: string): void {
    if (typeof window === 'undefined') {
      cookies().delete(key);
    } else {
      deleteCookie(key);
    }
  }
}
