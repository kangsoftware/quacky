// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

import { authClient } from "@/client/auth";

import Sidebar from "@/components/quacky-ui/sidebar";
import RightSidebar from "@/components/quacky-ui/discover";
import SettingsMenu from "@/components/quacky-ui/settings-menu";

export default function SettingsPage() {
  const { data: session, isPending } = authClient.useSession();
  const [account, setAccount] = useState<any | null>(null);
  const [loadingAccount, setLoadingAccount] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchAccount = async () => {
      setLoadingAccount(true);
      try {
        const res = await fetch("/api/account");
        if (!res.ok) {
          setAccount(null);
          return;
        }

        const data = await res.json();
        if (mounted) setAccount(data.user ?? null);
      } catch (err: any) {
        console.error(err.message);
        if (mounted) setAccount(null);
      } finally {
        if (mounted) setLoadingAccount(false);
      }
    };

    fetchAccount();
    return () => {
      mounted = false;
    };
  }, []);

  if (isPending || loadingAccount) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <h1 className="text-3xl font-semibold text-primary">Loading...</h1>
      </div>
    );
  }

  if (!session) {
    redirect("/signin");
  }

  const userSource = account || session.user;

  return (
    <main className="min-h-screen w-full flex justify-center bg-background dark:bg-background">
      <div className="flex w-full max-w-[1200px] gap-4 px-4 flex-col lg:flex-row">
        <Sidebar />
        <div className="flex-1 flex flex-col pt-8 w-full lg:max-w-2xl">
          <SettingsMenu
            displayName={userSource.name || ""}
            handle={userSource.handle || ""}
            email={userSource.email}
            privateAccount={!!userSource.privateAccount}
            emailNotif={!!userSource.emailNotif}
            bio={userSource.bio || ""}
            image={userSource.image}
          />
        </div>
        <RightSidebar />
      </div>
    </main>
  );
}
