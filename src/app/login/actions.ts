"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username dan password wajib diisi cukk!" };
  }

  try {
    // Nembak endpoint autentikasi resmi WordPress JWT atau Application Password
    const res = await fetch("https://desa-wisata-bojongrangkas.biznityhub.com/wp-json/jwt-auth/v1/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || "Username atau password salah, coba cek lagi cukk!" };
    }

    // Jika sukses, simpan token JWT dari WordPress ke cookie aplikasi Next.js
    const cookieStore = await cookies();
    cookieStore.set("wp_token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 minggu
      path: "/",
    });
    
  } catch (err) {
    console.error("Login error:", err);
    return { error: "Gagal terhubung ke server WordPress cukk." };
  }

  // Redirect ke beranda setelah sukses login
  redirect("/");
}