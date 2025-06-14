import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { propertyService } from '@/services'
import ImageGallery from '@/components/molecules/ImageGallery'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'
import LoadingSpinner from '@/components/atoms/LoadingSpinner'
import ErrorState from '@/components/molecules/ErrorState'

const PropertyDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSaved, setIsSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const loadProperty = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await propertyService.getById(id)
      setProperty(result)
      
      // Check if property is saved
      const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]')
      setIsSaved(savedProperties.includes(id))
    } catch (err) {
      setError(err.message || 'Failed to load property details')
      toast.error('Failed to load property details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProperty()
  }, [id])

  const handleSaveToggle = () => {
    try {
      const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]')
      let updatedSaved
      
      if (isSaved) {
        updatedSaved = savedProperties.filter(savedId => savedId !== id)
        toast.success('Property removed from saved')
      } else {
        updatedSaved = [...savedProperties, id]
        toast.success('Property saved!')
      }
      
      localStorage.setItem('savedProperties', JSON.stringify(updatedSaved))
      setIsSaved(!isSaved)
      
      // Dispatch custom event to update header counter
      window.dispatchEvent(new CustomEvent('savedPropertiesChanged'))
    } catch (error) {
      toast.error('Error saving property')
    }
  }

  const handleContactAgent = () => {
    toast.success('Contact request sent! An agent will reach out to you soon.')
  }

  const handleScheduleTour = () => {
    toast.success('Tour request submitted! We\'ll contact you to confirm the details.')
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <ErrorState 
          message={error}
          onRetry={loadProperty}
        />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ApperIcon name="Home" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Property not found</h3>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')} variant="primary">
            Back to Search
          </Button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'Home' },
    { id: 'features', label: 'Features', icon: 'CheckCircle' },
    { id: 'location', label: 'Location', icon: 'MapPin' }
  ]

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-sm text-gray-600 mb-6"
        >
          <Link to="/" className="hover:text-primary">Home</Link>
          <ApperIcon name="ChevronRight" className="w-4 h-4" />
          <span className="truncate">{property.title}</span>
        </motion.nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ImageGallery images={property.images} title={property.title} />
            </motion.div>

            {/* Property Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-card p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <ApperIcon name="MapPin" className="w-5 h-5 mr-2" />
                    <span>
                      {property.address.street}, {property.address.city}, {property.address.state} {property.address.zipCode}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {formatPrice(property.price)}
                  </div>
                </div>
                
                <Button
                  onClick={handleSaveToggle}
                  variant={isSaved ? 'success' : 'outline'}
                  icon="Heart"
                  className="flex-shrink-0"
                >
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <ApperIcon name="Bed" className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <ApperIcon name="Bath" className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <ApperIcon name="Square" className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-gray-900">{property.sqft?.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Sq Ft</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <ApperIcon name="Home" className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-gray-900">{property.type}</div>
                  <div className="text-sm text-gray-600">Type</div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <ApperIcon name={tab.icon} className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div>
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Description</h3>
                      <p className="text-gray-600 leading-relaxed">{property.description}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Listing Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-500">Listed on:</span>
                          <div className="font-medium">{formatDate(property.listingDate)}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Property Type:</span>
                          <div className="font-medium">{property.type}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'features' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold mb-4">Property Features</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {property.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center"
                        >
                          <ApperIcon name="Check" className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'location' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold mb-4">Location & Neighborhood</h3>
                    <div className="bg-gray-100 rounded-lg p-6 text-center">
                      <ApperIcon name="Map" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="font-semibold mb-2">Interactive Map</h4>
                      <p className="text-gray-600 mb-4">
                        View this property's location and explore the neighborhood
                      </p>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Address:</span>
                          <span className="font-medium">
                            {property.address.street}, {property.address.city}, {property.address.state} {property.address.zipCode}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Coordinates:</span>
                          <span className="font-medium">
                            {property.coordinates.lat.toFixed(4)}, {property.coordinates.lng.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-card p-6 sticky top-24"
            >
              <h3 className="text-lg font-semibold mb-6">Interested in this property?</h3>
              
              <div className="space-y-4">
                <Button
                  onClick={handleContactAgent}
                  variant="primary"
                  size="lg"
                  icon="Phone"
                  className="w-full"
                >
                  Contact Agent
                </Button>
                
                <Button
                  onClick={handleScheduleTour}
                  variant="outline"
                  size="lg"
                  icon="Calendar"
                  className="w-full"
                >
                  Schedule Tour
                </Button>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Share this property:</div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Share2"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href)
                        toast.success('Link copied to clipboard!')
                      }}
                    >
                      Copy Link
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetail