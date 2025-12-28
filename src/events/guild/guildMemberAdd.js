const { Events } = require("discord.js");

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,

  async execute(member, client) {
    if (!member.user.bot) {
      member.roles.add(process.env.ROLE_MEMBER);
    }

    if (member.user.bot) {
      member.roles.add(process.env.ROLE_BOT);
    }
  },
};
