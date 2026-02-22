# Careerion Frontend 🎨

React + TypeScript frontend application for the Careerion career guidance platform.

## 📋 Overview

The frontend provides a beautiful, responsive user interface for:
- AI-powered career chat
- User authentication (Google OAuth)
- Career dashboard
- Profile management
- Job search and applications
- Dark mode support

## 🛠 Tech Stack

- **Framework:** React 18.3 with TypeScript
- **Build Tool:** Vite 6.0
- **Styling:** Tailwind CSS 3.4
- **State Management:** React Context API
- **Routing:** React Router DOM 7.0
- **HTTP Client:** Axios 1.7
- **Authentication:** Google OAuth 2.0 (@react-oauth/google)
- **Testing:** Vitest 4.0 + React Testing Library
- **Icons:** Lucide React

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── components/          # React components
│   │   ├── EnhancedCareerChat.tsx
│   │   └── CareerDashboard.tsx
│   ├── __tests__/          # Test files
│   │   ├── App.test.tsx
│   │   └── EnhancedCareerChat.test.tsx
│   ├── App.tsx             # Main app component
│   ├── index.css           # Global styles
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── Dockerfile              # Docker configuration
├── nginx.conf              # Nginx configuration
├── vite.config.ts          # Vite configuration
├── vitest.config.ts        # Vitest configuration
├── tailwind.config.js      # Tailwind configuration
└── package.json            # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- Backend API running on http://localhost:5001

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5001/api
   VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

Application will run on http://localhost:5173

### Build for Production

```bash
# Build
npm run build

# Preview production build
npm run preview
```

## ✨ Features

### 1. AI-Powered Career Chat
- Interactive chat interface with Google Gemini AI
- Category-based guidance (Skills, Career Transition, Interview Prep, etc.)
- Quick start questions for common scenarios
- Real-time typing indicators
- Message history

### 2. Authentication
- Google OAuth 2.0 integration
- JWT token management
- Secure login/logout
- Protected routes

### 3. Career Dashboard
- Personalized career insights
- Skill recommendations
- Career path visualization
- Progress tracking

### 4. User Interface
- Beautiful glassmorphism design
- Dark mode support
- Responsive layout (mobile, tablet, desktop)
- Smooth animations and transitions
- Accessible components

## 🧪 Testing

### Run Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Results
✅ **16/16 tests passing**
- App Component: 5/5 tests
- EnhancedCareerChat: 11/11 tests
- Coverage: 79.74% on EnhancedCareerChat

### Test Files
```typescript
// Example test
describe('EnhancedCareerChat Component', () => {
  test('renders chat interface', () => {
    render(<EnhancedCareerChat />);
    
    const heading = screen.queryByText(/Enhanced Career Coach/i);
    expect(heading).toBeTruthy();
  });
});
```

## 🎨 Styling

### Tailwind CSS
The project uses Tailwind CSS for styling with custom configurations:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6'
      }
    }
  }
}
```

### Custom Styles
Global styles in `src/index.css`:
- Glassmorphism effects
- Gradient backgrounds
- Custom animations
- Dark mode variables

## 🔐 Authentication Flow

1. User clicks "Sign in with Google"
2. Google OAuth popup opens
3. User authorizes the application
4. Frontend receives credential token
5. Token sent to backend for verification
6. Backend returns JWT token
7. JWT stored in localStorage
8. User redirected to dashboard

```typescript
// Google OAuth implementation
<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
  <GoogleLogin
    onSuccess={(response) => handleGoogleLogin(response)}
    onError={() => console.error('Login failed')}
  />
</GoogleOAuthProvider>
```

## 📱 Responsive Design

### Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### Mobile-First Approach
```tsx
<div className="
  flex flex-col          // Mobile: column layout
  md:flex-row            // Tablet+: row layout
  lg:gap-8               // Desktop: larger gaps
">
```

## 🌙 Dark Mode

Dark mode is implemented using Tailwind's dark mode feature:

```typescript
// Toggle dark mode
const toggleDarkMode = () => {
  document.documentElement.classList.toggle('dark');
};

