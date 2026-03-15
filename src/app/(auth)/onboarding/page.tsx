// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FormData = {
    name: string;
    handle: string;
    email: string;
};

export default function Onboarding() {
    const [error, setError] = useState<string | null>(null);
    const [emailSentTo, setEmailSentTo] = useState<string | null>(null);

    const { register, handleSubmit, formState: { isSubmitting, errors }, reset } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        setError(null);
        setEmailSentTo(null);

        try {
            await fetch("/api/account/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            setEmailSentTo(data.email);
            reset();

        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative">
            <div className="w-full max-w-md px-4">
                <div className="backdrop-blur-md p-8">
                    <div className="text-center">
                        <img src="/assets/quackythebird/flying_nobg.png" alt="Quacky" className="w-36 h-36 object-contain mx-auto mb-4" />
                        <h1 className="text-3xl font-extrabold tracking-tight text-primary dark:text-primary-dark">Create your account</h1>
                        <p className="mt-2 text-sm text-muted-foreground">Sign up to join the Quacky community. It's free!</p>
                    </div>

                    {error && (
                        <div className="mt-6 w-full rounded bg-red-50 dark:bg-red-900/30 p-4 text-sm text-red-700 dark:text-red-300">
                            There was an issue: {error}
                        </div>
                    )}

                    {emailSentTo && (
                        <div className="mt-6 w-full rounded bg-green-50 dark:bg-green-900/30 p-4 text-sm text-green-700 dark:text-green-300">
                            Account created! Please sign in <a href="/signin" className="underline">here</a>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">Display name</label>
                            <Input
                                id="name"
                                placeholder="Jane Doe"
                                type="text"
                                autoCapitalize="none"
                                autoComplete="name"
                                autoCorrect="off"
                                className="mt-1 h-11 bg-white dark:bg-[var(--lynt)] border-zinc-200 dark:border-zinc-800"
                                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Your public display name.</p>
                            {errors.name && (
                                <p className="text-xs text-red-600 mt-1">{errors.name.message as string}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="handle" className="block text-sm font-medium text-muted-foreground">Handle</label>
                            <div className="relative mt-1">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sm text-muted-foreground">@</span>
                                <Input
                                    id="handle"
                                    placeholder="janedoe"
                                    type="text"
                                    autoCapitalize="none"
                                    autoComplete="username"
                                    autoCorrect="off"
                                    className="pl-8 h-11 bg-white dark:bg-[var(--lynt)] border-zinc-200 dark:border-zinc-800"
                                    aria-invalid={errors.handle ? "true" : "false"}
                                    {...register('handle', {
                                        required: 'Handle is required',
                                        minLength: { value: 3, message: 'Handle must be at least 3 characters' },
                                        pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Handle can only contain letters, numbers, and underscores' }
                                    })}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Your unique public username. Letters, numbers, and underscores only.</p>
                            {errors.handle && (
                                <p className="text-xs text-red-600 mt-1">{errors.handle.message as string}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Email address</label>
                            <Input
                                id="email"
                                placeholder="you@example.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                className="mt-1 h-11 bg-white dark:bg-[var(--lynt)] border-zinc-200 dark:border-zinc-800"
                                {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-600 mt-1">{errors.email.message as string}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-11"
                        >
                            {isSubmitting ? "Creating account..." : "Create account"}
                        </Button>
                    </form>

                    <p className="mt-6 text-xs text-center text-muted-foreground">
                        By continuing, you agree to our <a href="/terms" className="underline">Terms</a> and <a href="/privacy" className="underline">Privacy Policy</a>.
                    </p>

                    <p className="mt-4 text-xs text-muted-foreground text-center">
                            Already have an account?{" "}
                            <a href="/signin" className="underline">
                                Sign In
                            </a>
                        </p>
                </div>
            </div>
        </div>
    );
}
