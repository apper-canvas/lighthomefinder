import collections from '../mockData/collections.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class CollectionService {
  constructor() {
    this.data = [...collections]
    this.loadFromStorage()
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('collections')
      if (stored) {
        this.data = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading collections:', error)
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('collections', JSON.stringify(this.data))
    } catch (error) {
      console.error('Error saving collections:', error)
    }
  }

  async getAll() {
    await delay(200)
    return [...this.data]
  }

  async getById(id) {
    await delay(150)
    const collection = this.data.find(c => c.id === id)
    if (!collection) {
      throw new Error('Collection not found')
    }
    return { ...collection }
  }

  async create(collectionData) {
    await delay(300)
    const newCollection = {
      id: Date.now().toString(),
      ...collectionData,
      createdAt: new Date().toISOString(),
      propertyIds: collectionData.propertyIds || []
    }
    this.data.unshift(newCollection)
    this.saveToStorage()
    return { ...newCollection }
  }

  async update(id, updates) {
    await delay(250)
    const index = this.data.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error('Collection not found')
    }
    this.data[index] = { ...this.data[index], ...updates }
    this.saveToStorage()
    return { ...this.data[index] }
  }

  async delete(id) {
    await delay(200)
    const index = this.data.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error('Collection not found')
    }
    this.data.splice(index, 1)
    this.saveToStorage()
    return true
  }

  async addProperty(collectionId, propertyId) {
    await delay(200)
    const collection = this.data.find(c => c.id === collectionId)
    if (!collection) {
      throw new Error('Collection not found')
    }
    if (!collection.propertyIds.includes(propertyId)) {
      collection.propertyIds.push(propertyId)
      this.saveToStorage()
    }
    return { ...collection }
  }

  async removeProperty(collectionId, propertyId) {
    await delay(200)
    const collection = this.data.find(c => c.id === collectionId)
    if (!collection) {
      throw new Error('Collection not found')
    }
    collection.propertyIds = collection.propertyIds.filter(id => id !== propertyId)
    this.saveToStorage()
    return { ...collection }
  }
}

export default new CollectionService()