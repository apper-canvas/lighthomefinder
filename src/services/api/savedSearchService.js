import savedSearches from '../mockData/savedSearches.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class SavedSearchService {
  constructor() {
    this.data = [...savedSearches]
    this.loadFromStorage()
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('savedSearches')
      if (stored) {
        this.data = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading saved searches:', error)
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('savedSearches', JSON.stringify(this.data))
    } catch (error) {
      console.error('Error saving searches:', error)
    }
  }

  async getAll() {
    await delay(200)
    return [...this.data]
  }

  async getById(id) {
    await delay(150)
    const search = this.data.find(s => s.id === id)
    if (!search) {
      throw new Error('Saved search not found')
    }
    return { ...search }
  }

  async create(searchData) {
    await delay(300)
    const newSearch = {
      id: Date.now().toString(),
      ...searchData,
      createdAt: new Date().toISOString()
    }
    this.data.unshift(newSearch)
    this.saveToStorage()
    return { ...newSearch }
  }

  async update(id, updates) {
    await delay(250)
    const index = this.data.findIndex(s => s.id === id)
    if (index === -1) {
      throw new Error('Saved search not found')
    }
    this.data[index] = { ...this.data[index], ...updates }
    this.saveToStorage()
    return { ...this.data[index] }
  }

  async delete(id) {
    await delay(200)
    const index = this.data.findIndex(s => s.id === id)
    if (index === -1) {
      throw new Error('Saved search not found')
    }
    this.data.splice(index, 1)
    this.saveToStorage()
    return true
  }
}

export default new SavedSearchService()