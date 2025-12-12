# Digital Card Platform

A full-stack web application for creating, sharing, and managing digital cards with QR code integration.

## Features

- 🎨 Create beautiful digital cards
- 📱 Generate QR codes for easy sharing
- 🔗 Short URL system
- 👥 User authentication
- 🛡️ Admin dashboard
- 📊 Analytics tracking
- 📱 Responsive design

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Framer Motion
- React Hook Form
- QRCode.js

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer for file uploads
- Supabase Storage (Image hosting)

## Project Structure

```
card-platform/
├── build/                  # Production build files
├── card-platform-backend/  # Backend server code
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── services/           # External services (Supabase)
│   └── server.js           # Entry point
├── public/                 # Static public files
├── src/                    # Frontend source code
│   ├── components/         # Reusable components
│   ├── config/             # App configuration
│   ├── contexts/           # React contexts
│   ├── pages/              # Page components
│   ├── services/           # API services
│   └── App.tsx             # Main App component
└── package.json            # Frontend dependencies
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Supabase account (for image storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd card-platform
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd card-platform-backend
   npm install
   ```

### Environment Variables

Create a `.env` file in the `card-platform-backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cardplatform
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_BUCKET=business-cards
```

Create a `.env` file in the root directory (frontend):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd card-platform-backend
   npm run dev
   ```

2. **Start the Frontend Development Server**
   ```bash
   # In a new terminal window, from the root directory
   npm start
   ```

The application will be available at `http://localhost:3000`.
