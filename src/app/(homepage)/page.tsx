// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/client/auth";
import { Post } from "@/types";

import Sidebar from "@/components/quacky-ui/sidebar";
import RightSidebar from "@/components/quacky-ui/discover";
import Posts from "@/components/quacky-ui/posts";
import Compose from "@/components/quacky-ui/compose";

export default function Home() {
    const session = authClient.useSession();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch posts from API
    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/posts");

            if (!res.ok) {
                console.error("Failed to fetch posts");
                return;
            }

            const data = await res.json();

            if (data.posts) {
                setPosts(data.posts);
            }

        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchPosts();
    }, [session]);

    // Upon creating a new post
    const handleNewPost = () => {
        fetchPosts();
    };

    return (
        <main className="min-h-screen w-full flex justify-center bg-background dark:bg-background">
            <div className="flex w-full max-w-[1200px] gap-4 px-4">
                <Sidebar />
                <div className="flex-1 flex flex-col gap-4 pt-8 max-w-2xl">

                    <Compose
                        onPost={handleNewPost}
                    />

                    <Posts
                        posts={posts}
                    />

                </div>
                <RightSidebar />
            </div>
        </main>
    );
}
