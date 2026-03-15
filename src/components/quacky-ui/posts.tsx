// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

// Libs
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, format, differenceInDays } from "date-fns";

import { authClient } from "@/client/auth";
import { ClientPostUtils } from "@/lib/utils";

// UI Components
import { Heart, MessageCircle, Repeat, Share2, BadgeCheck, MoreHorizontal, Pin, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Types
import { Post, PostAttachment } from "@/types";
interface PostsProps {
    posts: Post[];
}

type ReportType = "hate" | "sexual" | "violence" | "self_harm" | "privacy" | "impersonation" | "spam" | "misinformation" | "illegal" | "other" | "";

const formatSize = (size: number) => {
    if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    if (size >= 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${size} B`;
};

export default function Posts({ posts }: PostsProps) {
    const { data: session } = authClient.useSession();

    // Like
    const [likePending, setLikePending] = useState<Record<string, boolean>>({});
    const [likedOverrides, setLikedOverrides] = useState<Record<string, boolean>>({});
    const [likeCountOverrides, setLikeCountOverrides] = useState<Record<string, number>>({});
    const [repostPending, setRepostPending] = useState<Record<string, boolean>>({});
    const [repostedOverrides, setRepostedOverrides] = useState<Record<string, boolean>>({});
    const [repostCountOverrides, setRepostCountOverrides] = useState<Record<string, number>>({});

    // Report
    const [reportOpen, setReportOpen] = useState(false);
    const [reportingPost, setReportingPost] = useState<Post | null>(null);
    const [reportReason, setReportReason] = useState("");
    const [reportPending, setReportPending] = useState(false);
    const [reportType, setReportType] = useState<ReportType>("");
    const [reportSuccess, setReportSuccess] = useState(false);

    useEffect(() => {
        setLikedOverrides({});
        setLikeCountOverrides({});
        setLikePending({});
        setRepostedOverrides({});
        setRepostCountOverrides({});
        setRepostPending({});
    }, [posts]);


    const getViewerId = () => session?.user?.id;

    const getBaseLiked = (post: Post) => {
        if (typeof post?.hasLiked === "boolean") return post.hasLiked;
        const viewerId = getViewerId();
        if (!viewerId) return false;
        const likes = Array.isArray(post?.likes) ? post.likes : [];
        return likes.some((like) => like?.userId === viewerId || like?.user?.id === viewerId);
    };

    const getLikeCount = (post: Post) => {
        if (typeof likeCountOverrides[post.id] === "number") return likeCountOverrides[post.id];
        if (Array.isArray(post?.likes)) return post.likes.length;
        if (typeof post?.likes === "number") return post.likes;
        return 0;
    };

    const getBaseReposted = (post: Post) => {
        if (typeof post?.hasReposted === "boolean") return post.hasReposted;
        const viewerId = getViewerId();
        if (!viewerId) return false;
        const retweets = Array.isArray(post?.retweets) ? post.retweets : [];
        return retweets.some((retweet) => retweet?.userId === viewerId || retweet?.user?.id === viewerId);
    };

    const getRepostCount = (post: Post) => {
        if (typeof repostCountOverrides[post.id] === "number") return repostCountOverrides[post.id];
        if (Array.isArray(post?.retweets)) return post.retweets.length;
        if (typeof post?.reposts === "number") return post.reposts;
        return 0;
    };

    const isLiked = (post: Post) => (typeof likedOverrides[post.id] === "boolean" ? likedOverrides[post.id] : getBaseLiked(post));
    const isReposted = (post: Post) => (typeof repostedOverrides[post.id] === "boolean" ? repostedOverrides[post.id] : getBaseReposted(post));

    const hasCommented = (post: Post) => {
        if (typeof post?.hasReplied === "boolean") return post.hasReplied;
        const viewerId = getViewerId();
        if (!viewerId) return false;
        const replies = Array.isArray(post?.replies) ? post.replies : [];
        return replies.some((reply) => reply?.authorId === viewerId || reply?.author?.id === viewerId || reply?.userId === viewerId);
    };

    const handleLikeToggle = async (post: Post) => {
        if (likePending[post.id]) {
            return;
        }

        const currentLiked = isLiked(post);
        const currentCount = getLikeCount(post);
        const nextLiked = !currentLiked;
        const nextCount = Math.max(0, currentCount + (nextLiked ? 1 : -1));
        const url = nextLiked ? "/api/posts/like" : "/api/posts/unlike";

        setLikePending((prev) => ({ ...prev, [post.id]: true }));
        setLikedOverrides((prev) => ({ ...prev, [post.id]: nextLiked }));
        setLikeCountOverrides((prev) => ({ ...prev, [post.id]: nextCount }));

        try {
            await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId: post.id }),
            });

        } catch (err: unknown) {
            console.error(err)

        } finally {
            setLikePending((prev) => ({ ...prev, [post.id]: false }));
        }
    };

    const handleRepostToggle = async (post: Post) => {
        if (post.author?.id === getViewerId()) {
            return;
        }

        if (repostPending[post.id]) {
            return;
        }

        const currentReposted = isReposted(post);
        const currentCount = getRepostCount(post);
        const nextReposted = !currentReposted;
        const nextCount = Math.max(0, currentCount + (nextReposted ? 1 : -1));
        const url = nextReposted ? "/api/posts/repost" : "/api/posts/unrepost";

        setRepostPending((prev) => ({ ...prev, [post.id]: true }));
        setRepostedOverrides((prev) => ({ ...prev, [post.id]: nextReposted }));
        setRepostCountOverrides((prev) => ({ ...prev, [post.id]: nextCount }));

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId: post.id }),
            });

            if (!response.ok) {
                setRepostedOverrides((prev) => ({ ...prev, [post.id]: currentReposted }));
                setRepostCountOverrides((prev) => ({ ...prev, [post.id]: currentCount }));
            }

        } catch (err: unknown) {
            console.error(err)
            setRepostedOverrides((prev) => ({ ...prev, [post.id]: currentReposted }));
            setRepostCountOverrides((prev) => ({ ...prev, [post.id]: currentCount }));

        } finally {
            setRepostPending((prev) => ({ ...prev, [post.id]: false }));
        }
    };

    const openReportFor = (post: Post) => {
        setReportingPost(post);
        setReportReason("");
        setReportOpen(true);
    };

    const submitReport = async () => {
        if (!reportingPost) {
            return;
        }

        setReportPending(true);

        try {
            await fetch("/api/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contentId: reportingPost.id,
                    contentType: "post",
                    contentAuthorId: reportingPost.author?.id,
                    contentAuthorHandle: reportingPost.author?.handle,
                    reasonType: reportType,
                    reasonDetail: reportReason,
                }),
            });

            setReportSuccess(true);
        } catch (err: unknown) {
            console.log(err)
        } finally {
            setReportPending(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 max-w-2xl w-full">

            {posts.length === 0 ? (
                <div className="p-6 w-full flex items-center justify-center">
                    <div className="flex flex-col items-center text-center">
                        <h3 className="text-lg font-semibold text-primary">No posts to show</h3>
                        <p className="text-sm text-muted-foreground mt-1">In the meantime, here is a picture of a bird.</p>

                        <img
                            src="/assets/quackythebird/flying_nobg.png"
                            alt="No posts"
                            className="w-48 h-48 object-contain mx-auto mt-3"
                        />
                    </div>

                </div>
            ) : posts.map((post: Post) => {

                const timestamp = post.createdAt
                    ? (differenceInDays(new Date(), new Date(post.createdAt)) > 7
                        ? format(new Date(post.createdAt), 'MMM d, yyyy')
                        : formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }))
                    : "just now";

                const replyCount = Array.isArray(post.replies) ? post.replies.length : Number(post.replies ?? 0);
                const repostCount = getRepostCount(post);
                const likeCount = getLikeCount(post);
                const liked = isLiked(post);
                const reposted = isReposted(post);
                const isOwnPost = post.author?.id === getViewerId();
                const commented = hasCommented(post);
                const attachments = Array.isArray(post.attachments) ? post.attachments as PostAttachment[] : [];

                return (
                    <div
                        key={post.repostEventId ?? post.id}
                        className="rounded-xl bg-[var(--lynt)] dark:bg-[var(--lynt)] border border-border p-4 flex flex-col gap-2"
                    >
                        {post.repostedBy && (
                            <div className="flex items-center gap-2 mb-1 text-muted-foreground text-sm">
                                <Repeat size={15} className="text-primary" />
                                <span>
                                    <Link href={`/${post.repostedBy.handle}`} className="font-bold text-primary hover:underline">
                                        {post.repostedBy.name}
                                    </Link>{" "}
                                    reposted
                                </span>
                            </div>
                        )}

                        {post.pinned && (
                            <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm">
                                <Pin size={16} className="text-primary" fill="currentColor" />
                                <span className="font-bold">Pinned</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2 mb-2">

                            <Avatar className="w-7 h-7 shrink-0">
                                <AvatarImage
                                    src={post.author.image || ""}
                                    alt={
                                        post.author.name
                                    }
                                />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                    {(post.author?.name ?? "").charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <Link href={`/${post.author?.handle ?? ""}`} className="font-bold ml-0 text-primary hover:underline">
                                {post.author?.name ?? "Unknown"}
                            </Link>

                            {post.author.verified && (
                                <div className="p-0 -ml-1">
                                    <BadgeCheck
                                        className="text-primary"
                                        size={23}
                                        fill="currentColor"
                                        stroke="var(--lynt)"
                                    />
                                </div>
                            )}

                            <span className="text-muted-foreground text-sm -ml-1 font-bold">
                                @{post.author.handle} • {timestamp}
                            </span>

                            {post.readOnly ? (
                                <div className="ml-auto flex items-center gap-1 text-muted-foreground text-sm">
                                    <Lock size={16} className="text-muted-foreground" />
                                    <span className="font-bold">Read Only</span>
                                </div>
                            ) : (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            aria-label="Post actions"
                                            className="ml-auto inline-flex size-8 items-center justify-center rounded-full border border-transparent text-muted-foreground transition-all hover:border-primary/25 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
                                        >
                                            <MoreHorizontal size={20} className="cursor-pointer" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-52 rounded-xl border-border/70 bg-[var(--lynt)]/95 p-1.5 shadow-xl backdrop-blur-sm"
                                    >
                                        <DropdownMenuItem
                                            className="cursor-pointer gap-2 rounded-lg px-2.5 py-2 font-semibold text-foreground focus:bg-accent focus:text-accent-foreground [&_svg]:text-current"
                                            onClick={() => openReportFor(post)}
                                        >
                                            Report Abuse
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}

                        </div>

                        <div
                            onClick={() => window.location.href = `/post/${post.id}`}
                            className="flex flex-col gap-1 text-base rounded-md p-1 -m-1 hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            <span className="whitespace-pre-wrap">{ClientPostUtils.renderContent(post.content)}</span>
                        </div>

                        {attachments.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                                {attachments.map((attachment, index) => (
                                    <div key={`${attachment.key}-${index}`} className="rounded-lg border border-border p-2 bg-background/60">
                                        {attachment.kind === "image" && (
                                            <a
                                                href={attachment.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <img
                                                    src={attachment.url}
                                                    alt={attachment.name}
                                                    className="w-full h-48 object-cover rounded-md"
                                                />
                                            </a>
                                        )}

                                        {attachment.kind === "video" && (
                                            <video
                                                src={attachment.url}
                                                controls
                                                className="w-full h-48 object-cover rounded-md"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        )}

                                        {attachment.kind === "file" && (
                                            <div className="rounded-md border border-dashed border-border p-3">
                                                <a
                                                    href={attachment.url}
                                                    download={attachment.name}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-semibold text-primary hover:underline break-all"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {attachment.name}
                                                </a>
                                                <div className="text-xs text-muted-foreground mt-1">{formatSize(attachment.size)}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {!post.readOnly && (
                            <div className="flex justify-between pt-2">

                                <div className="flex gap-3">

                                    <Link
                                        href={`/post/${post.id}`}
                                        className={`group cursor-pointer flex items-center gap-1 px-2 py-1 rounded-lg border-2 transition-colors duration-200 ${commented
                                            ? "border-primary bg-primary text-background"
                                            : "border-primary bg-transparent hover:bg-primary"
                                            }`}
                                    >
                                        <MessageCircle
                                            size={18}
                                            strokeWidth={3}
                                            className={`${commented ? "text-background" : "text-primary group-hover:text-background"} transition-colors duration-200`}
                                        />
                                        <span className={`${commented ? "text-background" : "text-primary group-hover:text-background"} transition-colors duration-200`}>
                                            {replyCount}
                                        </span>
                                    </Link>

                                    {!isOwnPost && (
                                        <button
                                            onClick={() => handleRepostToggle(post)}
                                            disabled={Boolean(repostPending[post.id])}
                                            className={`group cursor-pointer flex items-center gap-1 px-2 py-1 rounded-lg border-2 transition-colors duration-200 ${reposted
                                                ? "border-primary bg-primary text-background"
                                                : "border-primary bg-transparent hover:bg-primary"
                                                } ${repostPending[post.id] ? "opacity-70 cursor-not-allowed" : ""}`}
                                            title="Repost"
                                        >
                                            <Repeat
                                                size={18}
                                                strokeWidth={3}
                                                className={`${reposted
                                                    ? "text-background"
                                                    : "text-primary group-hover:text-background"
                                                    } transition-colors duration-200`}
                                            />
                                            <span className={`${reposted ? "text-background" : "text-primary group-hover:text-background"} transition-colors duration-200`}>
                                                {repostCount}
                                            </span>
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleLikeToggle(post)}
                                        disabled={Boolean(likePending[post.id])}
                                        className={`group cursor-pointer flex items-center gap-1 px-2 py-1 rounded-lg border-2 transition-colors duration-200 ${liked
                                            ? "border-primary bg-primary text-background"
                                            : "border-primary bg-transparent hover:bg-primary"
                                            } ${likePending[post.id] ? "opacity-70 cursor-not-allowed" : ""}`}
                                    >
                                        <Heart
                                            size={18}
                                            strokeWidth={3}
                                            className={`${liked
                                                ? "text-background"
                                                : "text-primary group-hover:text-background"
                                                } transition-colors duration-200`}
                                        />
                                        <span className={`${liked ? "text-background" : "text-primary group-hover:text-background"} transition-colors duration-200`}>
                                            {likeCount}
                                        </span>
                                    </button>

                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                                        }}
                                        className="group cursor-pointer flex items-center gap-1 px-2 py-1 rounded-lg border-2 border-primary bg-transparent hover:bg-primary transition-colors duration-200"
                                    >
                                        <Share2
                                            size={18}
                                            strokeWidth={3}
                                            className="text-primary group-hover:text-background transition-colors duration-200"
                                        />
                                    </button>
                                </div>

                            </div>
                        )}
                    </div>
                )
            })}

            <Dialog open={reportOpen} onOpenChange={(open) => {
                if (!open) {
                    setReportingPost(null);
                }
                setReportOpen(open);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Report Content</DialogTitle>
                        <DialogDescription>
                            Tell us why you&apos;re reporting this post. Our moderation team will review it.
                        </DialogDescription>
                    </DialogHeader>

                    {!reportSuccess ? (
                        <>
                            <div className="mt-2">
                                <p className="text-sm text-muted-foreground">Choose a reason</p>
                                <RadioGroup value={reportType} onValueChange={(v) => setReportType(v as ReportType)} className="mt-2">
                                    <div className="grid gap-2">
                                        <label className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer`}>
                                            <RadioGroupItem value="hate" className="mt-1" />
                                            <div>
                                                <div className="font-semibold">Hate speech or harassment</div>
                                                <div className="text-sm text-muted-foreground">Attacks or threats against a protected group or individual.</div>
                                            </div>
                                        </label>

                                        <label className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer`}>
                                            <RadioGroupItem value="self_harm" className="mt-1" />
                                            <div>
                                                <div className="font-semibold">Self-harm or suicide</div>
                                                <div className="text-sm text-muted-foreground">Content encouraging self-harm or suicide.</div>
                                            </div>
                                        </label>

                                        <label className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer`}>
                                            <RadioGroupItem value="spam" className="mt-1" />
                                            <div>
                                                <div className="font-semibold">Spam</div>
                                                <div className="text-sm text-muted-foreground">Unsolicited promotions or fraudulent links.</div>
                                            </div>
                                        </label>

                                        <label className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer`}>
                                            <RadioGroupItem value="illegal" className="mt-1" />
                                            <div>
                                                <div className="font-semibold">Illegal activity</div>
                                                <div className="text-sm text-muted-foreground">Content facilitating or promoting illegal acts.</div>
                                            </div>
                                        </label>

                                        <label className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer`}>
                                            <RadioGroupItem value="other" className="mt-1" />
                                            <div>
                                                <div className="font-semibold">Other</div>
                                                <div className="text-sm text-muted-foreground">Something else not listed here.</div>
                                            </div>
                                        </label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="mt-4">
                                <Textarea
                                    placeholder="Additional details (optional)"
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                />
                            </div>

                            <DialogFooter className="mt-4">
                                <Button variant="ghost" onClick={() => { setReportOpen(false); setReportType(""); setReportReason(""); setReportSuccess(false); }}>Cancel</Button>
                                <Button onClick={submitReport} disabled={reportPending}>
                                    {reportPending ? "Reporting..." : "Submit Report"}
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <div className="py-6 text-center">
                            <div className="flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="size-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                                    <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold">Report filed</h3>
                            <p className="text-sm text-muted-foreground mt-2">Thanks for reporting! Our moderation team will review the violation and get back to you.</p>
                            <div className="mt-4">
                                <Button onClick={() => { setReportOpen(false); setReportSuccess(false); setReportType(""); setReportReason(""); }}>Close</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}
