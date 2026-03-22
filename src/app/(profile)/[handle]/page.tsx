// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

import { notFound } from "next/navigation";
import { format } from "date-fns";

import { AlertTriangle, BadgeCheck, CalendarClock, Lock, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import RightSidebar from "@/components/quacky-ui/discover";
import Sidebar from "@/components/quacky-ui/sidebar";
import Posts from "@/components/quacky-ui/posts";
import FollowButton from "@/components/quacky-ui/follow-button";

import { Users, Posts as Post } from "@/quacky"

interface Params {
    params: Promise<{
        handle: string;
    }>;
}

export default async function ProfilePage({ params }: Params) {
    const { handle } = await params;

    const result = await Users.getUserbyHandle(handle);
    const user = result.user;

    if (!user) {
        notFound();
    }

    const followStats = {
        followers: result.followers ?? 0,
        following: result.following ?? 0,
    };

    if (user.banned) {
        return (
            <main className="min-h-screen w-full flex justify-center bg-background dark:bg-background">
                <div className="flex w-full max-w-[1200px] gap-4 px-4">
                    <Sidebar />
                    <div className="flex-1 flex flex-col gap-4 pt-8 max-w-2xl">
                        <div className="rounded-xl border border-border bg-[var(--lynt)] p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <Avatar className="size-20 border-4 border-[var(--lynt)] flex-shrink-0">
                                    <AvatarImage src={user.image} alt={`${user.handle} avatar`} />
                                    <AvatarFallback className="bg-primary text-background text-xl font-bold">
                                        {user.name ? user.name.charAt(0).toUpperCase() : user.handle?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h1 className="text-2xl font-bold text-primary">{user.name}</h1>
                                    </div>
                                    {user.handle && (
                                        <p className="text-muted-foreground font-bold text-sm mb-3">
                                            @{user.handle}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {user.banned && (
                                <div className="rounded-xl mt-5 bg-[var(--lynt)] border border-white/40 p-4">
                                    <div className="flex gap-3 items-start">
                                        <AlertTriangle size={20} className="text-white mt-0.5" strokeWidth={2.5} />
                                        <div className="flex flex-col gap-1">
                                            <h3 className="font-bold text-white">Account Banned</h3>
                                            <p className="text-sm text-muted-foreground">
                                                This account has been banned.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <RightSidebar />
                </div>
            </main>
        )
    }

    if (user.privateAccount) {
        return (
            <main className="min-h-screen w-full flex justify-center bg-background dark:bg-background">
                <div className="flex w-full max-w-[1200px] gap-4 px-4">
                    <Sidebar />
                    <div className="flex-1 flex flex-col gap-4 pt-8 max-w-2xl">
                        <div className="rounded-xl border border-border bg-[var(--lynt)] p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <Avatar className="size-20 border-4 border-[var(--lynt)] flex-shrink-0">
                                    <AvatarImage src={user.image} alt={`${user.handle} avatar`} />
                                    <AvatarFallback className="bg-primary text-background text-xl font-bold">
                                        {user.name ? user.name.charAt(0).toUpperCase() : user.handle?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h1 className="text-2xl font-bold text-primary">{user.name}</h1>
                                        {user.verified && (
                                            <BadgeCheck
                                                className="text-primary flex-shrink-0"
                                                size={20}
                                                fill="currentColor"
                                                stroke="var(--lynt)"
                                            />
                                        )}
                                    </div>
                                    {user.handle && (
                                        <p className="text-muted-foreground font-bold text-sm mb-3">
                                            @{user.handle}
                                        </p>
                                    )}
                                    {/* <div className="flex gap-3">
                                        <FollowButton targetUserId={user.id} />
                                        <Button variant="outline" className="rounded-lg font-bold cursor-pointer">Message</Button>
                                    </div> */}
                                </div>
                            </div>
                            <div className="flex gap-6 text-sm mb-4">
                                <div className="text-center">
                                    <div className="font-bold text-primary">{followStats.following}</div>
                                    <div className="text-muted-foreground">Following</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-primary">{followStats.followers}</div>
                                    <div className="text-muted-foreground">Followers</div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm font-bold text-muted-foreground">
                                {user.createdAt && (
                                    <span className="flex items-center gap-1.5">
                                        <CalendarClock size={16} strokeWidth={2.5} />
                                        Joined {format(new Date(user.createdAt), "MMMM yyyy")}
                                    </span>
                                )}
                                {user.role == "Admin" && (
                                    <span className="flex items-center gap-1.5">
                                        <Shield size={16} fill="currentColor" strokeWidth={2.5} />
                                        Admin
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="rounded-xl border border-border p-6 text-center">
                            <h2 className="text-xl font-bold text-primary mb-2">Private Account</h2>
                            <p className="text-muted-foreground">This user account is private</p>
                        </div>
                    </div>
                    <RightSidebar />
                </div>
            </main>
        );
    }

    const postsResult = await Post.getByUserId(user.id);
    const userPosts = postsResult.posts || [];

    return (
        <main className="min-h-screen w-full flex justify-center bg-background dark:bg-background">
            <div className="flex w-full max-w-[1200px] gap-4 px-4">
                <Sidebar />

                <div className="flex-1 flex flex-col gap-4 pt-8 max-w-2xl">


                    <div className="rounded-xl border border-border bg-[var(--lynt)] p-6">
                        <div className="flex items-start gap-4 mb-6">
                            <Avatar className="size-20 border-4 border-[var(--lynt)] flex-shrink-0">
                                <AvatarImage src={user.image} alt={`${user.handle} avatar`} />
                                <AvatarFallback className="bg-primary text-background text-xl font-bold">
                                    {user.name ? user.name.charAt(0).toUpperCase() : user.handle?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h1 className="text-2xl font-bold text-primary">{user.name}</h1>
                                    {user.verified && (
                                        <BadgeCheck
                                            className="text-primary flex-shrink-0"
                                            size={20}
                                            fill="currentColor"
                                            stroke="var(--lynt)"
                                        />
                                    )}
                                </div>

                                {user.handle && (
                                    <p className="text-muted-foreground font-bold text-sm mb-3">
                                        @{user.handle}
                                    </p>
                                )}

                                <div className="flex gap-3">
                                    <FollowButton targetUserId={user.id} />
                                    {/* <Button variant="outline" className="rounded-lg font-bold cursor-pointer">Message</Button> */}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-6 text-sm mb-4">
                            <div className="text-center">
                                <div className="font-bold text-primary">{followStats.following}</div>
                                <div className="text-muted-foreground">Following</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-primary">{followStats.followers}</div>
                                <div className="text-muted-foreground">Followers</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-primary">{userPosts.length}</div>
                                <div className="text-muted-foreground">Posts</div>
                            </div>
                        </div>

                        {user.bio && (
                            <p className="text-base text-primary leading-relaxed mb-4 whitespace-pre-line">
                                {user.bio}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm font-bold text-muted-foreground">
                            {user.createdAt && (
                                <span className="flex items-center gap-1.5">
                                    <CalendarClock size={16} strokeWidth={2.5} />
                                    Joined {format(new Date(user.createdAt), "MMMM yyyy")}
                                </span>
                            )}
                            {user.role == "Admin" && (
                                <span className="flex items-center gap-1.5">
                                    <Shield size={16} fill="currentColor" strokeWidth={2.5} />
                                    Admin
                                </span>
                            )}
                        </div>

                    </div>
                    {userPosts.length > 0 ? (
                        <Posts posts={userPosts} />
                    ) : (
                        <div className="rounded-xl border border-border p-6 text-center">
                            <h2 className="text-xl font-bold text-primary mb-2">No Posts Yet</h2>
                            <p className="text-muted-foreground">This user hasn't posted anything yet.</p>
                        </div>
                    )}
                </div>

                <RightSidebar />
            </div>
        </main>
    );
}
