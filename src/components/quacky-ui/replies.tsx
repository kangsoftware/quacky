"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, format, differenceInDays } from "date-fns";
import { BadgeCheck, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ClientPostUtils } from "@/lib/utils";
import { authClient } from "@/client/auth";

interface Reply {
    id: string;
    content: string;
    createdAt: string | Date;
    author?: {
        id: string;
        name: string;
        handle: string;
        image?: string;
        verified?: boolean;
    };
}

interface RepliesProps {
    replies: Reply[];
}

type ReportType = "hate" | "sexual" | "violence" | "self_harm" | "privacy" | "impersonation" | "spam" | "misinformation" | "illegal" | "other" | "";

export default function Replies({ replies }: RepliesProps) {
    const { data: session } = authClient.useSession();

    const [reportOpen, setReportOpen] = useState(false);
    const [reportingReply, setReportingReply] = useState<Reply | null>(null);
    const [reportReason, setReportReason] = useState("");
    const [reportPending, setReportPending] = useState(false);
    const [reportType, setReportType] = useState<ReportType>("");
    const [reportSuccess, setReportSuccess] = useState(false);

    const openReportFor = (reply: Reply) => {
        setReportingReply(reply);
        setReportReason("");
        setReportOpen(true);
    };

    const submitReport = async () => {
        if (!reportingReply) {
            return;
        }

        setReportPending(true);

        try {
            await fetch("/api/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contentId: reportingReply.id,
                    contentType: "reply",
                    contentAuthorId: reportingReply.author?.id,
                    contentAuthorHandle: reportingReply.author?.handle,
                    reasonType: reportType,
                    reasonDetail: reportReason,
                }),
            });

            setReportSuccess(true);
        } catch (err: unknown) {
            console.log(err);
        } finally {
            setReportPending(false);
        }
    };
    if (!replies || replies.length === 0) {
        return (
            <div className="rounded-xl bg-[var(--lynt)] border border-border p-8 text-center">
                <p className="text-muted-foreground">No replies yet. Be the first to reply!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {replies.map((reply) => {
                const authorName = reply.author?.name || reply.author?.handle || "Unknown";
                const authorHandle = reply.author?.handle || "unknown";
                const authorAvatar = reply.author?.image || "";
                const isVerified = Boolean(reply.author?.verified);
                const timestamp = reply.createdAt
                    ? (differenceInDays(new Date(), new Date(reply.createdAt)) > 7
                        ? format(new Date(reply.createdAt), 'MMM d, yyyy')
                        : formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true }))
                    : "just now";

                return (
                    <div
                        key={reply.id}
                        className="rounded-xl bg-[var(--lynt)] dark:bg-[var(--lynt)] border border-border p-4 flex flex-col gap-2"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            {!authorAvatar ? (
                                <div className="size-7 rounded-full bg-primary text-background flex items-center justify-center text-xs font-bold select-none">
                                    {ClientPostUtils.getAvatarFallbackLetter(authorName)}
                                </div>
                            ) : (
                                <img
                                    src={authorAvatar}
                                    alt={`${authorName} avatar`}
                                    className="size-7 rounded-full object-cover"
                                />
                            )}
                            <Link href={`/${authorHandle}`} className="font-bold ml-0 text-primary hover:underline">
                                {authorName}
                            </Link>
                            {isVerified && (
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
                                @{authorHandle} • {timestamp}
                            </span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="ml-auto hover:text-primary rounded-full hover:bg-primary/10 transition-colors p-1">
                                        <MoreHorizontal size={20} className="cursor-pointer" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem
                                        className="cursor-pointer font-bold"
                                        onClick={() => openReportFor(reply)}
                                    >
                                        Report Abuse
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex flex-col gap-1 text-base rounded-md p-1 -m-1">
                            <span className="whitespace-pre-wrap">{ClientPostUtils.renderContent(reply.content)}</span>
                        </div>
                    </div>
                );
            })}

            <Dialog open={reportOpen} onOpenChange={(open) => {
                if (!open) {
                    setReportingReply(null);
                }
                setReportOpen(open);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Report Content</DialogTitle>
                        <DialogDescription>
                            Tell us why you&apos;re reporting this reply. Our moderation team will review it.
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
