import type { Metadata } from "next"
import { FeedbackPanel } from "@/components/feedback-panel"

export const metadata: Metadata = {
  title: "Comentarios",
  robots: {
    index: false,
    follow: false,
  },
}

export default function FeedbackPage() {
  return <FeedbackPanel />
}
