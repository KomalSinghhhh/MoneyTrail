const Expense = require("../models/Expense");
const Invoice = require("../models/Invoice");
const {
  processImageWithGemini,
  processTextWithGemini,
} = require("../utils/geminiApi");

exports.addManualExpense = async (req, res) => {
  try {
    console.log("Received manual expense data:", req.body);
    const { username, id, ...expenseData } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    // If ID is provided, update existing expense
    if (id) {
      const existingExpense = await Expense.findById(id);
      
      // Verify the expense exists and belongs to the user
      if (!existingExpense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      if (existingExpense.username !== username) {
        return res.status(403).json({ error: "Not authorized to modify this expense" });
      }

      // Update the expense
      const updatedExpense = await Expense.findByIdAndUpdate(
        id,
        {
          ...expenseData,
          username,
          input_method: existingExpense.input_method, // Preserve original input method
        },
        { new: true } // Return the updated document
      );
      
      return res.status(200).json(updatedExpense);
    }

    // If no ID provided, create new expense
    const expense = new Expense({
      ...expenseData,
      username,
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
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const imagePath = req.file.path;
    const extractedData = await processImageWithGemini(imagePath);

    const invoice = new Invoice({
      image_path: imagePath,
      extracted_text: JSON.stringify(extractedData),
      username, // Also store username in invoice for reference
    });
    await invoice.save();

    const expense = new Expense({
      ...extractedData,
      username,
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
    const { text, username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    if (!text) {
      return res.status(400).json({ error: "No text provided" });
    }

    const extractedData = await processTextWithGemini(text);

    const expense = new Expense({
      ...extractedData,
      username,
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
    // Get username from JWT token instead of query params
    const username = req.user.username;
    console.log('Username from JWT:', username);
    
    if (!username) {
      console.log('No username in token');
      return res.status(400).json({ error: "Username is required" });
    }

    // Debug: Check all expenses in the database
    const allExpenses = await Expense.find({});
    console.log('Total expenses in database:', allExpenses.length);
    console.log('Sample of all expenses:', allExpenses.map(e => ({
      id: e._id,
      amount: e.amount,
      username: e.username,
      shop_name: e.shop_name
    })));

    // Execute the query with the username from JWT
    const expenses = await Expense.find({ username })
      .sort({ timestamp: -1 })
      .lean()
      .exec();

    console.log('Found expenses for username:', expenses.length);
    if (expenses.length > 0) {
      console.log('Sample expense:', JSON.stringify(expenses[0], null, 2));
    } else {
      console.log('No expenses found for username:', username);
    }

    // Send response
    res.json(expenses);
  } catch (error) {
    console.error('Error in getExpenseHistory:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const username = req.user.username; // Get username from JWT token

    // Find the expense
    const expense = await Expense.findById(id);
    
    // Check if expense exists
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Check if user owns this expense
    if (expense.username !== username) {
      return res.status(403).json({ error: "Not authorized to delete this expense" });
    }

    // Delete the expense
    await Expense.findByIdAndDelete(id);
    
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error('Error in deleteExpense:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const { username } = req.query;
    
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    // Get expenses for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expenses = await Expense.find({
      username,
      timestamp: { $gte: thirtyDaysAgo },
    }).sort({ timestamp: 1 }); // Sort by timestamp for graph data

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

    // Generate weekly graph data from actual expenses
    const weeks = {};
    const now = new Date();
    
    expenses.forEach((expense) => {
      const weekNumber = Math.ceil((now - expense.timestamp) / (7 * 24 * 60 * 60 * 1000));
      weeks[weekNumber] = (weeks[weekNumber] || 0) + expense.amount;
    });

    const graphData = {
      labels: Object.keys(weeks).map(week => `Week ${week}`).reverse(),
      data: Object.values(weeks).reverse(),
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
