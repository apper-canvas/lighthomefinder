import { toast } from 'react-toastify'

class CollectionService {
  constructor() {
    this.tableName = 'collection'
    this.apperClient = null
    this.initializeClient()
  }

  initializeClient() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
  }

  // Transform database collection to UI format
  transformFromDatabase(dbCollection) {
    if (!dbCollection) return null
    
    return {
      id: dbCollection.Id,
      name: dbCollection.Name || '',
      propertyIds: dbCollection.property_ids ? dbCollection.property_ids.split(',').filter(Boolean) : [],
      createdAt: dbCollection.created_at || dbCollection.CreatedOn || new Date().toISOString()
    }
  }

  // Transform UI collection to database format
  transformToDatabase(uiCollection) {
    return {
      Name: uiCollection.name || '',
      property_ids: Array.isArray(uiCollection.propertyIds) ? uiCollection.propertyIds.join(',') : (uiCollection.propertyIds || ''),
      created_at: uiCollection.createdAt || new Date().toISOString()
    }
  }

  async getAll() {
    try {
      const params = {
        Fields: ['Id', 'Name', 'Tags', 'Owner', 'property_ids', 'created_at', 'CreatedOn'],
        PagingInfo: {
          Limit: 100,
          Offset: 0
        }
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return (response.data || []).map(collection => this.transformFromDatabase(collection))
    } catch (error) {
      console.error('Error fetching collections:', error)
      toast.error('Failed to load collections')
      return []
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: ['Id', 'Name', 'Tags', 'Owner', 'property_ids', 'created_at', 'CreatedOn']
      }

      const response = await this.apperClient.getRecordById(this.tableName, id, params)

      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      if (!response.data) {
        throw new Error('Collection not found')
      }

      return this.transformFromDatabase(response.data)
    } catch (error) {
      console.error(`Error fetching collection with ID ${id}:`, error)
      throw error
    }
  }

  async create(collectionData) {
    try {
      const params = {
        records: [this.transformToDatabase(collectionData)]
      }

      const response = await this.apperClient.createRecord(this.tableName, params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        const failedRecords = response.results.filter(result => !result.success)

        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) toast.error(record.message)
          })
        }

        if (successfulRecords.length > 0) {
          toast.success('Collection created successfully!')
          return this.transformFromDatabase(successfulRecords[0].data)
        }
      }

      throw new Error('Failed to create collection')
    } catch (error) {
      console.error('Error creating collection:', error)
      throw error
    }
  }

  async update(id, collectionData) {
    try {
      const updateData = this.transformToDatabase(collectionData)
      updateData.Id = id

      const params = {
        records: [updateData]
      }

      const response = await this.apperClient.updateRecord(this.tableName, params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        const failedUpdates = response.results.filter(result => !result.success)

        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`)
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) toast.error(record.message)
          })
        }

        if (successfulUpdates.length > 0) {
          toast.success('Collection updated successfully!')
          return this.transformFromDatabase(successfulUpdates[0].data)
        }
      }

      throw new Error('Failed to update collection')
    } catch (error) {
      console.error('Error updating collection:', error)
      throw error
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [id]
      }

      const response = await this.apperClient.deleteRecord(this.tableName, params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        const failedDeletions = response.results.filter(result => !result.success)

        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`)
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }

        if (successfulDeletions.length > 0) {
          toast.success('Collection deleted successfully!')
          return true
        }
      }

      return false
    } catch (error) {
      console.error('Error deleting collection:', error)
      throw error
    }
  }

  async addProperty(collectionId, propertyId) {
    try {
      // Get current collection
      const collection = await this.getById(collectionId)
      if (!collection.propertyIds.includes(propertyId)) {
        collection.propertyIds.push(propertyId)
        return await this.update(collectionId, collection)
      }
      return collection
    } catch (error) {
      console.error('Error adding property to collection:', error)
      throw error
    }
  }

  async removeProperty(collectionId, propertyId) {
    try {
      // Get current collection
      const collection = await this.getById(collectionId)
      collection.propertyIds = collection.propertyIds.filter(id => id !== propertyId)
      return await this.update(collectionId, collection)
    } catch (error) {
      console.error('Error removing property from collection:', error)
      throw error
    }
  }
}

export default new CollectionService()