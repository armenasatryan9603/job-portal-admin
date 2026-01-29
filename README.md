# Admin Panel

A React + Vite admin panel for managing users, sending notifications, and messages.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the admin folder:
```
VITE_API_URL=http://localhost:8080
```

Replace `http://localhost:8080` with your backend API URL.

3. Start the development server:
```bash
npm run dev
```

The admin panel will be available at `http://localhost:5173` (or the port Vite assigns).

## Creating an Admin User

Before you can login, you need to create an admin user. You have several options:

### Option 1: Using the Script (Recommended)

Run the create-admin script from the backend folder:

```bash
cd ../backend
npm run create-admin
```

This will create an admin user with:
- Email: `admin@example.com`
- Password: `admin123`

You can customize these by setting environment variables:
```bash
ADMIN_EMAIL=your-email@example.com ADMIN_PASSWORD=your-password npm run create-admin
```

### Option 2: Using SQL

Connect to your database and run:

```sql
-- First, hash a password (use bcrypt, or use the script above)
-- For example, if you want to use password "admin123", you need to hash it first
-- Or update an existing user:
UPDATE "User" SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Option 3: Using the API (if you have access)

If you have an existing user account, you can update it to admin using the admin panel's update user endpoint (but you'd need to be admin first, so this is a chicken-and-egg problem).

## Login

Once you have an admin user:
1. Go to the admin panel login page
2. Enter the admin email and password
3. You'll be redirected to the dashboard

## Features

- **Dashboard**: View statistics about users, orders, proposals, and notifications
- **User Management**: 
  - View all users with pagination
  - Search users by name, email, or phone
  - Filter users by role
  - View detailed user information
  - Edit user fields (name, email, phone, role, verified status, credit balance, etc.)
- **Notifications**: Send push notifications and emails to users
- **Messages**: Send direct messages to users (creates conversation if needed)

## Authentication

You need to log in with an admin account. The admin panel uses JWT tokens for authentication. Make sure your backend API URL is correctly configured in the `.env` file.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder.
# job-portal-admin
