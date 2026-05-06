import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-[#1a2b6b] font-bold text-xl tracking-tight">
          LawyerLink
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/lawyers"
            className="text-sm font-medium text-gray-600 hover:text-[#1a2b6b] transition-colors"
          >
            Find Lawyers
          </Link>
          <Link
            to="/chat"
            className="text-sm font-medium text-gray-600 hover:text-[#1a2b6b] transition-colors"
          >
            AI Assistant
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-gray-700 hover:text-[#1a2b6b] transition-colors px-3 py-1.5"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold bg-[#1a2b6b] text-white px-5 py-2 rounded-md hover:bg-[#152358] transition-colors"
          >
            Sign Up
          </Link>
        </div>

      </div>
    </header>
  )
}