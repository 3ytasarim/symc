"use server";

import { prisma } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/auth/rate-limit";
import { contactSchema, type ContactFormState } from "@/lib/validation/contact";

export async function submitContact(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  // Honeypot: real visitors never see or fill this field.
  if (String(formData.get("website") ?? "").length > 0) return { status: "success", message: "Thank you — your message has been sent." };

  const ip = await clientIp();
  if (!rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000).ok) {
    return { status: "error", message: "Too many messages from this connection. Please try again later or contact us by phone." };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    subject: formData.get("subject") ?? "",
    message: formData.get("message"),
  });
  if (!parsed.success) {
    const fieldErrors: ContactFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<ContactFormState["fieldErrors"]>;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  await prisma.contactMessage.create({ data: parsed.data });
  return { status: "success", message: "Thank you — your message has been sent. SYMC will get back to you shortly." };
}
