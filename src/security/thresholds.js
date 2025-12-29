module.exports = {
  ban: {
    limit: 4,
    interval: 5 * 60 * 1000,
    punishment: "BAN",
  },

  kick: {
    limit: 4,
    interval: 7 * 60 * 1000,
    punishment: "STRIP_ROLES",
  },

  messageDelete: {
    limit: 10,
    interval: 3 * 60 * 1000,
    punishment: "STRIP_ROLES",
  },
};
