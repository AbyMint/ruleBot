# ruleBot

Discord bot to allow users to access a server by assigning a role after reacting correctly to a message.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file (or export environment variables) with:

```bash
DISCORD_TOKEN=your_bot_token
GUILD_ID=your_server_id
VERIFY_CHANNEL_ID=channel_id_for_verification_message
VERIFY_ROLE_ID=role_id_to_assign_on_success
```

Optional variables:

```bash
VERIFY_EMOJIS=✅,❌,🎉,🔥
CORRECT_EMOJI=✅
```

3. Start the bot:

```bash
npm start
```
