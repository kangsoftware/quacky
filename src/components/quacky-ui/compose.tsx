// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

import { ChangeEvent, useState } from "react";
import { authClient } from "@/client/auth";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CharacterCounter } from "@/components/quacky-ui/character-counter";
import { PostAttachment } from "@/types";

import config from "@/config.json";

const MAX_ATTACHMENTS_PER_POST = 3;

const formatSize = (size: number) => {
    if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    if (size >= 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${size} B`;
};

interface CreatePostResult {
    success: boolean;
    post?: {
        id: string;
    };
}

interface ComposeProps {
    onPost?: (result: CreatePostResult) => void;
}

export default function Compose({
    onPost,
}: ComposeProps) {

    const [content, setContent] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [attachments, setAttachments] = useState<PostAttachment[]>([]);

    const { data: session } = authClient.useSession();

    const handleAttachmentChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (attachments.length >= MAX_ATTACHMENTS_PER_POST) {
            alert(`You can only attach up to ${MAX_ATTACHMENTS_PER_POST} files.`);
            e.target.value = "";
            return;
        }

        const remainingSlots = MAX_ATTACHMENTS_PER_POST - attachments.length;
        const selected = Array.from(files).slice(0, remainingSlots);

        if (files.length > remainingSlots) {
            alert(`Only the first ${remainingSlots} file(s) were added. Max ${MAX_ATTACHMENTS_PER_POST} per post.`);
        }

        setIsUploading(true);

        try {
            const uploaded: PostAttachment[] = [];

            for (const file of selected) {
                const fd = new FormData();
                fd.append("file", file);
                fd.append("existingCount", String(attachments.length + uploaded.length));

                const res = await fetch("/api/posts/upload", {
                    method: "POST",
                    body: fd,
                });

                const data = await res.json();

                if (!res.ok || !data?.attachment) {
                    alert(data?.error ?? `Failed to upload ${file.name}`);
                    continue;
                }

                uploaded.push(data.attachment as PostAttachment);
            }

            if (uploaded.length > 0) {
                setAttachments((prev) => [...prev, ...uploaded]);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to upload one or more attachments");
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    };

    const removeAttachment = (indexToRemove: number) => {
        setAttachments((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async () => {
        const trimmed = content.trim();
        if (!trimmed && attachments.length === 0) return;
        if (trimmed.length > config.posting.maxLength) {
            alert(`Post exceeds ${config.posting.maxLength} characters`);
            return;
        }

        setIsPosting(true);
        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: trimmed,
                    attachments,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data?.error ?? "Failed to post");
                return;
            }

            setContent("");
            setAttachments([]);
            onPost?.(data.result);
        } catch (err) {
            console.error(err);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="rounded-xl bg-[var(--lynt)] border border-border p-4 w-full">
            <div className="flex gap-4">

                <Avatar className="w-12 h-12 shrink-0">
                    <AvatarImage
                        src={session?.user.image || ""}
                        alt={
                            session?.user.name
                        }
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {session?.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 flex flex-col">

                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="What's happening?"
                        className="w-full bg-transparent text-primary placeholder:text-muted-foreground resize-none outline-none text-lg font-medium min-h-[60px] py-1"
                        rows={isFocused || content ? 3 : 2}
                    />

                    {attachments.length > 0 && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {attachments.map((attachment, index) => (
                                <div key={`${attachment.key}-${index}`} className="rounded-lg border border-border p-2 bg-background/60">
                                    {attachment.kind === "image" && (
                                        <img
                                            src={attachment.url}
                                            alt={attachment.name}
                                            className="w-full h-40 object-cover rounded-md"
                                        />
                                    )}

                                    {attachment.kind === "video" && (
                                        <video
                                            src={attachment.url}
                                            controls
                                            className="w-full h-40 object-cover rounded-md"
                                        />
                                    )}

                                    {attachment.kind === "file" && (
                                        <div className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
                                            <div className="font-semibold text-primary truncate">{attachment.name}</div>
                                            <div>{formatSize(attachment.size)}</div>
                                        </div>
                                    )}

                                    <div className="mt-2 flex items-center justify-between gap-2">
                                        <div className="text-xs text-muted-foreground truncate">{attachment.name}</div>
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(index)}
                                            className="text-xs font-semibold px-2 py-1 rounded-md border border-border hover:bg-accent cursor-pointer"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-end pt-3 mt-2">
                        <div className="flex items-center gap-2">

                            <label className="px-3 py-2 rounded-full border border-border hover:bg-accent cursor-pointer text-sm font-semibold">
                                {isUploading ? "Uploading..." : `Attach (${attachments.length}/${MAX_ATTACHMENTS_PER_POST})`}
                                <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleAttachmentChange}
                                    disabled={isUploading || attachments.length >= MAX_ATTACHMENTS_PER_POST}
                                />
                            </label>

                            <CharacterCounter
                                length={content.length}
                            />

                            <button
                                onClick={handleSubmit}
                                disabled={(content.trim().length === 0 && attachments.length === 0) || content.length > config.posting.maxLength || isPosting || isUploading}
                                className="px-6 py-2 rounded-full bg-primary hover:bg-primary/90 text-background text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isPosting ? "Posting..." : "Post"}
                            </button>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
