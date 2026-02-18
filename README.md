# Secure-Auth Portal

A full-stack authentication system demonstrating modern web security practices with Next.js, TypeScript, and MongoDB.

**🚀 Live Demo:** [secure-auth-portal.vercel.app](https://secure-auth-portal.vercel.app)

## ✨ Features

- **User Registration** - Secure account creation with input validation and password hashing
- **Login System** - JWT-based authentication for secure session management
- **Email Verification** - Account validation via email using Nodemailer
- **Password Reset** - Secure password recovery flow with token-based verification

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- MongoDB database (local or Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/SyedMaazz/secure-auth-portal.git
cd secure-auth-portal
Install dependencies:
Bash

npm install
Create a .env.local file in the root directory:
env

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
NEXT_PUBLIC_APP_URL=http://localhost:3000
Run the development server:
Bash

npm run dev
Open your browser at http://localhost:3000
🛠️ Technology Stack
Frontend
Next.js - React framework with server-side rendering
TypeScript - Type-safe JavaScript
Responsive UI - Mobile-friendly components
Backend
Node.js - JavaScript runtime
MongoDB - NoSQL database
Mongoose - MongoDB object modeling
Security
JWT - Token-based authentication
bcrypt - Password hashing algorithm
Nodemailer - Email verification and password reset
Input Validation - Data sanitization and validation
Middleware Protection - Route authorization
📁 Project Structure

secure-auth-portal/
├── app/              # Next.js app directory
│   ├── api/         # API routes
│   ├── auth/        # Authentication pages
│   └── dashboard/   # Protected dashboard
├── components/       # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and libraries
├── middleware.ts    # Authentication middleware
├── public/          # Static assets
└── styles/          # CSS styling
🔒 Security Features
This project implements industry-standard security practices:

✅ Password Hashing - All passwords are hashed using bcrypt before storage
✅ JWT Tokens - Secure, stateless session management
✅ Email Verification - Prevents unauthorized account creation
✅ Token Expiration - Automatic session timeout for security
✅ Protected Routes - Middleware-based authorization
✅ Input Sanitization - Prevents injection attacks
🌐 Environment Variables
Variable	Description	Required
MONGODB_URI	MongoDB connection string	✅ Yes
JWT_SECRET	Secret key for JWT signing	✅ Yes
EMAIL_USER	SMTP email address	✅ Yes
EMAIL_PASSWORD	SMTP email password	✅ Yes
NEXT_PUBLIC_APP_URL	Application base URL	✅ Yes
⚠️
Security Note: Never commit .env.local or expose sensitive credentials in your repository.

🚀 Deployment
This project is deployed on Vercel. To deploy your own instance:

Push your code to GitHub
Import the repository in Vercel
Add environment variables in the Vercel dashboard
Deploy
🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request
📄 License
This project is open source and available for educational purposes.

👤 Author
SyedMaazz

GitHub: @SyedMaazz
Project: secure-auth-portal
⭐ If you found this project helpful, please consider giving it a star!
