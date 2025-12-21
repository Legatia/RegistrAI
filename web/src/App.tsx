import { LandingPage } from './pages/LandingPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { DocsPage } from './pages/DocsPage'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-protex-bg font-sans text-white">
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/agent/:id" element={
                <>
                  <Navbar />
                  <ProfilePage />
                </>
              } />
              <Route path="/register" element={
                <>
                  <Navbar />
                  <RegisterPage />
                </>
              } />
              <Route path="/dashboard" element={
                <>
                  <Navbar />
                  <DashboardPage />
                </>
              } />
              <Route path="/docs" element={
                <>
                  <Navbar />
                  <DocsPage />
                </>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

// Simple Dashboard placeholder
function DashboardPage() {
  return (
    <div className="container mx-auto pt-40 px-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-protex-muted">Your registered agents and chain info will appear here.</p>
    </div>
  )
}

export default App
