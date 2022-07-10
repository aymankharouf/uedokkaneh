import { State, Action, BasketPack } from './types'

const initState: State = {
  categories: [], 
  countries: [], 
  basket: [], 
  orders: [],
  packs: [],
  packPrices: [],
  adverts: [],
  regions: [],
  passwordRequests: [],
  notifications: [],
  searchText: ''
}

const reducer = (state: State = initState, action: Action) => {
  let basketPack: BasketPack, packIndex, packs, nextQuantity, i
  const increment = [0.125, 0.25, 0.5, 0.75, 1]
  switch (action.type){
    case 'ADD_TO_BASKET':
      if (state.basket.find(p => p.pack.id === action.payload.id)) {
        basketPack = state.basket.find(p => p.pack.id === action.payload.id)!
        basketPack = {
          ...basketPack,
          quantity: 1,
          gross: Math.round(basketPack.price)
        }
        packs = state.basket.slice()
        packIndex = packs.findIndex(p => p.pack.id === action.payload.id)
        packs.splice(packIndex, 1, basketPack)
      } else {
        basketPack = {
          pack: action.payload,
          price: action.payload.price,
          status: 'n',
          quantity: 1,
          weight: 0,
          purchased: 0,
          actual: 0,
          overPriced: false,
          gross: action.payload.price
        }
        packs = [...state.basket, basketPack]
      }
      localStorage.setItem('basket', JSON.stringify(packs))
      return {...state, basket: packs}
    case 'INCREASE_QUANTITY':
      basketPack = state.basket.find(p => p.pack.id === action.payload)!
      if (basketPack.pack.quantityType === 'wo') {
        if (basketPack.quantity >= 1) {
          nextQuantity = basketPack.quantity + 0.5
        } else {
          i = increment.indexOf(basketPack.quantity)
          nextQuantity = increment[++i]  
        }
      } else {
        nextQuantity = basketPack.quantity + 1
      }  
      basketPack = {
        ...basketPack,
        quantity: nextQuantity,
        gross: Math.round(basketPack.price * nextQuantity)
      }
      packs = state.basket.slice()
      packIndex = packs.findIndex(p => p.pack.id === action.payload)
      packs.splice(packIndex, 1, basketPack)
      localStorage.setItem('basket', JSON.stringify(packs))
      return {...state, basket: packs}
    case 'DECREASE_QUANTITY':
      basketPack = state.basket.find(p => p.pack.id === action.payload)!
      if (basketPack.pack.quantityType === 'wo') {
        if (basketPack.quantity > 1) {
          nextQuantity = basketPack.quantity - 0.5
        } else {
          i = increment.indexOf(basketPack.quantity)
          nextQuantity = i === 0 ? increment[0] : increment[--i]  
        }
      } else {
        nextQuantity = basketPack.quantity - 1
      }
      packs = state.basket.slice()
      packIndex = packs.findIndex(p => p.pack.id === action.payload)
      basketPack = {
        ...basketPack,
        quantity: nextQuantity,
        gross: Math.round(basketPack.price * nextQuantity)
      }
      packs.splice(packIndex, 1, basketPack)
      localStorage.setItem('basket', JSON.stringify(packs))
      return {...state, basket: packs}
    case 'CLEAR_BASKET':
      localStorage.setItem('basket', JSON.stringify([]))
      return {...state, basket: []}
    case 'SET_BASKET':
      return {...state, basket: action.payload}
    case 'LOGIN':
      return {...state, user: action.payload}
    case 'LOGOUT':
      return {...state, user: undefined}
    case 'SET_CUSTOMER':
      return {...state, customer: action.payload}
    case 'SET_ORDERS':
      return {...state, orders: action.payload}
    case 'SET_PACKS':
      return {...state, packs: action.payload}
    case 'SET_CATEGORIES':
      return {...state, categories: action.payload}
    case 'SET_COUNTRIES':
      return {...state, countries: action.payload}
    case 'SET_PACK_PRICES':
      return {...state, packPrices: action.payload}
    case 'SET_ADVERTS':
      return {...state, adverts: action.payload}
    case 'SET_REGIONS':
      return {...state, regions: action.payload}
    case 'SET_PASSWORD_REQUESTS':
      return {...state, passwordRequests: action.payload}
    case 'SET_NOTIFICATIONS':
      return {...state, notifications: action.payload}
    case 'SET_OPEN_ORDER':
      return {...state, openOrderId: action.payload}
    default:
      return state
  }
}

export default reducer