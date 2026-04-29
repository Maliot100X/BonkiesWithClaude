from browser_use_sdk.v3 import BrowserUse

client = BrowserUse(api_key="bu_NePakVEy-tvMbobtqMoNEHqVmc7sC3Y2LNl3MdobDFQ")

result = client.run(
    "Go to https://boinkers.io/. Take a screenshot. Describe in detail: 1) The landing page layout and all buttons visible 2) The color scheme (exact hex colors if possible) 3) The font styles 4) All UI elements. Then click 'Play as guest' if available. Describe the game screen: the spin wheel, buttons, navigation, score display, energy bar, tabs, everything. Be extremely specific about layout positions, sizes, colors, and animations.",
    model="bu-max",
    profile_id="8602cc24-0e7f-4b83-80b0-006e99e34253",
    workspace_id="92a4db29-8fc5-4038-aefe-14666c2e4018",
    proxy_country_code="us",
)

with open("/home/ubuntu/bonkwithclaude/boinkersGameAnalysis.txt", "w") as f:
    f.write(result.output)

print(result.output[:5000])
