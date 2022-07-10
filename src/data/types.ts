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
  weightedPrice: number,
  unitsCount: number,
  quantityType: string,
  subPackId: string
}
export type PackPrice = {
  storeId: string,
  packId: string,
  price: number,
  isActive: boolean,
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
  regionId: string,
  storeId?: string,
  orderLimit?: number,
  deliveryFees?: number
  ratings?: Rating[],
  favorites?: string[]
}
export type BasketPack = {
  pack: Pack,
  price: number,
  quantity: number,
  gross: number,
  status: string,
  weight: number,
  purchased: number,
  actual: number,
  overPriced: boolean,
  oldQuantity?: number,
}
export type OrderTrans = {
  type: string,
  time: number
}
export type Order = {
  id?: string,
  status: string,
  total: number,
  deliveryTime: string,
  deliveryFees: number,
  fraction: number,
  lastUpdate: Date
  basket: BasketPack[],
  trans: OrderTrans[],
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
  notifications: Notification[],
  searchText: string,
  openOrderId?: string
}

export type Action = {
  type: string
  payload?: any
}

