"use client";

import { TrendingUp, Users, BadgeCheck, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

import { NewsItem, TrendingTopic, UserToFollow } from "@/types";

export default function RightSidebar() {
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
    const usersToFollow: UserToFollow[] = []

    

    const emptyMessage = "Nothing to show right now."

    useEffect(() => {
        // Fetch latest news
        fetch("/api/latest-news")
            .then((res) => res.json())
            .then((data) => {
                if (data.news) {
                    const formattedNews = data.news.map((item: any) => ({
                        id: item.id,
                        category: item.category,
                        title: item.title,
                        time: new Date(data.updated).toLocaleDateString(),
                        link: item.link,
                    }));
                    setNewsItems(formattedNews);
                }
            })
            .catch((error) => console.error("Error fetching news:", error));

        // Fetch what's happening
        fetch("/api/whats-happening")
            .then((res) => res.json())
            .then((data) => {
                if (data.topics) {
                    setTrendingTopics(data.topics);
                }
            })
            .catch((error) => console.error("Error fetching trending topics:", error));
    }, []);

    return (
        <aside className="sticky top-0 w-80 shrink-0 hidden lg:flex flex-col gap-4 pt-8 lg:h-screen overflow-y-auto pb-8">
            <div className="rounded-xl bg-[var(--lynt)] border border-border p-4">
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <TrendingUp size={24} strokeWidth={3} />
                    Latest News
                </h2>
                <div className="flex flex-col gap-3">
                    {newsItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                    ) : (
                        newsItems.map((item) => (
                            <a
                                key={item.id}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer block"
                            >
                                <p className="text-xs text-muted-foreground font-bold mb-1">
                                    {item.category}
                                </p>
                                <p className="text-sm font-bold text-primary mb-1">
                                    {item.title}
                                </p>
                                <p className="text-xs text-muted-foreground">{item.time}</p>
                            </a>
                        ))
                    )}
                </div>
            </div>

            <div className="rounded-xl bg-[var(--lynt)] border border-border p-4">
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <Flame size={24} strokeWidth={3} fill="currentColor" />
                    What's Happening
                </h2>
                <div className="flex flex-col gap-3">
                    {trendingTopics.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                    ) : (
                        trendingTopics.map((topic) => (
                            <a
                                key={topic.id}
                                href={topic.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer block"
                            >
                                <p className="text-xs text-muted-foreground font-bold mb-1">
                                    {topic.category} · Trending
                                </p>
                                <p className="text-sm font-bold text-primary mb-1">
                                    {topic.topic}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {topic.posts} posts
                                </p>
                            </a>
                        ))
                    )}
                </div>
            </div>

            {/* <div className="rounded-xl bg-[var(--lynt)] border border-border p-4">
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <Users size={24} strokeWidth={3} />
                    Who to Follow
                </h2>
                <div className="flex flex-col gap-3">
                    {usersToFollow.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                    ) : (
                        usersToFollow.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <img
                                        src={user.avatar}
                                        alt={`${user.name} avatar`}
                                        className="size-10 rounded-full object-cover"
                                    />
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-primary text-sm">
                                                {user.name}
                                            </span>
                                            {user.isVerified && (
                                                <BadgeCheck
                                                    size={16}
                                                    fill="currentColor"
                                                    stroke="var(--lynt)"
                                                    className="text-primary"
                                                />
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground font-bold">
                                            {user.handle}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    className="px-4 py-1 rounded-full bg-primary hover:bg-primary/90 text-background text-sm font-bold cursor-pointer"
                                >
                                    Follow
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div> */}
        </aside>
    );
}