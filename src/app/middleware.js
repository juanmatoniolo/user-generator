import { NextResponse } from "next/server";

export function middleware(request) {
	const auth = request.cookies.get("auth_session");
	const { pathname } = request.nextUrl;

	const rutasProtegidas = ["/dashboard", "/pagos"];
	const esRutaProtegida = rutasProtegidas.some((ruta) =>
		pathname.startsWith(ruta),
	);

	if (esRutaProtegida && !auth) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	if (auth && pathname === "/") {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.jpg).*)"],
};
