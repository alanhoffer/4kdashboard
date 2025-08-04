import React from 'react'
import { cn } from "@/lib/utils";

export default function Logo(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* tu path aquí */}
      <path d="M12 2L2 22h20L12 2z" />
    </svg>
  )
}
