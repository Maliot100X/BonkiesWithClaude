from browser_use_sdk.v3 import BrowserUse

client = BrowserUse(api_key="bu_NePakVEy-tvMbobtqMoNEHqVmc7sC3Y2LNl3MdobDFQ")

result = client.run(
    "Go to https://core.telegram.org/bots/webapps and extract the COMPLETE documentation for Telegram Mini Apps (Web Apps). Get ALL sections: setup, methods, events, CSS variables, initialization, passing data, theme params, closing, expanding, viewport, main button, back button, settings button, haptic feedback, cloud storage, biometry, location, accelerometer, gyroscope, device orientation. Return EVERYTHING in full detail with code examples.",
    model="bu-max",
    profile_id="8602cc24-0e7f-4b83-80b0-006e99e34253",
    workspace_id="92a4db29-8fc5-4038-aefe-14666c2e4018",
    proxy_country_code="us",
)

with open("/home/ubuntu/bonkwithclaude/telegramDocs.txt", "w") as f:
    f.write(result.output)

print("Telegram docs saved.")
print(result.output[:2000])
