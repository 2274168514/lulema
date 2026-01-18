import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    // 排除登录、注册、API auth 路由和静态资源
    "/((?!api/auth|login|register|_next/static|_next/image|favicon.ico).*)",
  ],
};
