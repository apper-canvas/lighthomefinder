import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'

const PropertyCard = ({ property, onSaveToggle }) => {
  const [isSaved, setIsSaved] = useState(() => {
    const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]')
    return savedProperties.includes(property.id)
  })
  
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleSaveToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]')
      let updatedSaved
      
      if (isSaved) {
        updatedSaved = savedProperties.filter(id => id !== property.id)
        toast.success('Property removed from saved')
      } else {
        updatedSaved = [...savedProperties, property.id]
        toast.success('Property saved!')
      }
      
      localStorage.setItem('savedProperties', JSON.stringify(updatedSaved))
      setIsSaved(!isSaved)
      
      // Dispatch custom event to update header counter
      window.dispatchEvent(new CustomEvent('savedPropertiesChanged'))
      
      if (onSaveToggle) {
        onSaveToggle(property.id, !isSaved)
      }
    } catch (error) {
      toast.error('Error saving property')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-card overflow-hidden group"
    >
      <Link to={`/property/${property.id}`} className="block">
        <div className="relative overflow-hidden h-48">
          {/* Image placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <ApperIcon name="Image" className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          {/* Main image */}
          <motion.img
            src={property.images[0]}
            alt={property.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Save button */}
          <motion.button
            onClick={handleSaveToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md z-10"
          >
            <motion.div
              animate={{ scale: isSaved ? [1, 1.3, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              <ApperIcon 
                name="Heart" 
                className={`w-5 h-5 ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-600'}`}
              />
            </motion.div>
          </motion.button>
          
          {/* Property type badge */}
          <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            {property.type}
          </div>
          
          {/* Price overlay */}
          <div className="absolute bottom-3 left-3 text-white">
            <div className="text-2xl font-bold font-display">
              {formatPrice(property.price)}
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold font-display text-gray-900 mb-2 line-clamp-2">
            {property.title}
          </h3>
          
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <ApperIcon name="MapPin" className="w-4 h-4 mr-1" />
            <span className="truncate">
              {property.address.city}, {property.address.state}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <ApperIcon name="Bed" className="w-4 h-4 mr-1" />
                <span>{property.bedrooms} bed</span>
              </div>
              <div className="flex items-center">
                <ApperIcon name="Bath" className="w-4 h-4 mr-1" />
                <span>{property.bathrooms} bath</span>
              </div>
            </div>
            <div className="text-gray-500">
              {property.sqft?.toLocaleString()} sqft
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default PropertyCard