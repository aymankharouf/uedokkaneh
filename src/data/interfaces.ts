import firebase from './firebase'

export interface iLabel {
    [key: string]: string
}
export interface iCategory {
  id: string,
  name: string,
  parentId: string,
  ordering: number,
  isLeaf: boolean
}
export interface iError {
  code: string,
  message: string
}
export interface iPack {
  id: string,
  name: string,
  productId: string,
  productName: string,
  productAlias: string,
  productDescription: string,
  imageUrl: string,
  price: number,
  categoryId: string,
  sales: number,
  rating: number,
  subPackId?: string,
  subQuantity?: number,
  subPercent?: number,
  subPackName?: string,
  bonusPackId?: string,
  bonusProductName?: string,
  bonusPackName?: string,
  bonusQuantity?: number,
  bonusPercent?: number,
  isOffer: boolean,
  offerEnd: Date,
  weightedPrice: number,
  isDivided: boolean,
  minStoreId?: string,
  trademark: string,
  country: string,
  closeExpired: boolean,
  ratingCount: number,
  byWeight: boolean
}
export interface iPackPrice {
  storeId: string,
  packId: string,
  price: number,
  packInfo?: iPack
  time: Date
}
export interface iNotification {
  id: string,
  title: string,
  message: string,
  status: string,
  time: Date
}
export interface iFriend {
  mobile: string,
  name: string,
  status: string
}
export interface iRating {
  productId: string
}
export interface iAlarm {
  packId?: string,
  type: string,
  price?: number,
  quantity?: number,
  alternative?: string,
  offerDays?: number,
  status: string
}
export interface iUserInfo {
  mobile: string,
  locationId: string,
  notifications?: iNotification[],
  friends?: iFriend[],
  ratings?: iRating[],
  favorites?: string[],
  alarms?: iAlarm[]
}
export interface iCustomerInfo {
  storeId: string,
  isBlocked: boolean,
  orderLimit: number,
  deliveryFees: number,
  discounts: number,
  specialDiscount: number
}
export interface iBasketPack {
  packId: string,
  productId: string,
  productName: string,
  productAlias: string,
  packName: string,
  imageUrl: string,
  price: number,
  quantity: number,
  offerId: string
  closeExpired: boolean,
  byWeight: boolean,
  weight?: number,
  purchased?: number,
  returned?: number
}
export interface iOrderPack extends iBasketPack {
  gross: number,
  purchased: number,
  status: string,
  actual?: number,
  overPriced?: boolean,
  packInfo?: iPack,
  oldQuantity?: number
}
export interface iBigBasketPack extends iBasketPack {
  packInfo?: iPack,
  totalPriceText: string,
  priceText: string,
  otherProducts: number,
  otherOffers: number,
  otherPacks: number
}
export interface iOrder {
  id?: string,
  basket: iOrderPack[],
  status: string,
  total: number,
  fixedFees: number,
  deliveryFees: number,
  discount?: iDiscount,
  fraction: number,
  requestType?: string,
  time?: Date
}
export interface iAdvert {
  id: string,
  type: string,
  title: string,
  text: string,
  isActive: boolean,
  imageUrl?: string
}
export interface iLocation {
  id: string,
  name: string,
  fees: number,
  ordering: number

}
export interface iPasswordRequest {
  id: string,
  mobile: string
}
export interface iDiscount {
  value: number,
  type: string
}
export interface iState {
  user?: firebase.User,
  userInfo?: iUserInfo,
  customerInfo?: iCustomerInfo,
  categories: iCategory[],
  basket: iBasketPack[],
  orders: iOrder[],
  packs: iPack[],
  packPrices: iPackPrice[],
  adverts: iAdvert[],
  locations: iLocation[],
  passwordRequests: iPasswordRequest[],
  orderBasket: iOrderPack[]
}

export interface iAction {
  type: string
  payload?: any
}

export interface iContext {
  state: iState;
  dispatch: React.Dispatch<iAction>
}