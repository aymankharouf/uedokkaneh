import firebase from './firebase'

export type Label = {
    [key: string]: string
}
export type Category = {
  id: string,
  name: string,
  ordering: number,
  parentId?: string
}
export type Country = {
  id: string,
  name: string,
}
export type Err = {
  code: string,
  message: string
}
export type Product = {
  id?: string,
  name: string,
  alias: string,
  description: string,
  trademark: string,
  countryId: string,
  categoryId: string,
  imageUrl: string,
  sales: number,
  rating: number,
  ratingCount: number,
  isArchived: boolean
}
export type Pack = {
  id: string,
  name: string,
  product: Product,
  price: number,
  subPackId?: string,
  subQuantity?: number,
  subPackName?: string,
  isOffer: boolean,
  weightedPrice: number,
  isDivided: boolean,
  byWeight: boolean,
  withGift: boolean,
  gift?: string,
  unitsCount: number
}
export type PackPrice = {
  storeId: string,
  packId: string,
  price: number,
  isActive: boolean,
  time: Date
}
export type Notification = {
  id: string,
  title: string,
  text: string,
  status: string,
  time: Date
}
export type Rating = {
  productId: string
}
export type Customer = {
  mobile: string,
  status: string,
  storeId: string,
  orderLimit: number,
  deliveryFees: number
  regionId: string,
  ratings?: Rating[],
  favorites?: string[],
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
  deliveryFees: number,
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
export type State = {
  user?: firebase.User,
  customer?: Customer,
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

