import { motion } from 'framer-motion'

const SkeletonLoader = ({ count = 3, type = 'card' }) => {
  const cardSkeleton = (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
        </div>
      </div>
    </div>
  )

  const listSkeleton = (
    <div className="bg-white rounded-lg shadow-sm p-4 flex space-x-4">
      <div className="w-20 h-16 bg-gray-200 rounded animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
      </div>
    </div>
  )

  const skeletonElement = type === 'card' ? cardSkeleton : listSkeleton

  return (
    <div className={`space-y-4 ${type === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : ''}`}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          {skeletonElement}
        </motion.div>
      ))}
    </div>
  )
}

export default SkeletonLoader