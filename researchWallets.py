from browser_use_sdk.v3 import BrowserUse

client = BrowserUse(api_key="bu_NePakVEy-tvMbobtqMoNEHqVmc7sC3Y2LNl3MdobDFQ")

# Telegram Wallet
print("=== TELEGRAM WALLET ===")
tg = client.run(
    "Go to https://docs.twa.dev/docs/telegram-wallet and explain how to integrate Telegram Wallet into a Mini App. What SDK is needed? How do you connect a user's TON wallet? What are the methods for sending transactions, checking balance, etc?",
    model="bu-max",
    profile_id="8602cc24-0e7f-4b83-80b0-006e99e34253",
    workspace_id="92a4db29-8fc5-4038-aefe-14666c2e4018",
    proxy_country_code="us",
)
with open("/home/ubuntu/bonkwithclaude/docs/telegramWallet.txt", "w") as f:
    f.write(tg.output)
print(tg.output[:3000])
