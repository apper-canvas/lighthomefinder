import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { propertyService, collectionService } from '@/services'
import PropertyGrid from '@/components/organisms/PropertyGrid'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import ApperIcon from '@/components/ApperIcon'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'

const SavedProperties = () => {
  const [savedProperties, setSavedProperties] = useState([])
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('saved')
  const [showCreateCollection, setShowCreateCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')

const loadSavedProperties = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const collections = await collectionService.getAll()
      const savedCollection = collections.find(c => c.name === 'Saved Properties')
      
      if (savedCollection && savedCollection.propertyIds.length > 0) {
        const properties = await propertyService.getByIds(savedCollection.propertyIds)
        setSavedProperties(properties)
      } else {
        setSavedProperties([])
      }
    } catch (err) {
      setError(err.message || 'Failed to load saved properties')
      toast.error('Failed to load saved properties')
    } finally {
      setLoading(false)
    }
  }

  const loadCollections = async () => {
    try {
      const result = await collectionService.getAll()
      setCollections(result)
    } catch (err) {
      console.error('Failed to load collections:', err)
    }
  }

  useEffect(() => {
    loadSavedProperties()
    loadCollections()
    
    // Listen for changes to saved properties
    const handleStorageChange = () => {
      loadSavedProperties()
      loadCollections()
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('savedPropertiesChanged', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('savedPropertiesChanged', handleStorageChange)
    }
  }, [])

  const handleSaveToggle = (propertyId, isSaved) => {
    if (!isSaved) {
      // Property was removed from saved
      setSavedProperties(prev => prev.filter(p => p.id !== propertyId))
    }
  }

  const handleCreateCollection = async (e) => {
    e.preventDefault()
    if (!newCollectionName.trim()) return

    try {
      const newCollection = await collectionService.create({
        name: newCollectionName.trim(),
        propertyIds: []
      })
      setCollections(prev => [newCollection, ...prev])
      setNewCollectionName('')
      setShowCreateCollection(false)
      toast.success('Collection created successfully!')
    } catch (err) {
      toast.error('Failed to create collection')
    }
  }

  const handleDeleteCollection = async (collectionId) => {
    try {
      await collectionService.delete(collectionId)
      setCollections(prev => prev.filter(c => c.id !== collectionId))
      toast.success('Collection deleted')
    } catch (err) {
      toast.error('Failed to delete collection')
    }
  }

  const tabs = [
    { id: 'saved', label: 'Saved Properties', icon: 'Heart' },
    { id: 'collections', label: 'Collections', icon: 'Folder' }
  ]

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
            Saved Properties
          </h1>
          <p className="text-lg text-gray-600">
            Manage your saved properties and organize them into collections
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border-b border-gray-200 mb-8"
        >
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
                {tab.id === 'saved' && savedProperties.length > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 text-xs rounded-full px-2 py-1">
                    {savedProperties.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab === 'saved' && (
            <div>
              {savedProperties.length === 0 && !loading && !error ? (
                <EmptyState
                  icon="Heart"
                  title="No saved properties yet"
                  description="Start browsing properties and save your favorites to see them here"
                  actionLabel="Browse Properties"
                  onAction={() => window.location.href = '/'}
                />
              ) : (
                <PropertyGrid
                  properties={savedProperties}
                  loading={loading}
                  error={error}
                  onRetry={loadSavedProperties}
                  onSaveToggle={handleSaveToggle}
                  emptyTitle="No saved properties"
                  emptyDescription="Your saved properties will appear here"
                />
              )}
            </div>
          )}

          {activeTab === 'collections' && (
            <div className="space-y-6">
              {/* Create Collection */}
              <div className="bg-white rounded-lg shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Collections</h3>
                  <Button
                    onClick={() => setShowCreateCollection(!showCreateCollection)}
                    variant="primary"
                    icon="Plus"
                  >
                    New Collection
                  </Button>
                </div>

                {showCreateCollection && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    onSubmit={handleCreateCollection}
                    className="mb-6"
                  >
                    <div className="flex gap-3">
                      <Input
                        type="text"
                        placeholder="Collection name"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" variant="primary">
                        Create
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setShowCreateCollection(false)
                          setNewCollectionName('')
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.form>
                )}
              </div>

              {/* Collections List */}
              {collections.length === 0 ? (
                <EmptyState
                  icon="Folder"
                  title="No collections yet"
                  description="Create collections to organize your saved properties by themes, locations, or any criteria you choose"
                  actionLabel="Create Your First Collection"
                  onAction={() => setShowCreateCollection(true)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collections.map((collection, index) => (
                    <motion.div
                      key={collection.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg shadow-card p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                            <ApperIcon name="Folder" className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{collection.name}</h4>
                            <p className="text-sm text-gray-600">
                              {collection.propertyIds.length} {collection.propertyIds.length === 1 ? 'property' : 'properties'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteCollection(collection.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <ApperIcon name="Trash2" className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Created {new Date(collection.createdAt).toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default SavedProperties