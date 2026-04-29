export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bonkies-with-claude.vercel.app";

  const manifest = {
    accountAssociation: {
      header: process.env.FARCASTER_ACCOUNT_HEADER || "PLACEHOLDER_GENERATE_AT_FARCASTER_DEV",
      payload: process.env.FARCASTER_ACCOUNT_PAYLOAD || "PLACEHOLDER_GENERATE_AT_FARCASTER_DEV",
      signature: process.env.FARCASTER_ACCOUNT_SIGNATURE || "PLACEHOLDER_GENERATE_AT_FARCASTER_DEV",
    },
    frame: {
      version: "1",
      name: "BonkiesWithClaude",
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/og.png`,
      buttonTitle: "Play Now",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#0A0F26",
      webhookUrl: process.env.FARCASTER_WEBHOOK_URL || `${appUrl}/api/webhook/farcaster`,
      description: "Spin the wheel, earn coins, climb the leaderboard! Play on Farcaster, Telegram, and Base.",
      primaryCategory: "games",
      tags: ["game", "spin", "rewards", "leaderboard"],
      tagline: "Spin. Win. Climb.",
      ogTitle: "BonkiesWithClaude",
      ogDescription: "The ultimate spin game on Farcaster, Telegram, and Base!",
      ogImageUrl: `${appUrl}/og.png`,
      noindex: false,
      requiredChains: ["eip155:8453", "eip155:84532"],
      requiredCapabilities: ["wallet.getEthereumProvider", "actions.composeCast", "haptics.impactOccurred"],
    },
  };

  return Response.json(manifest, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "application/json",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
