# Protected Routes Implementation

## Overview

Implementasi protected routes untuk AskVerba dashboard menggunakan Next.js best practices dengan multiple layers of protection:

1. **Middleware Level** - Route protection di level server
2. **HOC Level** - Higher-Order Components untuk component-level protection
3. **Layout Level** - Protection di dashboard layout
4. **Context Level** - Authentication state management

## Architecture

### 1. Middleware (`src/middleware.ts`)

Middleware Next.js yang berjalan di edge runtime untuk:
- Mengecek authentication token dari cookies/headers
- Redirect otomatis untuk protected routes
- Redirect otomatis untuk auth routes jika sudah login

**Protected Routes:**
- `/dashboard/*` - Semua halaman dashboard

**Auth Routes:**
- `/login` - Halaman login
- `/register` - Halaman register

**Public Routes:**
- `/` - Homepage
- `/about` - About page
- `/contact` - Contact page

### 2. Higher-Order Components (`src/components/auth/withAuth.tsx`)

HOC untuk membungkus komponen dengan authentication logic:

```tsx
// Require authentication
export default withRequiredAuth(MyComponent)

// Guest only (redirect if authenticated)
export default withGuestOnly(MyComponent)

// Custom options
export default withAuth(MyComponent, {
  redirectTo: '/custom-login',
  requireAuth: true,
  redirectIfAuthenticated: false
})
```

### 3. AuthGuard Component (`src/components/auth/AuthGuard.tsx`)

Komponen yang lebih fleksibel untuk protection:

```tsx
<AuthGuard requireAuth={true}>
  <ProtectedContent />
</AuthGuard>

<ProtectedRoute>
  <DashboardContent />
</ProtectedRoute>

<GuestOnlyRoute>
  <LoginForm />
</GuestOnlyRoute>
```

### 4. Authentication Context (`src/contexts/AuthContext.tsx`)

State management untuk authentication:
- Customer data
- Token management
- Loading states
- Login/logout functions
- Persistent storage (localStorage)

## Implementation Details

### Dashboard Protection

Dashboard layout menggunakan `withRequiredAuth` HOC:

```tsx
// src/app/(app)/dashboard/layout.tsx
function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      {children}
    </div>
  )
}

export default withRequiredAuth(DashboardLayout)
```

### Auth Pages Protection

Login dan register pages menggunakan `withGuestOnly`:

```tsx
// src/app/(app)/login/page.tsx
function LoginPage() {
  return <LoginForm />
}

export default withGuestOnly(LoginPage)
```

### Redirect Logic

1. **Unauthenticated user accessing protected route:**
   - Redirect ke `/login?redirect=/original-path`
   - Setelah login, redirect kembali ke original path

2. **Authenticated user accessing auth pages:**
   - Redirect ke `/dashboard` atau path dari query parameter

3. **Loading states:**
   - Tampilkan loading spinner saat checking authentication
   - Prevent flash of wrong content

## Testing

### Manual Testing Scenarios

1. **Akses dashboard tanpa login:**
   ```
   Visit: /dashboard
   Expected: Redirect to /login?redirect=/dashboard
   ```

2. **Login dengan redirect:**
   ```
   Visit: /login?redirect=/dashboard/vocabulary
   Login successfully
   Expected: Redirect to /dashboard/vocabulary
   ```

3. **Akses login saat sudah login:**
   ```
   Already logged in, visit: /login
   Expected: Redirect to /dashboard
   ```

4. **Persistence test:**
   ```
   Login -> Refresh page
   Expected: Still logged in, no redirect
   ```

5. **Logout test:**
   ```
   Logout -> Try access /dashboard
   Expected: Redirect to /login
   ```

### Test Page

Gunakan `/auth-test` untuk testing interaktif:
- Melihat authentication status
- Test semua routes
- Test login/logout flow

## Cookie Management Strategy

### **Why Next.js Cookies Over js-cookie?**

1. **Native Integration:**
   - Built-in di Next.js, tidak perlu external dependency
   - Better integration dengan App Router dan Server Components
   - Type-safe dengan TypeScript

2. **Server-Side Compatibility:**
   - Bisa diakses di Server Components dan Server Actions
   - Middleware bisa membaca cookies secara native
   - Better untuk SSR dan hydration

3. **Security & Performance:**
   - Automatic handling untuk secure, httpOnly, sameSite
   - No additional bundle size
   - Better performance tanpa external library

### **Separated Server/Client Architecture:**

**Server-side utilities** (`src/lib/server-cookies.ts`):
```typescript
import { cookies } from 'next/headers'

export async function setAuthCookies(token: string, customer: any): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, COOKIE_CONFIG)
  cookieStore.set('auth-customer', JSON.stringify(customer), {
    ...COOKIE_CONFIG,
    httpOnly: false, // Customer data accessible on client
  })
}
```

**Client-side utilities** (`src/lib/auth-cookies.ts`):
```typescript
export function getAuthTokenHybrid(): string | null {
  // Try cookies first (works in both server and client)
  const tokenFromCookie = getAuthTokenFromDocument()
  if (tokenFromCookie) return tokenFromCookie

  // Fallback to localStorage (client-side only)
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth-token')
  }

  return null
}
```

**Why Separation is Important:**
- `next/headers` only works in Server Components/Actions
- Client Components need different cookie access methods
- Prevents "You're importing a component that needs next/headers" error

## Security Considerations

1. **Token Storage:**
   - Primary: Next.js cookies dengan httpOnly untuk security
   - Fallback: localStorage untuk client-side compatibility
   - Hybrid approach untuk maximum compatibility

2. **Route Protection:**
   - Multiple layers: middleware + HOC + layout
   - Server-side dan client-side validation

3. **Error Handling:**
   - Graceful fallback untuk authentication errors
   - Clear error messages untuk users

4. **Loading States:**
   - Prevent flash of unauthenticated content
   - Smooth transitions between states

## Best Practices Implemented

1. **Next.js App Router:**
   - Menggunakan middleware untuk server-side protection
   - Client components untuk authentication logic

2. **TypeScript:**
   - Type-safe authentication context
   - Proper typing untuk HOCs dan components

3. **User Experience:**
   - Loading states yang informatif
   - Smooth redirects tanpa flash
   - Preserve intended destination

4. **Maintainability:**
   - Reusable HOCs dan components
   - Centralized authentication logic
   - Clear separation of concerns

## Usage Examples

### Protecting a New Page

```tsx
// Method 1: Using HOC
function MyProtectedPage() {
  return <div>Protected content</div>
}
export default withRequiredAuth(MyProtectedPage)

// Method 2: Using AuthGuard
function MyPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  )
}
```

### Adding New Protected Routes

Update middleware configuration:

```tsx
// src/middleware.ts
const protectedRoutes = [
  '/dashboard',
  '/profile',      // Add new protected route
  '/settings'      // Add another protected route
]
```

### Custom Loading States

```tsx
<AuthGuard 
  requireAuth={true}
  fallback={<CustomLoadingComponent />}
>
  <ProtectedContent />
</AuthGuard>
```
