import properties from '../mockData/properties.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class PropertyService {
  async getAll(filters = {}) {
    await delay(300)
    
    let filteredProperties = [...properties]
    
    // Apply filters
    if (filters.type && filters.type !== 'all') {
      filteredProperties = filteredProperties.filter(p => 
        p.type.toLowerCase() === filters.type.toLowerCase()
      )
    }
    
    if (filters.priceMin) {
      filteredProperties = filteredProperties.filter(p => p.price >= filters.priceMin)
    }
    
    if (filters.priceMax) {
      filteredProperties = filteredProperties.filter(p => p.price <= filters.priceMax)
    }
    
    if (filters.bedrooms) {
      filteredProperties = filteredProperties.filter(p => p.bedrooms >= filters.bedrooms)
    }
    
    if (filters.bathrooms) {
      filteredProperties = filteredProperties.filter(p => p.bathrooms >= filters.bathrooms)
    }
    
    if (filters.location) {
      filteredProperties = filteredProperties.filter(p => 
        p.address.city.toLowerCase().includes(filters.location.toLowerCase()) ||
        p.address.state.toLowerCase().includes(filters.location.toLowerCase()) ||
        p.address.zipCode.includes(filters.location)
      )
    }
    
    return filteredProperties
  }

  async getById(id) {
    await delay(200)
    const property = properties.find(p => p.id === id)
    if (!property) {
      throw new Error('Property not found')
    }
    return { ...property }
  }

  async getByIds(ids) {
    await delay(250)
    return properties.filter(p => ids.includes(p.id)).map(p => ({ ...p }))
  }

  async getFeatured() {
    await delay(300)
    return properties
      .filter(p => p.featured)
      .slice(0, 6)
      .map(p => ({ ...p }))
  }

  async searchByLocation(query) {
    await delay(200)
    const filtered = properties.filter(p => 
      p.address.city.toLowerCase().includes(query.toLowerCase()) ||
      p.address.state.toLowerCase().includes(query.toLowerCase()) ||
      p.address.zipCode.includes(query)
    )
    return filtered.map(p => ({ ...p }))
  }
}

export default new PropertyService()