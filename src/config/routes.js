import Home from '@/components/pages/Home'
import PropertyDetail from '@/components/pages/PropertyDetail'
import MapView from '@/components/pages/MapView'
import SavedProperties from '@/components/pages/SavedProperties'

export const routes = {
  home: {
    id: 'home',
    label: 'Buy',
    path: '/',
    icon: 'Home',
    component: Home
  },
  rent: {
    id: 'rent', 
    label: 'Rent',
    path: '/rent',
    icon: 'Building',
    component: Home
  },
  saved: {
    id: 'saved',
    label: 'Saved',
    path: '/saved',
    icon: 'Heart',
    component: SavedProperties
  },
  map: {
    id: 'map',
    label: 'Map View',
    path: '/map',
    icon: 'Map',
    component: MapView
  },
  propertyDetail: {
    id: 'propertyDetail',
    label: 'Property Detail',
    path: '/property/:id',
    icon: 'Building',
    component: PropertyDetail,
    hidden: true
  }
}

export const routeArray = Object.values(routes)
export default routes