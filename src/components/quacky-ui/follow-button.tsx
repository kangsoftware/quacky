"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/client/auth";
import { Button } from "@/components/ui/button";

interface Props {
    targetUserHandle: string;
}

export default function FollowButton({ targetUserHandle }: Props) {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const [following, setFollowing] = useState(false);
    const [loading, setLoading] = useState(false);

    const viewerId = session?.user?.id;
    const viewerHandle = session?.user?.handle;
    const isOwnProfile = viewerHandle === targetUserHandle;

    useEffect(() => {
        if (!viewerId || isOwnProfile) {
            setFollowing(false);
            return;
        }

        let cancelled = false;

        const loadFollowStatus = async () => {
            try {
                const response = await fetch(`/api/users/${targetUserHandle}/follow`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    if (!cancelled) {
                        setFollowing(false);
                    }
                    return;
                }

                const data = await response.json();

                if (!cancelled) {
                    setFollowing(Boolean(data?.following));
                }
            } catch (error: unknown) {
                if (!cancelled) {
                    setFollowing(false);
                }
                console.error(error);
            }
        };

        loadFollowStatus();

        return () => {
            cancelled = true;
        };
    }, [targetUserHandle, viewerId, isOwnProfile]);

    const handleToggle = async () => {
        if (!viewerId || isOwnProfile || loading) {
            return;
        }

        const nextFollowing = !following;

        setLoading(true);
        setFollowing(nextFollowing);

        try {
            const endpoint = nextFollowing
                ? `/api/users/${targetUserHandle}/follow`
                : `/api/users/${targetUserHandle}/unfollow`;

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                setFollowing(!nextFollowing);
                return;
            }

            router.refresh();
        } catch (error: unknown) {
            setFollowing(!nextFollowing);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (isPending || !viewerId || isOwnProfile) {
        return null;
    }

    return (
        <Button
            onClick={handleToggle}
            disabled={loading}
            variant={following ? "outline" : "default"}
            className="rounded-lg font-bold cursor-pointer"
        >
            {following ? "Following" : "Follow"}
        </Button>
    );
}
