import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import ApperIcon from '@/components/ApperIcon'

const FilterPanel = ({ filters, onFiltersChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters)

  const propertyTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'house', label: 'House' },
    { value: 'condo', label: 'Condo' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'townhouse', label: 'Townhouse' }
  ]

  const bedroomOptions = [
    { value: '', label: 'Any' },
    { value: 1, label: '1+' },
    { value: 2, label: '2+' },
    { value: 3, label: '3+' },
    { value: 4, label: '4+' }
  ]

  const bathroomOptions = [
    { value: '', label: 'Any' },
    { value: 1, label: '1+' },
    { value: 2, label: '2+' },
    { value: 3, label: '3+' }
  ]

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      type: 'all',
      priceMin: '',
      priceMax: '',
      bedrooms: '',
      bathrooms: '',
      location: ''
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold font-display">Filters</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ApperIcon name="X" className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {propertyTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => handleFilterChange('type', type.value)}
                    className={`p-3 text-sm rounded-lg border transition-colors ${
                      localFilters.type === type.value
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min Price"
                  value={localFilters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  icon="DollarSign"
                />
                <Input
                  type="number"
                  placeholder="Max Price"
                  value={localFilters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  icon="DollarSign"
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms
              </label>
              <div className="flex gap-2">
                {bedroomOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange('bedrooms', option.value)}
                    className={`flex-1 p-2 text-sm rounded-lg border transition-colors ${
                      localFilters.bedrooms === option.value
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bathrooms
              </label>
              <div className="flex gap-2">
                {bathroomOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange('bathrooms', option.value)}
                    className={`flex-1 p-2 text-sm rounded-lg border transition-colors ${
                      localFilters.bathrooms === option.value
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <Input
                label="Location"
                type="text"
                placeholder="City, State, or ZIP"
                value={localFilters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                icon="MapPin"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex-1"
            >
              Clear All
            </Button>
            <Button
              variant="primary"
              onClick={handleApplyFilters}
              className="flex-1"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default FilterPanel