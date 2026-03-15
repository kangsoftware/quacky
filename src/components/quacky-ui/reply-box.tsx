"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ReplyBoxProps {
    postId: string;
}

export default function ReplyBox({ postId }: ReplyBoxProps) {
    const router = useRouter();
    const [content, setContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);

    const handleReply = async () => {
        const trimmed = content.trim();

        if (!trimmed || isPosting) {
            return;
        }

        try {
            setIsPosting(true);
            const res = await fetch(`/api/posts/${postId}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: trimmed }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                alert(data?.error || "Failed to reply");
                return;
            }

            setContent("");
            router.refresh();
        } catch {
            alert("Failed to reply");
        } finally {
            setIsPosting(false);
        }
    };

    const isDisabled = !content.trim() || isPosting;

    return (
        <div className="w-full max-w-xl">
            <div className="flex items-center gap-2">
                <Input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your reply..."
                    maxLength={280}
                    className="h-10 rounded-lg !bg-[var(--lynt)]"
                />
                <Button
                    onClick={handleReply}
                    disabled={isDisabled}
                    className="h-10 rounded-lg px-4 font-bold"
                >
                    {isPosting ? "Replying..." : "Reply"}
                </Button>
            </div>
        </div>
    );
}
