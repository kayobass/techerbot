const WHITELIST = new Set([process.env.CLIENT_ID, process.env.OWNER_ID]);

module.exports = (userId) => WHITELIST.has(userId);
