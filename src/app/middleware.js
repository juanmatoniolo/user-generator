import { NextResponse } from "next/server";

export function middleware(request) {
	const auth = request.cookies.get("auth_session");

	if (!auth && request.nextUrl.pathname !== "/login") {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	if (auth && request.nextUrl.pathname === "/login") {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
