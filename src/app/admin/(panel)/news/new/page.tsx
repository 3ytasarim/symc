import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { PostForm } from "@/components/admin/PostForm";
import { emptyPostForm, postFormOptions } from "@/lib/admin/post-form";

export const metadata: Metadata = { title: "New article" };

export default async function NewPostPage() {
  const opts = await postFormOptions();
  return (
    <>
      <PageHeader title="New article" />
      <PostForm initial={emptyPostForm} {...opts} />
    </>
  );
}
