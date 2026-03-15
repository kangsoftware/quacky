"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Moon, Palette, Shield, Sun, UserCog, UserX } from "lucide-react";

import { authClient } from "@/client/auth";

type SettingsMenuProps = {
    displayName: string;
    handle: string;
    email?: string | null;
    bio?: string | null;
    privateAccount?: boolean;
    emailNotif?: boolean;
    image?: string | null;
};

export default function SettingsMenu({ displayName, handle, email, bio, privateAccount: initialPrivateAccount, emailNotif: initialEmailNotif, image: initialImage }: SettingsMenuProps) {
    const [nameValue, setNameValue] = useState(displayName || "");
    const [handleValue, setHandleValue] = useState(handle || "");
    const [bioValue, setBioValue] = useState(bio || "");
    const [emailValue] = useState(email || "");
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initialImage || undefined);
    const fileRef = useRef<HTMLInputElement | null>(null);

    const session = authClient.getSession();

    useEffect(() => {
        setAvatarUrl(initialImage || undefined);
    }, [initialImage]);

    const [emailNotifications, setEmailNotifications] = useState(!!initialEmailNotif);
    const [privateAccount, setPrivateAccount] = useState(!!initialPrivateAccount);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const root = document.documentElement;
        const storedTheme = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const shouldUseDark = storedTheme ? storedTheme === "dark" : prefersDark;

        root.classList.toggle("dark", shouldUseDark);
        setIsDarkMode(shouldUseDark);
    }, []);

    const handleThemeChange = (checked: boolean) => {
        const root = document.documentElement;
        setIsDarkMode(checked);
        root.classList.toggle("dark", checked);
        localStorage.setItem("theme", checked ? "dark" : "light");
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const payload = {
                name: nameValue,
                handle: handleValue,
                bio: bioValue,
                email: emailValue,
                privateAccount,
                emailNotif: emailNotifications,
            };

            const res = await fetch("/api/account", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data?.error || "Failed to save account");
                return;
            }

            alert(data?.message || "Saved");
        } catch (err) {
            console.error(err);
            alert("Failed to save account");
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const fd = new FormData();
            fd.append("avatar", file);

            const res = await fetch("/api/account/avatar", { method: "POST", body: fd });
            const data = await res.json();

            if (!res.ok) {
                alert(data?.error || "Failed to upload avatar");
                return;
            }

            setAvatarUrl(data.url);
            alert("Avatar uploaded");
        } catch (err) {
            console.error(err);
            alert("Failed to upload avatar");
        }
    };

    return (
        <section className="w-full rounded-xl bg-white/80 dark:bg-[var(--lynt)] border border-black/10 dark:border-border p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-extrabold text-primary">Account Settings</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Tune your profile, privacy, and notifications.
                    </p>
                </div>
                <Button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary hover:bg-primary/90 text-background font-bold cursor-pointer"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <div className="space-y-6 mt-6">
                <div className="rounded-lg border border-black/10 dark:border-border bg-white dark:bg-background/30 p-4 space-y-4">
                    <div className="flex items-center gap-2">
                        <Palette size={18} className="text-primary" />
                        <h2 className="text-lg font-bold text-primary">Appearance</h2>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="font-semibold text-primary">Website Theme</p>
                            <p className="text-sm text-muted-foreground">
                                Switch between light and dark mode.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sun size={16} className={isDarkMode ? "text-muted-foreground" : "text-primary"} />
                            <Switch checked={isDarkMode} onCheckedChange={handleThemeChange} />
                            <Moon size={16} className={isDarkMode ? "text-primary" : "text-muted-foreground"} />
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-black/10 dark:border-border bg-white dark:bg-background/30 p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <UserCog size={18} className="text-primary" />
                        <h2 className="text-lg font-bold text-primary">Profile</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar>
                                {avatarUrl ? (
                                    <AvatarImage src={avatarUrl} alt="avatar" />
                                ) : (
                                    <AvatarFallback>{(nameValue || handleValue || "U").charAt(0).toUpperCase()}</AvatarFallback>
                                )}
                            </Avatar>

                            <div>
                                <input ref={fileRef} id="avatar-file" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                <Button type="button" onClick={() => fileRef.current?.click()} className="font-bold cursor-pointer">Change avatar</Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="display-name">Display Name</Label>
                            <Input
                                id="display-name"
                                value={nameValue}
                                onChange={(e) => setNameValue(e.target.value)}
                                placeholder="Your display name"
                                className="bg-background dark:bg-[var(--lynt)]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                value={bioValue}
                                onChange={(e) => setBioValue(e.target.value)}
                                placeholder="Tell us about yourself"
                                className="bg-background dark:bg-[var(--lynt)] resize-none min-h-24"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="handle">Handle</Label>

                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    @
                                </span>

                                <Input
                                    id="handle"
                                    value={handleValue}
                                    onChange={(e) => setHandleValue(e.target.value.replace(/^@+/, ""))}
                                    placeholder="your-handle"
                                    className="pl-7 bg-background dark:bg-[var(--lynt)]"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={emailValue}
                                placeholder="name@example.com"
                                className="bg-background dark:bg-[var(--lynt)]"
                                disabled
                            />
                            <p className="text-sm text-muted-foreground">
                                To change your email, contact an admin.
                            </p>
                        </div>

                    </div>
                </div>

                <div className="rounded-lg border border-black/10 dark:border-border bg-white dark:bg-background/30 p-4 space-y-4">
                    <div className="flex items-center gap-2">
                        <Bell size={18} className="text-primary" />
                        <h2 className="text-lg font-bold text-primary">Notifications</h2>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="font-semibold text-primary">Email Notifications</p>
                            <p className="text-sm text-muted-foreground">Receive digest and account alerts by email.</p>
                        </div>
                        <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                    </div>
                </div>

                <div className="rounded-lg border border-black/10 dark:border-border bg-white dark:bg-background/30 p-4 space-y-4">
                    <div className="flex items-center gap-2">
                        <Shield size={18} className="text-primary" />
                        <h2 className="text-lg font-bold text-primary">Privacy</h2>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="font-semibold text-primary">Private Account</p>
                            <p className="text-sm text-muted-foreground">Only your followers can see your posts.</p>
                        </div>
                        <Switch checked={privateAccount} onCheckedChange={setPrivateAccount} />
                    </div>




                </div>


                <div className="rounded-lg border border-black/10 dark:border-border bg-white dark:bg-background/30 p-4 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="font-semibold text-primary">Sign out</p>
                            <p className="text-sm text-muted-foreground">Sign out of your account on this device.</p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="font-bold cursor-pointer">Sign out</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white dark:bg-[var(--lynt)] border-black/10 dark:border-border">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-primary">Sign out</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to sign out?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={async () => await authClient.signOut()} variant="destructive" className="font-bold cursor-pointer">Sign out</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="font-semibold text-primary">Delete Account</p>
                            <p className="text-sm text-muted-foreground">Permanently remove your account and all associated data.</p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="font-bold cursor-pointer">Delete Account</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white dark:bg-[var(--lynt)] border-black/10 dark:border-border">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-primary">Delete Account</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        To delete your account, please contact an admin.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogAction className="font-bold cursor-pointer">Close</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>
        </section>
    );
}
