import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getCurrentAdmin()) redirect("/admin/");
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-[3px] border border-[#dde2e6] bg-white p-8">
        <Image src="/brand/symc-logo-horizontal.png" alt="SYMC" width={959} height={240} className="h-8 w-auto" priority />
        <h1 className="mb-6 mt-8 text-[18px] font-semibold">Website administration</h1>
        <LoginForm />
      </div>
    </main>
  );
}
