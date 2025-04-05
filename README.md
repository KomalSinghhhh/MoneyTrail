# Money Trail Backend

A Node.js backend for the Money Trail expense tracking application that processes expenses through manual entry, image uploads (using Gemini AI), and voice transcription.

## Features

- 📝 Manual expense entry
- 📸 Image-based expense extraction using Google's Gemini AI
- 🗣️ Voice transcription to text processing
- 📊 Expense history and dashboard analytics
- 🗄️ MongoDB database integration

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community)
- [Git](https://git-scm.com/)

## Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd money-trail-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   - Create a `.env` file in the root directory
   - Add the following configurations:
     ```env
     PORT=3000
     MONGODB_URI=mongodb://localhost:27017/money-trail
     UPLOAD_DIR=uploads
     GEMINI_API_KEY=your_gemini_api_key_here
     ```
   - Replace `your_gemini_api_key_here` with your actual Gemini API key

4. **Create uploads directory**
   ```bash
   mkdir uploads
   ```

## Running the Application

1. **Start MongoDB**

   - Make sure MongoDB is running on your system
   - For macOS/Linux:
     ```bash
     mongod
     ```
   - For Windows, ensure MongoDB service is running

2. **Start the server**
   - Development mode (with auto-reload):
     ```bash
     npm run dev
     ```
   - Production mode:
     ```bash
     npm start
     ```

The server will start on `http://localhost:3000`

## API Endpoints

### 1. Manual Expense Entry

```bash
POST /api/expenses/manual
Content-Type: application/json

{
    "amount": 50,
    "shop_name": "Walmart",
    "purpose": "Groceries",
    "timestamp": "2024-04-05T10:00:00Z"
}
```

### 2. Image-based Expense

```bash
POST /api/expenses/upload-image
Content-Type: multipart/form-data
Body: form-data
Key: image
Value: [Select Image File]
```

### 3. Voice-to-Text Expense

```bash
POST /api/expenses/process-text
Content-Type: application/json

{
    "text": "I spent 50 dollars at Walmart for groceries"
}
```

### 4. Get Expense History

```bash
GET /api/expenses/history
```

### 5. Get Dashboard Data

```bash
GET /api/expenses/dashboard
```

## Project Structure

```
money-trail-backend/
├── controllers/         # Request handlers
├── models/             # Database models
├── routes/             # API routes
├── utils/             # Utility functions
├── uploads/           # Uploaded files
├── .env               # Environment variables
├── .gitignore        # Git ignore rules
├── package.json      # Project dependencies
└── server.js         # Entry point
```

## Error Handling

The API includes error handling for:

- Invalid request data
- File upload errors
- Database connection issues
- AI processing errors

## Development

To contribute to the project:

1. Create a new branch
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License.
