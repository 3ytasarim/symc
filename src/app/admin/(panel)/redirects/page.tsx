import type { Metadata } from "next";
import { deleteRedirectAction } from "@/app/admin/_actions/site";
import { PageHeader } from "@/components/admin/PageHeader";
import { RedirectForm } from "@/components/admin/RedirectForm";
import { ActionButton } from "@/components/admin/RowActions";
import { prisma } from "@/lib/db";
import { legacyRedirects } from "@/lib/redirects/legacy";

export const metadata: Metadata = { title: "Redirects & SEO" };

export default async function RedirectsPage() {
  const redirects = await prisma.redirect.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageHeader title="Redirects & SEO" description="Managed redirects apply to any URL that does not match an existing page. Slug changes of published content are added here automatically." />
      <RedirectForm />
      <div className="mt-6 overflow-x-auto rounded-[3px] border border-[#dde2e6] bg-white">
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead className="border-b border-[#e6eaed] text-[11px] uppercase tracking-[0.08em] text-mute">
            <tr><th className="px-4 py-3">From</th><th className="px-4 py-3">To</th><th className="px-4 py-3">Code</th><th className="px-4 py-3">Source</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody>
            {redirects.map((r) => (
              <tr key={r.id} className="border-b border-[#eef1f3] last:border-0 font-mono">
                <td className="px-4 py-2.5">{r.fromPath}</td>
                <td className="px-4 py-2.5">{r.toPath}</td>
                <td className="px-4 py-2.5">{r.statusCode}</td>
                <td className="px-4 py-2.5 font-sans text-mute">{r.source === "SLUG_CHANGE" ? "Slug change" : "Manual"}</td>
                <td className="px-4 py-2.5 text-right"><ActionButton action={deleteRedirectAction.bind(null, r.id)} label="Delete" confirm="Delete this redirect?" className="admin-btn-xs text-signal" /></td>
              </tr>
            ))}
            {!redirects.length ? <tr><td colSpan={5} className="px-4 py-8 text-center font-sans text-mute">No managed redirects.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <details className="mt-8 rounded-[3px] border border-[#dde2e6] bg-white p-4 text-[13px]">
        <summary className="cursor-pointer font-semibold">Legacy symc.com.tr redirects ({legacyRedirects.length}, defined in code)</summary>
        <ul className="mt-3 space-y-1 font-mono text-[12px]">
          {legacyRedirects.map((r) => (
            <li key={r.source}>{r.source} → {r.destination}</li>
          ))}
        </ul>
      </details>
    </>
  );
}
