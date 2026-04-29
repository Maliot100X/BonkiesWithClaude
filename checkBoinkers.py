from browser_use_sdk.v3 import BrowserUse

client = BrowserUse(api_key="bu_NePakVEy-tvMbobtqMoNEHqVmc7sC3Y2LNl3MdobDFQ")

result = client.run(
    "Go to https://boinkers.io/. Click 'Play as guest' to enter the game. Once inside the game, describe EVERYTHING you see in full detail: the layout, all UI elements, buttons, colors, animations, game mechanics, screens, tabs, sections, scores, energy bars, spin wheel or whatever game mechanic they use, leaderboard, profile, shop, rewards, daily bonuses. Take a screenshot of each major screen. Describe the complete game flow and every visual element. Be extremely detailed about the look and feel.",
    model="bu-max",
    profile_id="8602cc24-0e7f-4b83-80b0-006e99e34253",
    workspace_id="92a4db29-8fc5-4038-aefe-14666c2e4018",
    proxy_country_code="us",
)

with open("/home/ubuntu/bonkwithclaude/boinkersGameAnalysis.txt", "w") as f:
    f.write(result.output)

print(result.output)
