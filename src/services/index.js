export { default as propertyService } from './api/propertyService'
export { default as savedSearchService } from './api/savedSearchService'
export { default as collectionService } from './api/collectionService'

// Authentication utilities
export const getAuthenticatedUser = () => {
  try {
    const { ApperClient } = window.ApperSDK
    return ApperClient.getCurrentUser()
  } catch (error) {
    console.error('Error getting authenticated user:', error)
    return null
  }
}