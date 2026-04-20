import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";
import { ThemeProvider } from "@/lib/theme-context";

export const metadata: Metadata = {
  title: "InterviewPro - AI-Powered Interview Mastery",
  description:
    "Practice job interviews with AI interviewers that adapt to your skill level. Get real-time feedback, personalized hints, and comprehensive analytics to ace your next job interview. Practice Like You Mean It.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <ThemeProvider>
            <div className="animated-bg" />
            {children}
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
