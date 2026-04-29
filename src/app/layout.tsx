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
  title: "BonkiesWithClaude",
  description: "Spin the wheel, earn coins, climb the leaderboard! Play on Farcaster, Telegram, and Base.",
  metadataBase: new URL(appUrl),
  openGraph: {
    title: "BonkiesWithClaude",
    description: "The ultimate spin game on Farcaster, Telegram, and Base!",
    images: [`${appUrl}/og.png`],
    url: appUrl,
    siteName: "BonkiesWithClaude",
    type: "website",
  },
  other: {
    "base:app_id": "69f2587905020c0316bbbfdf",
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: `${appUrl}/og.png`,
      button: {
        title: "Play Now",
        action: {
          type: "launch_frame",
          name: "BonkiesWithClaude",
          url: `${appUrl}`,
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
        {/* Farcaster SDK + ready() call */}
        <script src="https://cdn.jsdelivr.net/npm/@farcaster/miniapp-sdk/dist/index.min.js" />
        <script dangerouslySetInnerHTML={{ __html: "(function(){var done=false;var tries=0;function doReady(){if(done||tries>30)return;tries++;try{if(window.miniapp&&window.miniapp.sdk){done=true;window.miniapp.sdk.actions.ready().catch(function(){});}else{setTimeout(doReady,200);}}catch(e){setTimeout(doReady,200);}}doReady();})();" }} />
      </body>
    </html>
  );
}
