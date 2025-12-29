async function banMember(member, reason) {
  if (!member?.bannable) return;
  await member.ban({ reason }).catch(() => null);
}

async function stripRoles(member, reason) {
  if (!member?.manageable) return;

  const rolesToRemove = member.roles.cache.filter(
    (r) => r.id !== process.env.ROLE_MEMBER
  );

  await member.roles.remove(rolesToRemove, reason).catch(() => null);
}

module.exports = {
  banMember,
  stripRoles,
};
