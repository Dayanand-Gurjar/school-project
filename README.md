# School Management System

A modern full-stack school management system with event management and image upload capabilities.

## 🏗️ Project Structure

```
School-Project/
├── school-frontend/          # React + Vite frontend
├── school-backend/           # Node.js + Express backend
├── .gitignore               # Root gitignore
└── README.md               # This file
```

## 🚀 Features

### ✅ Completed Features
- **Event Management**: Create, read, update, delete events
- **Multiple Image Upload**: Support for up to 5 images per event
- **Image Carousel**: Beautiful carousel with navigation controls
- **Responsive Design**: Mobile-friendly interface
- **Modern UI**: Clean, attractive design with CSS Grid/Flexbox
- **Image Storage**: Integrated with Supabase Storage

### 🎨 UI Components
- Hero section with auto-rotating slides
- Events preview on homepage with images
- Interactive image carousel with dots and arrows
- Mobile-optimized navigation
- Form validation and loading states

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **CSS3** - Styling with custom properties
- **Modern JavaScript** - ES6+ features

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Multer** - File upload handling
- **Supabase** - Database and storage
- **UUID** - Unique file naming
- **CORS** - Cross-origin resource sharing

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm or yarn
- Supabase account

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd school-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your actual values:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   PORT=3001
   ```

4. **Create Supabase storage bucket:**
   - Go to your Supabase dashboard
   - Navigate to Storage
   - Create a new bucket named: `event-images`
   - Set it as public

5. **Database setup:**
   ```sql
   -- Add image_urls column to events table
   ALTER TABLE events ADD COLUMN image_urls jsonb;
   ```

6. **Start the server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd school-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

### Manual Update Required

Update `school-frontend/src/components/Events/EventsList.jsx` with the carousel implementation (see the provided code in the completion message).

## 📁 What's Ignored by Git

The `.gitignore` files protect sensitive information:

### Always Ignored:
- `node_modules/` - Dependencies
- `.env` files - Environment variables & secrets
- `dist/`, `build/` - Build outputs
- `.cache/` - Cache directories
- IDE files (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`, `Thumbs.db`)
- Log files (`*.log`)

### Backend Specific:
- Database files (`*.db`, `*.sqlite`)
- Upload directories
- SSL certificates (`*.pem`, `*.key`)
- PM2 config files

## 🌟 Usage

1. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

2. **Create events:**
   - Navigate to Events page
   - Use the form to add events with multiple images
   - Images are automatically stored in Supabase

3. **View events:**
   - Homepage shows latest 3 events with image carousels
   - Events page shows all events in a grid layout
   - Click carousel arrows or dots to browse images

## 🔧 Development

### Adding New Features
1. Backend: Add routes in `src/routes/`
2. Frontend: Add components in `src/components/`
3. Always update both `.gitignore` files when adding new file types

### Environment Variables
- Never commit `.env` files
- Always update `.env.example` when adding new variables
- Use different `.env` files for different environments

## 📝 Project Status

- ✅ Image upload with carousel functionality
- ✅ Responsive design
- ✅ Git ignore files configured
- ⏳ Edit event functionality (planned)
- ⏳ User authentication (planned)
- ⏳ Admin dashboard (planned)

## 🤝 Contributing

1. Clone the repository
2. Create a feature branch
3. Make changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational purposes.
