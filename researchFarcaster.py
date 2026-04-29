from browser_use_sdk.v3 import BrowserUse

client = BrowserUse(api_key="bu_NePakVEy-tvMbobtqMoNEHqVmc7sC3Y2LNl3MdobDFQ")

result = client.run(
    "Go to https://miniapps.farcaster.xyz/ and extract the COMPLETE documentation for Farcaster Mini Apps. Get ALL sections: manifest file format, SDK setup, authentication, actions, notifications, ready signals, lifecycle, embeds, sharing, wallet connections, transactions. Return EVERYTHING in full detail with code examples.",
    model="bu-max",
    profile_id="8602cc24-0e7f-4b83-80b0-006e99e34253",
    workspace_id="92a4db29-8fc5-4038-aefe-14666c2e4018",
    proxy_country_code="us",
)

with open("/home/ubuntu/bonkwithclaude/farcasterDocs.txt", "w") as f:
    f.write(result.output)

print("Farcaster docs saved.")
print(result.output[:2000])
