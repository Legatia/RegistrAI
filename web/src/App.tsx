import { LandingPage } from './pages/LandingPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { DocsPage } from './pages/DocsPage'
import { DashboardPage } from './pages/DashboardPage'
import { AgentListPage } from './pages/AgentListPage'
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
              <Route path="/agents" element={
                <>
                  <Navbar />
                  <AgentListPage />
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

export default App

