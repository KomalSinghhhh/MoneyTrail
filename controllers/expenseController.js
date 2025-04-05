const Expense = require("../models/Expense");
const Invoice = require("../models/Invoice");
const {
  processImageWithGemini,
  processTextWithGemini,
} = require("../utils/geminiApi");

exports.addManualExpense = async (req, res) => {
  try {
    const expense = new Expense({
      ...req.body,
      input_method: "manual",
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.addImageExpense = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const imagePath = req.file.path;
    const extractedData = await processImageWithGemini(imagePath);

    const invoice = new Invoice({
      image_path: imagePath,
      extracted_text: JSON.stringify(extractedData),
    });
    await invoice.save();

    const expense = new Expense({
      ...extractedData,
      input_method: "image",
    });
    await expense.save();

    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.addTextExpense = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const extractedData = await processTextWithGemini(text);

    const expense = new Expense({
      ...extractedData,
      input_method: "text",
    });
    await expense.save();

    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getExpenseHistory = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ timestamp: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    // Get expenses for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expenses = await Expense.find({
      timestamp: { $gte: thirtyDaysAgo },
    });

    // Calculate total spent
    const totalSpent = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Calculate category breakdown
    const categoryBreakdown = {
      Groceries: 0,
      Dining: 0,
      Transport: 0,
      Other: 0,
    };

    expenses.forEach((expense) => {
      categoryBreakdown[expense.purpose] =
        (categoryBreakdown[expense.purpose] || 0) + expense.amount;
    });

    // Mock graph data
    const graphData = {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      data: [100, 200, 150, 300],
    };

    res.json({
      total_spent: totalSpent,
      category_breakdown: categoryBreakdown,
      graph_data: graphData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
