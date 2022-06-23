import firebase from './firebase'

export type Label = {
    [key: string]: string
}
export type Category = {
  id: string,
  name: string,
  ordering: number
}
export type Country = {
  id: string,
  name: string,
}
export type Err = {
  code: string,
  message: string
}
export type Pack = {
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
  countryId: string,
  closeExpired: boolean,
  ratingCount: number,
  byWeight: boolean
}
export type PackPrice = {
  storeId: string,
  packId: string,
  price: number,
  time: Date
}
export type Notification = {
  id: string,
  title: string,
  text: string,
  status: string,
  time: Date
}
export type Friend = {
  mobile: string,
  name: string,
  status: string
}
export type Rating = {
  productId: string
}
export type Alarm = {
  packId?: string,
  type: string,
  price?: number,
  quantity?: number,
  alternative?: string,
  offerDays?: number,
  status: string
}
export type UserInfo = {
  mobile: string,
  regionId: string,
  friends?: Friend[],
  ratings?: Rating[],
  favorites?: string[],
  alarms?: Alarm[]
}
export type CustomerInfo = {
  storeId: string,
  isBlocked: boolean,
  orderLimit: number,
  deliveryFees: number,
  discounts: number,
  specialDiscount: number
}
export type BasketPack = {
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
export type OrderPack = BasketPack & {
  gross: number,
  purchased: number,
  status: string,
  actual?: number,
  overPriced?: boolean,
  packInfo?: Pack,
  oldQuantity?: number
}
export type BigBasketPack = BasketPack & {
  packInfo?: Pack,
  totalPriceText: string,
  priceText: string,
}
export type Order = {
  id?: string,
  basket: OrderPack[],
  status: string,
  total: number,
  fixedFees: number,
  deliveryFees: number,
  discount?: Discount,
  fraction: number,
  requestType?: string,
  time?: Date
}
export type Advert = {
  id: string,
  type: string,
  title: string,
  text: string,
  isActive: boolean,
  imageUrl?: string
}
export type Region = {
  id: string,
  name: string,
  fees: number,
  ordering: number

}
export type PasswordRequest = {
  id: string,
  mobile: string
}
export type Discount = {
  value: number,
  type: string
}
export type State = {
  user?: firebase.User,
  userInfo?: UserInfo,
  customerInfo?: CustomerInfo,
  categories: Category[],
  countries: Country[],
  basket: BasketPack[],
  orders: Order[],
  packs: Pack[],
  packPrices: PackPrice[],
  adverts: Advert[],
  regions: Region[],
  passwordRequests: PasswordRequest[],
  orderBasket: OrderPack[],
  notifications: Notification[],
  searchText: string
}

export type Action = {
  type: string
  payload?: any
}

