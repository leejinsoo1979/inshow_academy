import Link from "next/link"

export function AuthLinks() {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="relative overflow-hidden rounded-full border border-foreground/10 bg-background/45 px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur-xl transition-all duration-300 ease-out hover:border-foreground/20 hover:bg-foreground/5"
      >
        로그인
      </Link>
      <Link
        href="/signup"
        className="relative overflow-hidden rounded-full border border-foreground/10 bg-foreground/5 px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur-xl transition-all duration-300 ease-out hover:border-foreground/20 hover:bg-foreground/10"
      >
        회원가입
      </Link>
    </div>
  )
}
