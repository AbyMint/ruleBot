require('dotenv').config();
const {
  ChannelType,
  Client,
  GatewayIntentBits,
  Partials,
  PermissionsBitField,
} = require('discord.js');

const token = process.env.DISCORD_TOKEN;
const guildId = process.env.GUILD_ID;
const verificationChannelId = process.env.VERIFY_CHANNEL_ID;
const roleId = process.env.VERIFY_ROLE_ID;

const verificationEmojis = (process.env.VERIFY_EMOJIS || '✅,❌,🎉,🔥')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const correctEmoji = process.env.CORRECT_EMOJI || verificationEmojis[0];
const verificationPrompt = [
  'React with the correct emoji to access the server.',
  ...verificationEmojis.map((emoji, index) => `${index + 1}. ${emoji}`),
].join('\n');

if (!token || !guildId || !verificationChannelId || !roleId) {
  throw new Error(
    'Missing required environment variables. Set DISCORD_TOKEN, GUILD_ID, VERIFY_CHANNEL_ID, and VERIFY_ROLE_ID.'
  );
}

if (!verificationEmojis.includes(correctEmoji)) {
  throw new Error('CORRECT_EMOJI must be included in VERIFY_EMOJIS.');
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

let verificationMessageId;

client.once('ready', async () => {
  const guild = await client.guilds.fetch(guildId);
  const me = await guild.members.fetch(client.user.id);

  if (!me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
    throw new Error('Bot needs Manage Roles permission.');
  }

  const channel = await guild.channels.fetch(verificationChannelId);

  if (!channel || channel.type !== ChannelType.GuildText) {
    throw new Error('VERIFY_CHANNEL_ID must point to a text channel.');
  }

  const message = await channel.send(verificationPrompt);
  verificationMessageId = message.id;

  for (const emoji of verificationEmojis) {
    await message.react(emoji);
  }

  console.log(`ruleBot is ready as ${client.user.tag}`);
  console.log(`Verification message sent to #${channel.name}`);
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) {
    return;
  }

  if (reaction.partial) {
    await reaction.fetch();
  }

  if (
    !verificationMessageId ||
    reaction.message.id !== verificationMessageId ||
    reaction.message.channelId !== verificationChannelId
  ) {
    return;
  }

  if (reaction.emoji.name !== correctEmoji) {
    return;
  }

  const guild = await client.guilds.fetch(guildId);
  const member = await guild.members.fetch(user.id);

  if (!member.roles.cache.has(roleId)) {
    await member.roles.add(roleId, 'Passed emoji verification');
  }
});

client.login(token);
