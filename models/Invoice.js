const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  image_path: {
    type: String,
    required: true,
  },
  extracted_text: {
    type: String,
  },
  processed_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Invoice", invoiceSchema);
