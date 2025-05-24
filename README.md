# KitchenSync - Restaurant Management Platform
> Version 2.10.0

A comprehensive restaurant management system that streamlines kitchen operations, menu management, and customer interactions.

## 🚀 Latest Release (v2.10.0)

### Major Features Added:
- **Content Management System**: Dynamic content blocks for customer-facing website
- **Restaurant Branding & Settings**: Complete customization of website appearance
- **Theme Customization**: Custom colors, fonts, and branding options
- **Cloudinary Integration**: Professional image management and optimization
- **Customer Portal**: Fully functional customer-facing website with reservations

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

## 🌟 New Features in v2.10.0

### Content Management System
- Create and manage dynamic content blocks
- Multiple block types: Text, HTML, Image, Video, CTA, Hero, Features
- Drag-and-drop reordering
- Page-specific content organization
- Active/inactive status management

### Restaurant Settings & Branding
- Complete website customization
- Logo upload and management
- Hero and about section customization
- Social media integration
- SEO optimization settings
- Opening hours management

### Theme Customization
- Custom color schemes (primary, secondary, accent)
- Font selection for headers and body text
- Live preview of theme changes
- Consistent branding across customer portal

### Customer Portal Enhancements
- Dynamic home page with content blocks
- Integrated reservation system
- Menu display with active menu selection
- Mobile-responsive design
- Theme-aware styling

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
# Backend .env
DATABASE_URL="your-postgresql-url"
JWT_SECRET="your-jwt-secret"
SESSION_SECRET="your-session-secret"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

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
# Backend (port 3001)
cd backend
npm run dev

# Frontend (port 5173)
cd frontend
npm run dev
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
- **SuperAdmin**: Full system access
- **Admin/Owner**: Restaurant management and settings
- **Manager/Chef**: Kitchen and menu management
- **Staff**: Order and reservation handling
- **Customer**: Public portal access

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