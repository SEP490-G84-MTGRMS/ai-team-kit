# Tasks: auth-login-feature

## Backend Tasks (ASP.NET Core 8 Web API)

- [x] BE-01: Setup AuthDtos (LoginRequest, LoginResponse, UserInfo, RefreshTokenRequest)
- [x] BE-02: Setup FluentValidation LoginRequestValidator
- [x] BE-03: Implement IAuthService & AuthService (LoginAsync, RefreshTokenAsync)
- [x] BE-04: IUserRepository & GenericRepository User entity integration
- [x] BE-05: POST /api/auth/login endpoint trong AuthController
- [x] BE-06: POST /api/auth/refresh endpoint trong AuthController
- [x] BE-07: POST /api/auth/logout endpoint trong AuthController
- [x] BE-08: Đăng ký Dependency Injection trong Application và Infrastructure
- [x] BE-09: Unit tests & Integration tests passing 100%

## Frontend Tasks (React 19 / TypeScript / Vite)

- [x] FE-01: Login form component (email/SĐT + password + tên miền + submit + tab QR)
- [x] FE-02: API integration AuthService.ts với fallback demo accounts
- [x] FE-03: Zustand auth store (token, user, isAuthenticated, setAuth, logout)
- [x] FE-04: Axios httpClient interceptor tự động đính kèm token
- [x] FE-05: Protected route guard (ProtectedRoute.tsx)
- [x] FE-06: Logout button trên AdminTopbar với chuyển hướng /auth/login
- [x] FE-07: Đồng bộ Design System KiotViet Blue Palette & 100% Monochrome SVG Icons

## Estimate & Verification
- BE: Hoàn tất (Build 0 warnings, test PASS)
- FE: Hoàn tất (Build 0 errors, worklog created)
