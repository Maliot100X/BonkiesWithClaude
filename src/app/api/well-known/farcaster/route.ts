export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bonkwithclaude.vercel.app";

  const manifest = {
    accountAssociation: {
      header: process.env.FARCASTER_ACCOUNT_HEADER || "PLACEHOLDER_GENERATE_AT_FARCASTER_DEV",
      payload: process.env.FARCASTER_ACCOUNT_PAYLOAD || "PLACEHOLDER_GENERATE_AT_FARCASTER_DEV",
      signature: process.env.FARCASTER_ACCOUNT_SIGNATURE || "PLACEHOLDER_GENERATE_AT_FARCASTER_DEV",
    },
    miniapp: {
      version: "1",
      name: "BonkWithClaude",
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/og.png`,
      buttonTitle: "Play Now",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#0A0F26",
      webhookUrl: `${appUrl}/api/webhook/farcaster`,
      description: "Bonk with Claude on Farcaster! Tap to bonk and share your score.",
      primaryCategory: "games",
      tags: ["game", "bonk", "claude"],
      tagline: "Bonk your way to glory!",
      ogTitle: "BonkWithClaude",
      ogDescription: "The ultimate bonking game on Farcaster, Telegram, and Base!",
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
