from browser_use_sdk.v3 import BrowserUse

client = BrowserUse(api_key="bu_NePakVEy-tvMbobtqMoNEHqVmc7sC3Y2LNl3MdobDFQ")

# 1. Farcaster - how to get real account association and manifest
print("=== FARCASTER SETUP ===")
fc = client.run(
    "Go to https://farcaster.xyz/~/developers/mini-apps/manifest and explain the COMPLETE process to generate a real Farcaster account association for a mini app manifest. What steps are needed? What data is returned? How do you use header, payload, signature in the manifest JSON?",
    model="bu-max",
    profile_id="8602cc24-0e7f-4b83-80b0-006e99e34253",
    workspace_id="92a4db29-8fc5-4038-aefe-14666c2e4018",
    proxy_country_code="us",
)
with open("/home/ubuntu/bonkwithclaude/docs/farcasterSetup.txt", "w") as f:
    f.write(fc.output)
print(fc.output[:3000])
