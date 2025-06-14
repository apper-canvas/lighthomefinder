import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { propertyService } from '@/services'
import MapView from '@/components/organisms/MapView'
import PropertyCard from '@/components/molecules/PropertyCard'
import FilterPanel from '@/components/molecules/FilterPanel'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'
import LoadingSpinner from '@/components/atoms/LoadingSpinner'
import ErrorState from '@/components/molecules/ErrorState'

const MapViewPage = () => {
  const navigate = useNavigate()
  
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showPropertyPanel, setShowPropertyPanel] = useState(false)
  
  const [filters, setFilters] = useState({
    type: 'all',
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
      setProperties(result || [])
    } catch (err) {
      setError(err.message || 'Failed to load properties')
      toast.error('Failed to load properties')
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProperties()
  }, [])

  const handlePropertySelect = (property) => {
    setSelectedProperty(property)
    setShowPropertyPanel(true)
  }

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    loadProperties(newFilters)
  }

  const handleViewDetails = (propertyId) => {
    navigate(`/property/${propertyId}`)
  }

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== '' && value !== 'all'
  ).length

  if (loading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <ErrorState 
          message={error}
          onRetry={loadProperties}
        />
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-50 relative">
      {/* Map Container */}
      <div className="absolute inset-0">
        <MapView 
          properties={properties}
          selectedProperty={selectedProperty}
          onPropertySelect={handlePropertySelect}
        />
      </div>

      {/* Top Controls */}
      <div className="absolute top-4 left-4 z-30 flex gap-2">
        <Button
          variant="outline"
          onClick={() => setShowFilters(true)}
          icon="Filter"
          className="bg-white shadow-lg relative"
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
            onClick={() => {
              const clearedFilters = {
                type: 'all',
                priceMin: '',
                priceMax: '',
                bedrooms: '',
                bathrooms: '',
                location: ''
              }
              handleFiltersChange(clearedFilters)
            }}
            icon="X"
            className="bg-white shadow-lg"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Property Count */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-white rounded-lg shadow-lg px-4 py-2">
          <span className="text-sm font-medium">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
          </span>
        </div>
      </div>

      {/* Property Details Panel */}
      {showPropertyPanel && selectedProperty && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="absolute right-0 top-0 bottom-0 w-96 bg-white shadow-xl z-40 overflow-y-auto"
        >
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Property Details</h3>
            <button
              onClick={() => setShowPropertyPanel(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ApperIcon name="X" className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4">
            <PropertyCard 
              property={selectedProperty}
              onSaveToggle={() => {}} // Handle save toggle if needed
            />
            
            <div className="mt-4 space-y-2">
              <Button
                onClick={() => handleViewDetails(selectedProperty.id)}
                variant="primary"
                size="lg"
                className="w-full"
              >
                View Full Details
              </Button>
              
              <Button
                onClick={() => {
                  toast.success('Contact request sent!')
                }}
                variant="outline"
                size="md"
                icon="Phone"
                className="w-full"
              >
                Contact Agent
              </Button>
            </div>
            
            {/* Property Quick Info */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Address:</span>
                <span className="font-medium text-right">
                  {selectedProperty.address.street}<br />
                  {selectedProperty.address.city}, {selectedProperty.address.state}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Listed:</span>
                <span className="font-medium">
                  {new Date(selectedProperty.listingDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  )
}

export default MapViewPage