from browser_use_sdk.v3 import BrowserUse

client = BrowserUse(api_key="bu_NePakVEy-tvMbobtqMoNEHqVmc7sC3Y2LNl3MdobDFQ")

# Get Telegram docs - full content
result = client.run(
    "Go to https://core.telegram.org/bots/webapps and extract the COMPLETE Telegram Mini Apps documentation. Return ALL sections with ALL code examples. Do not summarize - return everything verbatim.",
    model="bu-max",
    profile_id="8602cc24-0e7f-4b83-80b0-006e99e34253",
    workspace_id="92a4db29-8fc5-4038-aefe-14666c2e4018",
    proxy_country_code="us",
)

with open("/home/ubuntu/bonkwithclaude/docs/telegram.md", "w") as f:
    f.write("# Telegram Mini Apps Documentation\n\n")
    f.write(result.output)

print(f"Telegram docs: {len(result.output)} chars saved")
