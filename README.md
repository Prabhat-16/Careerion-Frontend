# Careerion - Frontend

Careerion is an AI-powered career guidance platform that helps professionals navigate their career paths using advanced AI technology.

## 🚀 Features

- Modern React 19 with TypeScript
- Responsive design with Tailwind CSS
- React Router for navigation
- Google OAuth integration (Option B: access_token flow)
- AI-powered career coach
- Interactive UI components

## 🛠️ Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS with PostCSS
- **Build Tool**: Vite
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Authentication**: Google OAuth (access_token via `useGoogleLogin`)
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier

## 📦 Prerequisites

- Node.js (v18 or later)
- npm (v9 or later) or yarn
- Backend server (see backend README for setup)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Prabhat-16/Careerion-Frontend.git
   cd Careerion-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Environment Setup**
   Create a `.env` file in the frontend directory:
   ```env
   # Base URL for the backend API
   VITE_API_URL=http://localhost:5001/api

   # Google OAuth Client ID (from Google Cloud Console)
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```
   After editing `.env`, restart the Vite dev server so changes take effect.

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The app will be available at `http://localhost:5173`

## 🔐 Google Auth (Option B: access_token)

This frontend uses the `useGoogleLogin` hook from `@react-oauth/google` to obtain an access_token and sends it to the backend route `POST /api/auth/google`.

- In `src/App.tsx` (within the auth modal), on successful Google sign-in we call:
  ```ts
  axios.post(`${API_URL}/auth/google`, { token: tokenResponse.access_token })
  ```
- Ensure your Google OAuth Client has the following configured in the Google Cloud Console:
  - Authorized JavaScript origins: `http://localhost:5173`
  - Use the generated Client ID in `VITE_GOOGLE_CLIENT_ID`

If you switch to the ID token button (`<GoogleLogin />`), also update the backend to verify ID tokens instead of access tokens.

## 🏗️ Build for Production

```bash
npm run build
# or
yarn build
```

## 🧪 Running Tests

To run the test suite:

```bash
npm test
# or
yarn test
```

## 🧹 Linting

```bash
npm run lint
# or
yarn lint
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google OAuth](https://developers.google.com/identity/protocols/oauth2)

## 📧 Contact

For any questions or feedback, please reach out to [Prabhat Mishra](mprabhat1607@gmail.com).
