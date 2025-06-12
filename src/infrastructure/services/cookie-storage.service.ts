import { injectable } from 'inversify';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { cookies } from 'next/headers';
import { ICookieStorageService } from '@/src/application/ports/cookie-storage.port';
import { CookieOptions } from '@/src/core/dtos/cookie.dto';

@injectable()
export class CookieStorageService implements ICookieStorageService {
  async getCookie(key: string): Promise<string | null> {
    // For server components, use Next.js cookies() API
    if (typeof window === 'undefined') {
      const cookieStore = await cookies();
      return cookieStore.get(key)?.value || null;
    }
    // For client components, use cookies-next
    return getCookie(key)?.toString() || null;
  }
  
  async setCookie(key: string, value: string, options?: CookieOptions): Promise<void> {
    if (typeof window === 'undefined') {
      const cookieStore = await cookies();
      cookieStore.set(key, value, options);
    } else {
      setCookie(key, value, options);
    }
  }
  
  async removeCookie(key: string): Promise<void> {
    if (typeof window === 'undefined') {
      const cookieStore = await cookies();
      cookieStore.delete(key);
    } else {
      deleteCookie(key);
    }
  }
}
