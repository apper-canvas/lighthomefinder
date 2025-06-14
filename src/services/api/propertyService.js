import { toast } from 'react-toastify'

class PropertyService {
  constructor() {
    this.tableName = 'property'
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

  // Transform database property to UI format
  transformFromDatabase(dbProperty) {
    if (!dbProperty) return null
    
    return {
      id: dbProperty.Id,
      title: dbProperty.title || '',
      price: dbProperty.price || 0,
      type: dbProperty.type || '',
      bedrooms: dbProperty.bedrooms || 0,
      bathrooms: dbProperty.bathrooms || 0,
      sqft: dbProperty.sqft || 0,
      address: {
        street: dbProperty.street || '',
        city: dbProperty.city || '',
        state: dbProperty.state || '',
        zipCode: dbProperty.zip_code || ''
      },
      coordinates: {
        lat: dbProperty.lat || 0,
        lng: dbProperty.lng || 0
      },
      images: dbProperty.images ? dbProperty.images.split('\n').filter(Boolean) : [],
      description: dbProperty.description || '',
      features: dbProperty.features ? dbProperty.features.split('\n').filter(Boolean) : [],
      listingDate: dbProperty.listing_date || new Date().toISOString(),
      featured: dbProperty.featured || false
    }
  }

  // Transform UI property to database format
  transformToDatabase(uiProperty) {
    return {
      title: uiProperty.title || '',
      price: uiProperty.price || 0,
      type: uiProperty.type || '',
      bedrooms: uiProperty.bedrooms || 0,
      bathrooms: uiProperty.bathrooms || 0,
      sqft: uiProperty.sqft || 0,
      street: uiProperty.address?.street || '',
      city: uiProperty.address?.city || '',
      state: uiProperty.address?.state || '',
      zip_code: uiProperty.address?.zipCode || '',
      lat: uiProperty.coordinates?.lat || 0,
      lng: uiProperty.coordinates?.lng || 0,
      images: Array.isArray(uiProperty.images) ? uiProperty.images.join('\n') : (uiProperty.images || ''),
      description: uiProperty.description || '',
      features: Array.isArray(uiProperty.features) ? uiProperty.features.join('\n') : (uiProperty.features || ''),
      listing_date: uiProperty.listingDate || new Date().toISOString(),
      featured: !!uiProperty.featured
    }
  }

  async getAll(filters = {}) {
    try {
      const params = {
        Fields: [
          'Id', 'Name', 'Tags', 'Owner', 'title', 'price', 'type', 'bedrooms', 'bathrooms', 
          'sqft', 'street', 'city', 'state', 'zip_code', 'lat', 'lng', 'images', 
          'description', 'features', 'listing_date', 'featured'
        ],
        where: [],
        PagingInfo: {
          Limit: 100,
          Offset: 0
        }
      }

      // Apply filters
      if (filters.type && filters.type !== 'all') {
        params.where.push({
          FieldName: 'type',
          Operator: 'ExactMatch',
          Values: [filters.type]
        })
      }

      if (filters.priceMin) {
        params.where.push({
          FieldName: 'price',
          Operator: 'GreaterThanOrEqualTo',
          Values: [filters.priceMin]
        })
      }

      if (filters.priceMax) {
        params.where.push({
          FieldName: 'price',
          Operator: 'LessThanOrEqualTo',
          Values: [filters.priceMax]
        })
      }

      if (filters.bedrooms) {
        params.where.push({
          FieldName: 'bedrooms',
          Operator: 'GreaterThanOrEqualTo',
          Values: [filters.bedrooms]
        })
      }

      if (filters.bathrooms) {
        params.where.push({
          FieldName: 'bathrooms',
          Operator: 'GreaterThanOrEqualTo',
          Values: [filters.bathrooms]
        })
      }

      if (filters.location) {
        params.whereGroups = [{
          operator: 'OR',
          SubGroups: [
            {
              conditions: [{
                FieldName: 'city',
                Operator: 'Contains',
                Values: [filters.location]
              }],
              operator: ''
            },
            {
              conditions: [{
                FieldName: 'state',
                Operator: 'Contains',
                Values: [filters.location]
              }],
              operator: ''
            },
            {
              conditions: [{
                FieldName: 'zip_code',
                Operator: 'Contains',
                Values: [filters.location]
              }],
              operator: ''
            }
          ]
        }]
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return (response.data || []).map(property => this.transformFromDatabase(property))
    } catch (error) {
      console.error('Error fetching properties:', error)
      toast.error('Failed to load properties')
      return []
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          'Id', 'Name', 'Tags', 'Owner', 'title', 'price', 'type', 'bedrooms', 'bathrooms', 
          'sqft', 'street', 'city', 'state', 'zip_code', 'lat', 'lng', 'images', 
          'description', 'features', 'listing_date', 'featured'
        ]
      }

      const response = await this.apperClient.getRecordById(this.tableName, id, params)

      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      if (!response.data) {
        throw new Error('Property not found')
      }

      return this.transformFromDatabase(response.data)
    } catch (error) {
      console.error(`Error fetching property with ID ${id}:`, error)
      throw error
    }
  }

