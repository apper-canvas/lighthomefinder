import { toast } from 'react-toastify'

class SavedSearchService {
  constructor() {
    this.tableName = 'saved_search'
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

  // Transform database saved search to UI format
  transformFromDatabase(dbSearch) {
    if (!dbSearch) return null
    
    return {
      id: dbSearch.Id,
      name: dbSearch.Name || '',
      filters: {
        type: dbSearch.search_type || '',
        priceMax: dbSearch.price_max || null,
        location: dbSearch.location || ''
      },
      createdAt: dbSearch.created_at || dbSearch.CreatedOn || new Date().toISOString(),
      notifications: dbSearch.notifications || false
    }
  }

  // Transform UI saved search to database format
  transformToDatabase(uiSearch) {
    return {
      Name: uiSearch.name || '',
      search_type: uiSearch.filters?.type || '',
      price_max: uiSearch.filters?.priceMax || null,
      location: uiSearch.filters?.location || '',
      created_at: uiSearch.createdAt || new Date().toISOString(),
      notifications: !!uiSearch.notifications
    }
  }

  async getAll() {
    try {
      const params = {
        Fields: ['Id', 'Name', 'Tags', 'Owner', 'search_type', 'price_max', 'location', 'created_at', 'notifications', 'CreatedOn'],
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

      return (response.data || []).map(search => this.transformFromDatabase(search))
    } catch (error) {
      console.error('Error fetching saved searches:', error)
      toast.error('Failed to load saved searches')
      return []
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: ['Id', 'Name', 'Tags', 'Owner', 'search_type', 'price_max', 'location', 'created_at', 'notifications', 'CreatedOn']
      }

      const response = await this.apperClient.getRecordById(this.tableName, id, params)

      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      if (!response.data) {
        throw new Error('Saved search not found')
      }

      return this.transformFromDatabase(response.data)
    } catch (error) {
      console.error(`Error fetching saved search with ID ${id}:`, error)
      throw error
    }
  }

  async create(searchData) {
    try {
      const params = {
        records: [this.transformToDatabase(searchData)]
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
          toast.success('Saved search created successfully!')
          return this.transformFromDatabase(successfulRecords[0].data)
        }
      }

      throw new Error('Failed to create saved search')
    } catch (error) {
      console.error('Error creating saved search:', error)
      throw error
    }
  }

  async update(id, searchData) {
    try {
      const updateData = this.transformToDatabase(searchData)
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
          toast.success('Saved search updated successfully!')
          return this.transformFromDatabase(successfulUpdates[0].data)
        }
      }

      throw new Error('Failed to update saved search')
    } catch (error) {
      console.error('Error updating saved search:', error)
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
          toast.success('Saved search deleted successfully!')
          return true
        }
      }

      return false
    } catch (error) {
      console.error('Error deleting saved search:', error)
      throw error
    }
  }
}

export default new SavedSearchService()