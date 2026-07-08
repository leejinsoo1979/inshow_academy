export const AUTH_USERS_KEY = "inshow:auth-users"
export const AUTH_SESSION_KEY = "inshow:auth-session"

export const SUPER_ADMIN = {
  username: "superadmin",
  password: "inshow1979!",
} as const

export type AuthRole = "superadmin" | "member"

export interface AuthUser {
  id: string
  username: string
  password: string
  name: string
  company: string
  email: string
  phone: string
  role: AuthRole
  createdAt: string
}

export interface AuthSession {
  username: string
  name: string
  role: AuthRole
  loginAt: string
}
