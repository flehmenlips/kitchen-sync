# KitchenSync - Restaurant Management Platform
> Version 2.11.1

A comprehensive restaurant management system that streamlines kitchen operations, menu management, and customer interactions.

## 🚀 Latest Release (v2.11.1)

### Major Features Added:
- **Admin Dashboard**: Comprehensive customer and staff management interface
- **Customer CRM**: Search, filter, and manage all restaurant customers
- **Staff Management**: Create and manage staff accounts with role-based permissions
- **Analytics API**: Ready-to-use endpoints for business intelligence
- **Email Infrastructure**: SendGrid integration with testing tools

## 🏗️ Architecture

KitchenSync is built as a modular platform with five integrated modules:

### 1. **CookBook** (Recipe Management System)
- Create, store, and manage recipes with ingredients and instructions
- Categorize recipes for easy organization
- Calculate recipe yields and scaling
- Track prep and cook times
- Photo upload support via Cloudinary

### 2. **AgileChef** (Kitchen Prep Management)
- Kanban-style prep task management
- Drag-and-drop task organization
- Real-time kitchen workflow tracking
- Customizable prep columns

### 3. **MenuBuilder** (Menu Design & Management)
- Create multiple menus (lunch, dinner, seasonal)
- Drag-and-drop menu item ordering
- Link recipes directly to menu items
- Rich text formatting and styling options
- Real-time menu preview
- PDF export functionality

### 4. **TableFarm** (Front-of-House Operations)
- Reservation calendar system
- Order entry and management
- Table management
- Customer database

### 5. **ChefRail** (Kitchen Display System)
- Real-time order display (Coming Soon)
- Kitchen communication
- Order tracking and timing

## 🌟 New Features in v2.11.1

### Admin Dashboard
- **Customer Management**: Comprehensive CRM with search, filtering, and pagination
- **Customer Analytics**: View stats on new customers, verification rates, and engagement
- **Staff Management**: Create, edit, and manage staff accounts with role assignments
- **Activity Tracking**: Monitor staff activity and content creation
- **Role-Based Access**: Secure access control for admin features

### Email Infrastructure
- **SendGrid Integration**: Production-ready email service
- **Email Templates**: Verification, welcome, password reset, and reservation confirmations
- **Testing Tools**: Scripts to test all email types in development
- **Environment Configuration**: Easy setup for different environments

### Customer/Staff Separation (v2.11.0)
- **Separate Authentication**: Isolated auth systems for customers and staff
- **Database Architecture**: Dedicated customer table with proper relationships
- **Enhanced Security**: Prevents privilege escalation and cross-authentication
- **Migration Safety**: Production-safe scripts with rollback capabilities

## 🛠️ Tech Stack

### Backend
- Node.js + TypeScript
- Express.js
- PostgreSQL with Prisma ORM
- JWT Authentication
- Cloudinary for image management

### Frontend
- React 18 with TypeScript
- Material-UI (MUI) component library
- React Router v6
- React Query for data fetching
- Vite for build tooling

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/kitchen-sync.git
cd kitchen-sync
```

2. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Set up environment variables:
```bash
# Backend .env.local (for development)
DATABASE_URL="your-postgresql-url"
JWT_SECRET="your-jwt-secret"
SESSION_SECRET="your-session-secret"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
SENDGRID_API_KEY="your-sendgrid-key"
FROM_EMAIL="noreply@yourrestaurant.com"
FRONTEND_URL="http://localhost:5173"

# Frontend .env
VITE_API_URL="http://localhost:3001/api"
```

4. Run database migrations:
```bash
cd backend
npx prisma migrate dev
```

5. Start the development servers:
```bash
# Backend (port 3001) - ALWAYS use dev:local for development
cd backend
npm run dev:local

# Frontend (port 5173)
cd frontend
npm run dev
```

## 📧 Email Testing

Test email functionality in development:
```bash
cd backend
npm run test:email:local
```

## 🚀 Deployment

The application is configured for deployment on Render.com with automatic deployments from the main branch.

### Backend Deployment
- PostgreSQL database on Render
- Node.js web service
- Environment variables configured in Render dashboard

### Frontend Deployment
- Static site deployment
- Automatic builds from GitHub pushes
- Environment variables for API endpoints

## 👥 User Roles

KitchenSync supports multiple user roles:
- **SuperAdmin**: Full system access, admin dashboard
- **Admin**: Restaurant management, settings, and admin dashboard
- **User**: Staff members with kitchen and menu management
- **Customer**: Separate authentication for restaurant patrons

### Admin Dashboard Access
The Admin Dashboard is available at `/admin` for users with Admin or SuperAdmin roles. Features include:
- Customer relationship management (CRM)
- Staff account management
- Analytics and reporting
- Customer communication tools

## 📱 Customer Portal

The customer-facing portal (accessible at `/customer`) includes:
- Restaurant information and branding
- Online menu viewing
- Reservation system
- Contact information
- Opening hours
- Dynamic content managed through CMS

## 🔒 Security

- JWT-based authentication
- Role-based access control
- Secure password hashing with bcrypt
- Environment variable protection
- CORS configuration

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For questions or support, please open an issue in the GitHub repository.

---

Built with ❤️ for the restaurant industry 