import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import React, { ReactNode } from "react"
import { Post } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const getAvatarFallbackLetter = (author: string) => {
  const trimmed = author?.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
};

const renderContentWithLinks = (content: string): ReactNode => {
  if (!content || content.trim() === "") return content

  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = content.split(urlRegex).filter(part => part)

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return React.createElement(
        "a",
        {
          key: index,
          href: part,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "text-primary hover:text-primary/80 underline",
          onClick: (e: React.MouseEvent) => e.stopPropagation(),
        },
        part
      )
    }

    return part
  })
}

export class ClientPostUtils {
  static renderContent(content: string): ReactNode {
    return renderContentWithLinks(content);
  }

  static getAvatarFallbackLetter(author: string): string {
    return getAvatarFallbackLetter(author);
  }

}