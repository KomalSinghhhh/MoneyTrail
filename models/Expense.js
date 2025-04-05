const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  shop_name: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  input_method: {
    type: String,
    enum: ["manual", "image", "text"],
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Expense", expenseSchema);
