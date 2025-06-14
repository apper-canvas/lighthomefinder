import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'

const MapView = ({ properties = [], selectedProperty, onPropertySelect }) => {
  const [mapCenter, setMapCenter] = useState({ lat: 39.8283, lng: -98.5795 }) // Center of US
  const [zoom, setZoom] = useState(4)

  // Mock map implementation since we don't have access to Google Maps
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handlePropertyClick = (property) => {
    if (onPropertySelect) {
      onPropertySelect(property)
    }
  }

  const zoomIn = () => setZoom(prev => Math.min(prev + 1, 18))
  const zoomOut = () => setZoom(prev => Math.max(prev - 1, 1))

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Mock map background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#ccc" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        <Button
          onClick={zoomIn}
          variant="outline"
          size="sm"
          className="w-10 h-10 p-0 bg-white shadow-md"
        >
          <ApperIcon name="Plus" className="w-4 h-4" />
        </Button>
        <Button
          onClick={zoomOut}
          variant="outline"
          size="sm"
          className="w-10 h-10 p-0 bg-white shadow-md"
        >
          <ApperIcon name="Minus" className="w-4 h-4" />
        </Button>
      </div>

      {/* Property markers */}
      <div className="absolute inset-0">
        {properties.map((property, index) => {
          // Mock positioning based on property index for demo
          const mockPosition = {
            left: `${20 + (index * 12) % 60}%`,
            top: `${30 + (index * 8) % 40}%`
          }

          return (
            <motion.div
              key={property.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
              style={mockPosition}
              onClick={() => handlePropertyClick(property)}
            >
              <div className={`relative group ${
                selectedProperty?.id === property.id ? 'z-30' : 'z-10'
              }`}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`bg-white rounded-lg shadow-lg p-2 border-2 transition-all ${
                    selectedProperty?.id === property.id 
                      ? 'border-primary bg-primary text-white' 
                      : 'border-white hover:border-primary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ApperIcon name="Home" className="w-4 h-4" />
                    <span className="text-sm font-semibold whitespace-nowrap">
                      {formatPrice(property.price)}
                    </span>
                  </div>
                </motion.div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs rounded-lg p-3 whitespace-nowrap">
                    <div className="font-semibold">{property.title}</div>
                    <div className="text-gray-300">
                      {property.bedrooms} bed, {property.bathrooms} bath
                    </div>
                    <div className="text-gray-300">
                      {property.address.city}, {property.address.state}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 z-20">
        <div className="text-sm font-medium mb-2">Map Legend</div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ApperIcon name="Home" className="w-4 h-4" />
          <span>Property Location</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Click markers to view details
        </div>
      </div>

      {/* Zoom level indicator */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md px-3 py-2 z-20">
        <div className="text-sm font-medium">Zoom: {zoom}</div>
      </div>
    </div>
  )
}

export default MapView