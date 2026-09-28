import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="rounded-[3px] border border-[#dde2e6] bg-white p-10 text-center">
      <h1 className="text-[20px] font-semibold">Not found</h1>
      <p className="mt-2 text-mute">This item does not exist or was deleted.</p>
      <Link href="/admin/" className="admin-btn mt-6">Back to dashboard</Link>
    </div>
  );
}
