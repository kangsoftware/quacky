// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { notFound } from "next/navigation";

import RightSidebar from "@/components/quacky-ui/discover";
import Sidebar from "@/components/quacky-ui/sidebar";
import Posts from "@/components/quacky-ui/posts";
import Replies from "@/components/quacky-ui/replies";
import ReplyBox from "@/components/quacky-ui/reply-box";

import { Posts as PostService } from "@/quacky";
import { Post } from "@/types";

export default async function PostPage({ params }: { params: Promise<{ postId: string }> }) {
    const { postId } = await params;

    const result = await PostService.getById(postId);
    const post = result.post;

    if (!post) {
        notFound();
    }

    return (
        <main className="min-h-screen w-full flex justify-center bg-background dark:bg-background">
            <div className="flex w-full max-w-[1200px] gap-4 px-4">
                <Sidebar />

                <div className="flex-1 flex flex-col gap-4 pt-8 max-w-2xl">
                    <Posts posts={[post]} />

                    {!(post as Post).readOnly && (
                        <>
                                <ReplyBox postId={postId} />

                            <div className="flex flex-col gap-2">
                                <h2 className="text-xl font-bold text-primary px-1">
                                    Replies {(post as any).replies?.length ? `(${(post as any).replies.length})` : ''}
                                </h2>
                                <Replies replies={(post as any).replies || []} />
                            </div>
                        </>
                    )}

                </div>

                <RightSidebar />
            </div>
        </main>
    );
}
