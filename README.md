# TalentFlow - Mini Hiring Platform

A modern, full-featured hiring platform built with React, TypeScript, and cutting-edge frontend technologies. TalentFlow allows HR teams to efficiently manage jobs, candidates, and assessments with a sleek, responsive UI.

## 🚀 Features

### Core Functionality
- **Jobs Management**: Create, edit, archive, and reorder jobs with drag-and-drop functionality
- **Candidate Pipeline**: Manage candidates through different stages with a Kanban board interface
- **Assessment Builder**: Create custom assessments with various question types and conditional logic
- **Real-time Updates**: Optimistic updates with rollback on failure
- **Advanced Search & Filtering**: Server-like pagination and filtering for large datasets

### Technical Highlights
- **Virtualized Lists**: Handle 1000+ candidates efficiently
- **Offline Storage**: IndexedDB persistence via localForage
- **API Simulation**: MirageJS with artificial latency and error rates
- **Type Safety**: Full TypeScript implementation
- **Modern UI**: Tailwind CSS with Framer Motion animations
- **State Management**: Zustand for global state
- **Data Fetching**: React Query for caching and synchronization

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library with hooks and concurrent features
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router v6** - Client-side routing
- **React Hook Form** - Form management
- **Heroicons** - Beautiful SVG icons

### State & Data
- **Zustand** - Lightweight state management
- **React Query** - Server state management and caching
- **localForage** - IndexedDB wrapper for offline storage
- **MirageJS** - API mocking and simulation

### Development Tools
- **React Scripts** - Build tooling
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd talentflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗 Project Structure

```
src/
├── api/           # API services and MirageJS setup
├── components/    # Reusable UI components
│   ├── ui/        # Basic UI components (Button, Input, etc.)
│   └── Layout/    # Layout components (Sidebar, Header)
├── hooks/         # Custom React hooks
├── lib/           # Utility libraries (storage, seed data)
├── pages/         # Page components
├── store/         # Zustand store definitions
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── index.tsx      # Application entry point
```

## 🔧 Key Components

### Jobs Management
- **Jobs Board**: Paginated list with search and filtering
- **Drag & Drop**: Reorder jobs with optimistic updates
- **Job Form**: Create/edit jobs with validation
- **Deep Linking**: Direct links to specific jobs

### Candidate Management
- **Virtualized List**: Efficiently render 1000+ candidates
- **Kanban Board**: Drag candidates between stages
- **Candidate Profile**: Detailed view with timeline and notes
- **Advanced Search**: Real-time search with debouncing

### Assessment System
- **Builder Interface**: Create assessments with multiple question types
- **Live Preview**: Real-time preview of assessment forms
- **Question Types**: Single/multi-choice, text, numeric, file upload
- **Conditional Logic**: Show/hide questions based on responses

## 🎨 UI/UX Features

### Design System
- **Consistent Components**: Reusable UI components with variants
- **Responsive Design**: Mobile-first approach
- **Dark Mode Ready**: Theme system prepared for dark mode
- **Accessibility**: ARIA labels and keyboard navigation

### Animations
- **Smooth Transitions**: Framer Motion for page transitions
- **Loading States**: Skeleton screens and spinners
- **Optimistic Updates**: Immediate UI feedback
- **Error Handling**: Graceful error states with recovery options

## 📊 Data Management

### Seed Data
- **25 Jobs**: Mixed active/archived with realistic data
- **1000 Candidates**: Randomly distributed across stages
- **3+ Assessments**: Pre-built assessments with 10+ questions each

### API Simulation
- **REST Endpoints**: Full CRUD operations
- **Artificial Latency**: 200-1200ms response times
- **Error Simulation**: 5-10% error rate on write operations
- **Pagination**: Server-like pagination and sorting

### Local Storage
- **IndexedDB**: Persistent storage via localForage
- **Data Synchronization**: Automatic sync with API
- **Offline Support**: Works without network connection
- **Backup/Restore**: Export/import functionality

## 🚀 Performance Optimizations

- **Code Splitting**: React.lazy for route-based splitting
- **Virtualization**: Efficient rendering of large lists
- **Memoization**: React.memo and useMemo optimizations
- **Debouncing**: Search input debouncing
- **Caching**: React Query caching strategies

## 🧪 Development Features

### Error Handling
- **Error Boundaries**: Graceful error recovery
- **Retry Logic**: Automatic retry with exponential backoff
- **Rollback**: Optimistic update rollback on failure
- **User Feedback**: Toast notifications for all actions

### Developer Experience
- **TypeScript**: Full type safety
- **Hot Reload**: Instant development feedback
- **ESLint**: Code quality enforcement
- **Component Storybook**: (Future enhancement)

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Adaptive layouts for tablets
- **Desktop**: Full-featured desktop experience
- **Touch Friendly**: Touch-optimized interactions

## 🔄 State Management

### Global State (Zustand)
- **Jobs Store**: Job management and filtering
- **Candidates Store**: Candidate data and pipeline
- **Assessments Store**: Assessment builder state
- **UI Store**: Global UI state (modals, toasts, theme)

### Server State (React Query)
- **Caching**: Intelligent caching strategies
- **Background Updates**: Automatic data refresh
- **Optimistic Updates**: Immediate UI updates
- **Error Recovery**: Automatic retry and rollback

## 🚢 Deployment

The application is designed for easy deployment to any static hosting service:

### Build for Production
```bash
npm run build
```

### Deployment Options
- **Netlify**: Drag and drop deployment
- **Vercel**: Git-based deployment
- **GitHub Pages**: Static site hosting
- **AWS S3**: Cloud storage deployment

## 🔮 Future Enhancements

### Planned Features
- **Real-time Collaboration**: Multiple users editing simultaneously
- **Advanced Analytics**: Hiring pipeline analytics
- **Email Integration**: Automated candidate communication
- **Calendar Integration**: Interview scheduling
- **Document Management**: Resume parsing and storage
- **API Integration**: Connect to external job boards

### Technical Improvements
- **PWA Support**: Progressive Web App features
- **Push Notifications**: Real-time notifications
- **Offline Sync**: Conflict resolution for offline changes
- **Performance Monitoring**: Real-time performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Frontend Architecture**: React 18, TypeScript, Tailwind CSS
- **State Management**: Zustand, React Query
- **UI/UX Design**: Modern, accessible design system
- **Data Layer**: MirageJS, IndexedDB, localForage

## 📞 Support

For questions or support, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

**Built with ❤️ using modern React and TypeScript**

