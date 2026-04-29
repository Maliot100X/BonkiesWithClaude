import type { Metadata } from "next";
import { Roboto, Luckiest_Guy } from "next/font/google";
import { Providers } from "@/components/providers";
import { TelegramInit } from "@/components/TelegramInit";
import { FarcasterInit } from "@/components/FarcasterInit";
import "./globals.css";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

const luckiest = Luckiest_Guy({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bonkies-with-claude.vercel.app";

export const metadata: Metadata = {
  title: "BonkWithClaude",
  description: "Bonk your way to glory! Play on Farcaster, Telegram, and Base.",
  metadataBase: new URL(appUrl),
  openGraph: {
    title: "BonkWithClaude",
    description: "The ultimate bonking game on Farcaster, Telegram, and Base!",
    images: [`${appUrl}/og.png`],
    url: appUrl,
    siteName: "BonkWithClaude",
    type: "website",
  },
  other: {
    "fc:miniapp": JSON.stringify({
      version: "next",
      imageUrl: `${appUrl}/og.png`,
      button: {
        title: "Bonk!",
        action: {
          type: "launch_miniapp",
          name: "BonkWithClaude",
          url: `${appUrl}/game`,
          splashImageUrl: `${appUrl}/splash.png`,
          splashBackgroundColor: "#0A0F26",
        },
      },
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} ${luckiest.variable} h-full antialiased`}>
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js?62" />
        <link rel="preconnect" href="https://auth.farcaster.xyz" />
      </head>
      <body className="min-h-full flex flex-col font-[var(--font-roboto)]" style={{ fontFamily: "var(--font-roboto), sans-serif" }}>
        <Providers>
          <TelegramInit />
          <FarcasterInit />
          {children}
        </Providers>
      </body>
    </html>
  );
}
