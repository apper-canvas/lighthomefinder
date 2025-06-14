import { motion } from 'framer-motion'
import PropertyCard from '@/components/molecules/PropertyCard'
import SkeletonLoader from '@/components/molecules/SkeletonLoader'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'

const PropertyGrid = ({ 
  properties, 
  loading, 
  error, 
  onRetry,
  onSaveToggle,
  emptyTitle = "No properties found",
  emptyDescription = "Try adjusting your search criteria or filters"
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkeletonLoader count={6} type="card" />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState 
        message={error}
        onRetry={onRetry}
      />
    )
  }

  if (!properties || properties.length === 0) {
    return (
      <EmptyState
        icon="Search"
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property, index) => (
        <motion.div
          key={property.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <PropertyCard 
            property={property}
            onSaveToggle={onSaveToggle}
          />
        </motion.div>
      ))}
    </div>
  )
}

export default PropertyGrid