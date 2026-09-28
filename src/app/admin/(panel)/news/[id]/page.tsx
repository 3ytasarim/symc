import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { PostForm } from "@/components/admin/PostForm";
import { loadPostForm, postFormOptions } from "@/lib/admin/post-form";

export const metadata: Metadata = { title: "Edit article" };

export default async function EditPostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const { created } = await searchParams;
  const [data, opts] = await Promise.all([loadPostForm(id), postFormOptions()]);
  if (!data) notFound();
  return (
    <>
      <PageHeader title={data.title} description="Edit article" />
      <PostForm key={id} initial={data} {...opts} notice={created ? "Article created." : undefined} />
    </>
  );
}