// Dark mode styles
<div className="
  bg-white dark:bg-slate-900
  text-slate-900 dark:text-white
">
```

## 🔧 Configuration

### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5001'
    }
  }
});
```

### Environment Variables
```env
# API Configuration
VITE_API_URL=http://localhost:5001/api

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-client-id

# Optional
VITE_APP_NAME=Careerion
VITE_APP_VERSION=1.0.0
```

## 🐳 Docker

### Build Image
```bash
docker build \
  --build-arg VITE_API_URL=http://localhost:5001/api \
  --build-arg VITE_GOOGLE_CLIENT_ID=your-client-id \
  -t careerion-frontend .
```

### Run Container
```bash
docker run -d \
  -p 3000:80 \
  --name careerion-frontend \
  careerion-frontend
```

### Docker Compose
```bash
docker-compose up -d frontend
```

## 📊 Components

### EnhancedCareerChat
Main chat interface component with:
- Message display
- Category filters
- Quick start questions
- Input handling
- Loading states
- Error handling

```tsx
<EnhancedCareerChat 
  onMessageSent={(message) => console.log(message)}
/>
```

### CareerDashboard
Dashboard component with:
- Career insights
- Skill recommendations
- Progress tracking
- Analytics

```tsx
<CareerDashboard 
  userId={currentUser.id}
/>
```

## 🎯 State Management

Using React Context API for global state:

```typescript
// AppContext
interface AppContextType {
  theme: string;
  currentUser: User | null;
  isLoadingAuth: boolean;
  openModal: (mode: 'login' | 'signup') => void;
  logout: () => void;
  login: (user: User, token: string) => void;
}

// Usage
const { currentUser, logout } = useAppContext();
```

## 🚀 Performance

### Optimization Techniques
- Code splitting with React.lazy()
- Image optimization
- Lazy loading for routes
- Memoization with useMemo/useCallback
- Virtual scrolling for long lists

### Lighthouse Scores
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

## 🐛 Debugging

### Development Tools
```bash
# Enable React DevTools
npm install -g react-devtools

# Enable Vite debug mode
DEBUG=vite:* npm run dev
```

### Common Issues

**Issue:** API calls failing
```bash
# Check API URL
console.log(import.meta.env.VITE_API_URL)

# Check network tab in browser DevTools
```

**Issue:** Google OAuth not working
```bash
# Verify client ID
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)

# Check authorized origins in Google Console
```

## 📝 Scripts

```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "lint": "eslint . --ext ts,tsx",
  "format": "prettier --write \"src/**/*.{ts,tsx}\""
}
```

## 🎨 Design System

### Colors
```css
/* Primary Colors */
--primary: #6366f1;      /* Indigo */
--secondary: #8b5cf6;    /* Purple */

/* Neutral Colors */
--slate-50: #f8fafc;
--slate-900: #0f172a;

/* Gradients */
background: linear-gradient(to bottom right, #6366f1, #8b5cf6);
```

### Typography
- **Font Family:** Inter, system-ui, sans-serif
- **Headings:** Bold, 2xl-4xl
- **Body:** Regular, base-lg
- **Small:** Regular, sm-xs

## 🔒 Security

- XSS protection with React's built-in escaping
- CSRF protection with tokens
- Secure token storage (httpOnly cookies recommended)
- Input validation
- Content Security Policy headers

## 🚀 Deployment

### Production Build
```bash
# Build
npm run build

# Output in dist/ folder
# Deploy dist/ to:
# - Netlify
# - Vercel
# - AWS S3 + CloudFront
# - Nginx server
```

### Nginx Configuration
```nginx
server {
  listen 80;
  server_name careerion.com;
  root /usr/share/nginx/html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## 🤝 Contributing

1. Follow React best practices
2. Use TypeScript for type safety
3. Write tests for new components
4. Follow the existing code style
5. Update documentation

## 📞 Support

For frontend-specific issues:
- Check browser console for errors
- Verify API connectivity
- Check environment variables
- Review component props
- Author - Prabhat Mishra.

---

**Frontend Version:** 1.0.0
**Last Updated:** November 11, 2025
