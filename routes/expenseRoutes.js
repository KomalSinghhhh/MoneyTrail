const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const expenseController = require("../controllers/expenseController");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.UPLOAD_DIR || "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Create uploads directory if it doesn't exist
const fs = require("fs");
const uploadDir = process.env.UPLOAD_DIR || "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Routes
router.post("/manual", expenseController.addManualExpense);
router.post(
  "/upload-image",
  upload.single("image"),
  expenseController.addImageExpense
);
router.post("/process-text", expenseController.addTextExpense);
router.get("/history", expenseController.getExpenseHistory);
router.get("/dashboard", expenseController.getDashboardData);
router.delete("/:id", expenseController.deleteExpense);

module.exports = router;
