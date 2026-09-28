import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { PasswordForm } from "@/components/admin/PasswordForm";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <>
      <PageHeader title="Account" description="Changing the password signs out all other sessions." />
      <PasswordForm />
    </>
  );
}
