import { State, Action } from './types'

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
  orderBasket: [],
  notifications: [],
  searchText: ''
}

const reducer = (state: State = initState, action: Action) => {
  let pack, packIndex, packs, nextQuantity, i
  const increment = [0.125, 0.25, 0.5, 0.75, 1]
  switch (action.type){
    case 'ADD_TO_BASKET':
      if (state.basket.find(p => p.packId === action.payload.id)) return state
      pack = {
        packId: action.payload.id,
        productId: action.payload.productId,
        productName: action.payload.productName,
        productAlias: action.payload.productAlias,
        packName: action.payload.name,
        imageUrl: action.payload.imageUrl,
        price: action.payload.price,
        quantity: 1,
        isDivided: action.payload.isDivided,
        byWeight: action.payload.byWeight,
        maxQuantity: action.payload.maxQuantity,
        offerId: action.payload.offerId,
        closeExpired: action.payload.closeExpired
      }
      packs = [...state.basket, pack]
      localStorage.setItem('basket', JSON.stringify(packs))
      return {...state, basket: packs}
    case 'INCREASE_QUANTITY':
      if (action.payload.maxQuantity && action.payload.quantity >= action.payload.maxQuantity) {
        nextQuantity = action.payload.quantity
      } else {
        if (action.payload.isDivided) {
          if (action.payload.quantity >= 1) {
            nextQuantity = action.payload.quantity + 0.5
          } else {
            i = increment.indexOf(action.payload.quantity)
            nextQuantity = increment[++i]  
          }
        } else {
          nextQuantity = action.payload.quantity + 1
        }  
      }
      pack = {
        ...action.payload,
        quantity: nextQuantity
      }
      packs = state.basket.slice()
      packIndex = packs.findIndex(p => p.packId === action.payload.packId)
      packs.splice(packIndex, 1, pack)
      localStorage.setItem('basket', JSON.stringify(packs))
      return {...state, basket: packs}
    case 'DECREASE_QUANTITY':
      if (action.payload.isDivided) {
        if (action.payload.quantity > 1) {
          nextQuantity = action.payload.quantity - 0.5
        } else {
          i = increment.indexOf(action.payload.quantity)
          nextQuantity = i === 0 ? increment[0] : increment[--i]  
        }
      } else {
        nextQuantity = action.payload.quantity - 1
      }
      packs = state.basket.slice()
      packIndex = packs.findIndex(p => p.packId === action.payload.packId)
      if (nextQuantity === 0) {
        packs.splice(packIndex, 1)
      } else {
        pack = {
          ...action.payload,
          quantity: nextQuantity
        }
        packs.splice(packIndex, 1, pack)
      }
      localStorage.setItem('basket', JSON.stringify(packs))
      return {...state, basket: packs}
    case 'CLEAR_BASKET':
      localStorage.setItem('basket', JSON.stringify([]))
      return {...state, basket: []}
    case 'SET_BASKET':
      return {...state, basket: action.payload}
    case 'LOAD_ORDER_BASKET':
      return {
        ...state,
        orderBasket: action.payload.basket
      }
    case 'CLEAR_ORDER_BASKET':
      return {
        ...state,
        orderBasket: []
      }
    case 'INCREASE_ORDER_QUANTITY':
      if (action.payload.packInfo.isDivided) {
        if (action.payload.quantity >= 1) {
          nextQuantity = action.payload.quantity + 0.5
        } else {
          i = increment.indexOf(action.payload.quantity)
          nextQuantity = increment[++i]  
        }
      } else {
        nextQuantity = action.payload.quantity + 1
      }
      pack = {
        ...action.payload,
        quantity: nextQuantity,
        gross: Math.round(action.payload.price * nextQuantity)
      }
      packs = state.orderBasket.slice()
      packIndex = packs.findIndex(p => p.packId === action.payload.packId)
      packs.splice(packIndex, 1, pack)
      return {...state, orderBasket: packs}
    case 'DECREASE_ORDER_QUANTITY':
      if (action.payload.weight) {
        if (action.payload.packInfo.isDivided) {
          if (action.payload.quantity > action.payload.weight) {
            nextQuantity = action.payload.weight
          } else {
            nextQuantity = 0
          }  
        } else {
          if (action.payload.quantity > action.payload.purchased) {
            nextQuantity = action.payload.purchased
          } else {
            nextQuantity = 0
          }  
        }
      } else if (action.payload.packInfo.isDivided) {
        if (action.payload.quantity > 1) {
          nextQuantity = action.payload.quantity - 0.5
        } else {
          i = increment.indexOf(action.payload.quantity)
          nextQuantity = i === 0 ? increment[0] : increment[--i]  
        }
      } else {
        nextQuantity = action.payload.quantity - 1
      }
      pack = {
        ...action.payload,
        quantity: nextQuantity,
        gross: Math.round(action.payload.price * nextQuantity)
      }  
      packs = state.orderBasket?.slice()
      packIndex = packs.findIndex(p => p.packId === action.payload.packId)
      packs.splice(packIndex, 1, pack)
      return {...state, orderBasket: packs}
    case 'LOGIN':
      return {...state, user: action.payload}
    case 'LOGOUT':
      return {...state, user: undefined}
    case 'SET_USER_INFO':
      return {...state, userInfo: action.payload}
    case 'SET_CUSTOMER_INFO':
      return {...state, customerInfo: action.payload}
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
    default:
      return state
  }
}

export default reducer