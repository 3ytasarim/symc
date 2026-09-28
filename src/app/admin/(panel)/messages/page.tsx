import type { Metadata } from "next";
import { deleteMessageAction, setMessageReadAction } from "@/app/admin/_actions/site";
import { PageHeader } from "@/components/admin/PageHeader";
import { ActionButton } from "@/components/admin/RowActions";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <>
      <PageHeader title="Messages" description="Enquiries sent through the contact form on /contact/." />
      <ul className="space-y-3">
        {messages.map((m) => (
          <li key={m.id} className={`rounded-[3px] border bg-white p-5 ${m.isRead ? "border-[#dde2e6]" : "border-sea"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{m.subject || "(no subject)"} {!m.isRead ? <span className="ml-2 rounded-full bg-sea px-2 py-0.5 text-[11px] text-white">New</span> : null}</p>
                <p className="text-[13px] text-mute">
                  {m.name} · <a href={`mailto:${m.email}`} className="underline">{m.email}</a>
                  {m.phone ? <> · <a href={`tel:${m.phone.replace(/[^\d+]/g, "")}`}>{m.phone}</a></> : null} · {m.createdAt.toLocaleString("en-GB", { timeZone: "Europe/Istanbul" })}
                </p>
              </div>
              <div className="flex gap-1.5">
                <ActionButton action={setMessageReadAction.bind(null, m.id, !m.isRead)} label={m.isRead ? "Mark unread" : "Mark read"} />
                <ActionButton action={deleteMessageAction.bind(null, m.id)} label="Delete" confirm="Delete this message?" className="admin-btn-xs text-signal" />
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed">{m.message}</p>
          </li>
        ))}
        {!messages.length ? <li className="rounded-[3px] border border-[#dde2e6] bg-white p-10 text-center text-mute">No messages yet.</li> : null}
      </ul>
    </>
  );
}