  async getByIds(ids) {
    try {
      if (!ids || ids.length === 0) return []

      const params = {
        Fields: [
          'Id', 'Name', 'Tags', 'Owner', 'title', 'price', 'type', 'bedrooms', 'bathrooms', 
          'sqft', 'street', 'city', 'state', 'zip_code', 'lat', 'lng', 'images', 
          'description', 'features', 'listing_date', 'featured'
        ],
        where: [{
          FieldName: 'Id',
          Operator: 'Contains',
          Values: ids
        }]
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params)

      if (!response.success) {
        console.error(response.message)
        return []
      }

      return (response.data || []).map(property => this.transformFromDatabase(property))
    } catch (error) {
      console.error('Error fetching properties by IDs:', error)
      return []
    }
  }

  async getFeatured() {
    try {
      const params = {
        Fields: [
          'Id', 'Name', 'Tags', 'Owner', 'title', 'price', 'type', 'bedrooms', 'bathrooms', 
          'sqft', 'street', 'city', 'state', 'zip_code', 'lat', 'lng', 'images', 
          'description', 'features', 'listing_date', 'featured'
        ],
        where: [{
          FieldName: 'featured',
          Operator: 'ExactMatch',
          Values: [true]
        }],
        PagingInfo: {
          Limit: 6,
          Offset: 0
        }
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params)

      if (!response.success) {
        console.error(response.message)
        return []
      }

      return (response.data || []).map(property => this.transformFromDatabase(property))
    } catch (error) {
      console.error('Error fetching featured properties:', error)
      return []
    }
  }

  async searchByLocation(query) {
    if (!query) return []

    try {
      const params = {
        Fields: [
          'Id', 'Name', 'Tags', 'Owner', 'title', 'price', 'type', 'bedrooms', 'bathrooms', 
          'sqft', 'street', 'city', 'state', 'zip_code', 'lat', 'lng', 'images', 
          'description', 'features', 'listing_date', 'featured'
        ],
        whereGroups: [{
          operator: 'OR',
          SubGroups: [
            {
              conditions: [{
                FieldName: 'city',
                Operator: 'Contains',
                Values: [query]
              }],
              operator: ''
            },
            {
              conditions: [{
                FieldName: 'state',
                Operator: 'Contains',
                Values: [query]
              }],
              operator: ''
            },
            {
              conditions: [{
                FieldName: 'zip_code',
                Operator: 'Contains',
                Values: [query]
              }],
              operator: ''
            }
          ]
        }]
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params)

      if (!response.success) {
        console.error(response.message)
        return []
      }

      return (response.data || []).map(property => this.transformFromDatabase(property))
    } catch (error) {
      console.error('Error searching properties by location:', error)
      return []
    }
  }

  async create(propertyData) {
    try {
      const params = {
        records: [this.transformToDatabase(propertyData)]
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
          toast.success('Property created successfully!')
          return this.transformFromDatabase(successfulRecords[0].data)
        }
      }

      throw new Error('Failed to create property')
    } catch (error) {
      console.error('Error creating property:', error)
      throw error
    }
  }

  async update(id, propertyData) {
    try {
      const updateData = this.transformToDatabase(propertyData)
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
          toast.success('Property updated successfully!')
          return this.transformFromDatabase(successfulUpdates[0].data)
        }
      }

      throw new Error('Failed to update property')
    } catch (error) {
      console.error('Error updating property:', error)
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
          toast.success('Property deleted successfully!')
          return true
        }
      }

      return false
    } catch (error) {
      console.error('Error deleting property:', error)
      throw error
    }
  }
}

export default new PropertyService()