import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 認証不要のパス
const publicPaths = ['/login', '/invite']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth_token')?.value

  // 認証不要パスかどうか判定
  const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'))

  // 未認証 → ログインページへリダイレクト
  if (!isPublic && !token) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 認証済みでログインページにアクセス → ダッシュボードへリダイレクト
  if (isPublic && token) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  // _next/static, _next/image, favicon.ico などは除外
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
