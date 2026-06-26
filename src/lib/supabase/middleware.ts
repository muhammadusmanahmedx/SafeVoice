import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { isCounselorRole, normalizeRole } from "@/lib/auth/roles";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (path.startsWith("/faculty")) {
    const url = request.nextUrl.clone();
    url.pathname = path.replace(/^\/faculty/, "/counselor");
    return NextResponse.redirect(url);
  }
  if (path === "/faculty-register") {
    const url = request.nextUrl.clone();
    url.pathname = "/counselor-register";
    return NextResponse.redirect(url);
  }

  const isAuthPage =
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/counselor-register");

  if (!user && !isAuthPage && path !== "/" && path !== "/privacy") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role) {
      const url = request.nextUrl.clone();
      const role = normalizeRole(profile.role);
      if (role === "counselor") url.pathname = "/counselor/dashboard";
      else if (role === "admin") url.pathname = "/admin/dashboard";
      else url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  if (user && !isAuthPage && path !== "/") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    const role = profile.role;

    if (path.startsWith("/counselor") && !isCounselorRole(role) && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    if (path.startsWith("/admin") && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = isCounselorRole(role) ? "/counselor/dashboard" : "/dashboard";
      return NextResponse.redirect(url);
    }

    const studentRoutes = ["/dashboard", "/chat", "/mood", "/resources", "/cases"];
    if (studentRoutes.some((r) => path.startsWith(r)) && role !== "student") {
      const url = request.nextUrl.clone();
      url.pathname = role === "admin" ? "/admin/dashboard" : "/counselor/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
