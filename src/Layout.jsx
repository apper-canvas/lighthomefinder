import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import { routes } from '@/config/routes'
import { propertyService } from '@/services'

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const location = useLocation()

useEffect(() => {
    const loadSavedCount = async () => {
      try {
        // Get saved count from collections instead of localStorage
        const collections = await propertyService.getAll({ type: 'saved' })
        setSavedCount(collections.length)
      } catch (error) {
        setSavedCount(0)
      }
    }

    loadSavedCount()
    
    // Listen for changes to saved properties
    const handleStorageChange = () => {
      loadSavedCount()
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('savedPropertiesChanged', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('savedPropertiesChanged', handleStorageChange)
    }
  }, [])

  const visibleRoutes = Object.values(routes).filter(route => !route.hidden)

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 z-40 sticky top-0 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <NavLink to="/" className="flex items-center">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <ApperIcon name="Home" className="w-6 h-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-display font-semibold text-gray-900">
                  HomeFinder Pro
                </span>
              </NavLink>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {visibleRoutes.map((route) => (
                <NavLink
                  key={route.id}
                  to={route.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                    }`
                  }
                >
                  <ApperIcon name={route.icon} className="w-4 h-4 mr-2" />
                  {route.label}
                  {route.id === 'saved' && savedCount > 0 && (
                    <span className="ml-2 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {savedCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors duration-200"
              >
                <ApperIcon 
                  name={isMobileMenuOpen ? "X" : "Menu"} 
                  className="w-6 h-6" 
                />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-200 bg-white"
            >
              <div className="px-4 py-3 space-y-1">
                {visibleRoutes.map((route) => (
                  <NavLink
                    key={route.id}
                    to={route.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                        isActive
                          ? 'text-primary bg-primary/10'
                          : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                      }`
                    }
                  >
                    <ApperIcon name={route.icon} className="w-5 h-5 mr-3" />
                    {route.label}
                    {route.id === 'saved' && savedCount > 0 && (
                      <span className="ml-auto bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {savedCount}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}

export default Layout