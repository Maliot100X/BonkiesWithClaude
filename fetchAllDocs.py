from browser_use_sdk.v3 import BrowserUse
import os

client = BrowserUse(api_key="bu_NePakVEy-tvMbobtqMoNEHqVmc7sC3Y2LNl3MdobDFQ")
DOCS_DIR = "/home/ubuntu/bonkwithclaude/docs"
os.makedirs(DOCS_DIR, exist_ok=True)

# 1. Telegram Mini Apps
print("Fetching Telegram docs...")
tg = client.run(
    "Go to https://core.telegram.org/bots/webapps. Read the ENTIRE page. Return ALL documentation content verbatim - every section, every table, every code example, every method, every event. Do NOT summarize. Return the complete text.",
    model="bu-max",
    profile_id="8602cc24-0e7f-4b83-80b0-006e99e34253",
    workspace_id="92a4db29-8fc5-4038-aefe-14666c2e4018",
    proxy_country_code="us",
)
with open(f"{DOCS_DIR}/telegram.md", "w") as f:
    f.write(tg.output)
print(f"Telegram: {len(tg.output)} chars")

# 2. Farcaster Mini Apps
print("Fetching Farcaster docs...")
fc = client.run(
    "Go to https://miniapps.farcaster.xyz/llms-full.txt. Read and return the ENTIRE content verbatim. Every section, every code example, every instruction. Do NOT summarize.",
    model="bu-max",
    profile_id="8602cc24-0e7f-4b83-80b0-006e99e34253",
    workspace_id="92a4db29-8fc5-4038-aefe-14666c2e4018",
    proxy_country_code="us",
)
with open(f"{DOCS_DIR}/farcaster.md", "w") as f:
    f.write(fc.output)
print(f"Farcaster: {len(fc.output)} chars")

# 3. Base Apps
print("Fetching Base docs...")
base = client.run(
    "Go to https://docs.base.org/apps/. Read the ENTIRE page. Then navigate to https://docs.base.org/apps/guides/building-a-mini-app and read that too. Return ALL documentation content verbatim - setup, manifest, authentication, wallet integration, OnchainKit, transactions, deployment. Do NOT summarize.",
    model="bu-max",
    profile_id="8602cc24-0e7f-4b83-80b0-006e99e34253",
    workspace_id="92a4db29-8fc5-4038-aefe-14666c2e4018",
    proxy_country_code="us",
)
with open(f"{DOCS_DIR}/base.md", "w") as f:
    f.write(base.output)
print(f"Base: {len(base.output)} chars")

print("\nAll docs saved to ~/bonkwithclaude/docs/")
