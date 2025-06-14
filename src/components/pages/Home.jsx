import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { propertyService } from '@/services'
import SearchBar from '@/components/molecules/SearchBar'
import FilterPanel from '@/components/molecules/FilterPanel'
import PropertyGrid from '@/components/organisms/PropertyGrid'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const Home = () => {
  const location = useLocation()
  const isRentPage = location.pathname === '/rent'
  
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  
  const [filters, setFilters] = useState({
    type: isRentPage ? 'apartment' : 'all',
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    bathrooms: '',
    location: ''
  })

  const loadProperties = async (searchFilters = filters) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await propertyService.getAll(searchFilters)
      setProperties(result)
    } catch (err) {
      setError(err.message || 'Failed to load properties')
      toast.error('Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProperties()
  }, [])

  useEffect(() => {
    // Update filters when switching between Buy and Rent
    const newFilters = {
      ...filters,
      type: isRentPage ? 'apartment' : 'all'
    }
    setFilters(newFilters)
    loadProperties(newFilters)
  }, [isRentPage])

  const handleSearch = (query) => {
    const searchFilters = {
      ...filters,
      location: query
    }
    setFilters(searchFilters)
    loadProperties(searchFilters)
  }

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    loadProperties(newFilters)
  }

  const handleSaveToggle = (propertyId, isSaved) => {
    // Property save/unsave is handled in PropertyCard component
    // This callback can be used for additional logic if needed
  }

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== '' && value !== 'all'
  ).length

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            {isRentPage ? 'Find Your Perfect Rental' : 'Find Your Dream Home'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            {isRentPage 
              ? 'Discover amazing rental properties in your desired location'
              : 'Discover the perfect property with our comprehensive search tools'
            }
          </p>
          
          <SearchBar onSearch={handleSearch} />
        </motion.div>

        {/* Filters and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
              icon="Filter"
              className="relative"
            >
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
            
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const clearedFilters = {
                    type: isRentPage ? 'apartment' : 'all',
                    priceMin: '',
                    priceMax: '',
                    bedrooms: '',
                    bathrooms: '',
                    location: ''
                  }
                  handleFiltersChange(clearedFilters)
                }}
                icon="X"
              >
                Clear Filters
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
            </span>
            
            <div className="flex border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ApperIcon name="Grid3X3" className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ApperIcon name="List" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Properties Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <PropertyGrid
            properties={properties}
            loading={loading}
            error={error}
            onRetry={loadProperties}
            onSaveToggle={handleSaveToggle}
            emptyTitle={isRentPage ? "No rental properties found" : "No properties found"}
            emptyDescription="Try adjusting your search criteria or location"
          />
        </motion.div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClose={() => setShowFilters(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Home