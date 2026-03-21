// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { authClient } from "@/client/auth";

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [emailSentTo, setEmailSentTo] = useState<string | null>(null);
    const [appInfo, setAppInfo] = useState<{ version: string; build: string }>({ version: "dev", build: "dev build" });

    const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm<{ email: string }>();

    useEffect(() => {
        const fetchAppInfo = async () => {
            try {
                const response = await fetch("/api");

                if (!response.ok) {
                    return;
                }

                const data = await response.json();

                setAppInfo({ version: data.version, build: data.build });
            } catch { }
        };

        fetchAppInfo();
    }, []);

    const onSubmit = async (data: { email: string }) => {
        setError(null);
        setEmailSentTo(null);

        try {
            const result = await authClient.signIn.magicLink({
                email: data.email,
                callbackURL: `${window.location.origin}/`
            });

            if (result?.error) {
                setError('Is your email registered? Please sign up first at /onboarding.');
                return;
            }

            setEmailSentTo(data.email);
            reset();

        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative px-4 py-8 sm:py-0">
            <div className="w-full max-w-sm">
                <div className="backdrop-blur-md p-6 sm:p-8">
                    <div className="text-center">
                        <img src="/assets/quackythebird/sleeping.png" alt="Quacky" className="w-32 h-32 sm:w-40 sm:h-40 object-contain mx-auto mb-0" />
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary dark:text-primary-dark">Sign in to Quacky</h1>
                        <p className="mt-2 text-sm text-muted-foreground">Login to continue exploring Quacky</p>
                    </div>

                    <div className="space-y-4 mt-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">

                                {error && (
                                    <div className="mb-4 w-full rounded bg-red-100 p-4 text-sm text-red-700">
                                        There was an issue, please try again. {error}
                                    </div>
                                )}

                                {emailSentTo && (
                                    <div className="mb-4 w-full rounded bg-green-100 p-4 text-sm text-green-700">
                                        Check your email for a sign in link.
                                    </div>
                                )}

                                <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Email</label>
                                <Input
                                    id="email"
                                    placeholder="hello@example.com"
                                    type="email"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    required
                                    className="h-11 bg-white dark:bg-[var(--lynt)] border-zinc-200 dark:border-zinc-800"
                                    {...register('email', { required: true })}
                                />

                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-11 cursor-pointer"
                            >
                                {isSubmitting ? "Please wait..." : "Continue"}
                            </Button>

                            <p className="text-xs text-muted-foreground text-center">
                                By signing in, you agree to abide by our{" "}
                                <a href="/terms" className="underline">Terms</a> and{" "}
                                <a href="/privacy" className="underline">Privacy Policy</a>.
                            </p>

                            <p className="text-xs text-muted-foreground text-center">
                                Don't have an account?{" "}
                                <a href="/onboarding" className="underline">
                                    Sign up
                                </a>
                            </p>

                            <p className="mt-8 text-xs text-muted-foreground text-center">
                                {appInfo.version} ({appInfo.build})
                            </p>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
