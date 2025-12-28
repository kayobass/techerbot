const { Schema, model } = require("mongoose");

const warnSchema = new Schema({
  warnId: {
    type: Number,
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

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const userWarnSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },

  guildId: {
    type: String,
    required: true,
  },

  warns: {
    type: [warnSchema],
    default: [],
  },
});

module.exports = model("UserWarn", userWarnSchema);
