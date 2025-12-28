const { Schema, model } = require("mongoose");

const modLogSchema = new Schema({
  action: {
    type: String,
    required: true,
  },

  userId: {
    type: String,
    required: true,
  },

  staffId: {
    type: String,
    required: true,
  },

  reason: {
    type: String,
    default: "Sem motivo",
  },

  guildId: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("ModLog", modLogSchema);
