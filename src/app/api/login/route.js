import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Usamos la SECRET_KEY para que esto corra solo en el servidor, nunca en el navegador
const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	process.env.SUPABASE_SECRET_KEY, // Esta clave NO empieza con NEXT_PUBLIC, así que está a salvo
);

export async function POST(request) {
	try {
		const { username, password } = await request.json();

		if (!username || !password) {
			return NextResponse.json(
				{ error: "Faltan datos" },
				{ status: 400 },
			);
		}

		// Consultamos la base de datos de forma segura desde el servidor
		const { data, error } = await supabaseAdmin
			.from("admins_app")
			.select("id, username") // Solo traemos lo necesario, NO la contraseña
			.eq("username", username)
			.eq("password", password)
			.single();

		if (error || !data) {
			return NextResponse.json(
				{ error: "Usuario o contraseña incorrectos" },
				{ status: 401 },
			);
		}

		// Si todo está bien, devolvemos éxito
		return NextResponse.json({ success: true, username: data.username });
	} catch (err) {
		return NextResponse.json(
			{ error: "Error interno del servidor" },
			{ status: 500 },
		);
	}
}
