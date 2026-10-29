import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request) {
	try {
		const { username, password } = await request.json();

		if (!username || !password) {
			return NextResponse.json(
				{ error: "Faltan datos" },
				{ status: 400 },
			);
		}

		const supabaseAdmin = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL,
			process.env.SUPABASE_SECRET_KEY,
		);

		const { data, error } = await supabaseAdmin
			.from("admins_app")
			.select("id, username")
			.eq("username", username)
			.eq("password", password)
			.single();

		if (error || !data) {
			return NextResponse.json(
				{ error: "Usuario o contraseña incorrectos" },
				{ status: 401 },
			);
		}

		return NextResponse.json({ success: true, username: data.username });
	} catch (err) {
		return NextResponse.json(
			{ error: "Error interno del servidor" },
			{ status: 500 },
		);
	}
}
