import firebase from './firebase'
import labels from './labels'
import { colors } from './config'
import { Err, BasketPack, Order, Pack, Notification, Country, Customer, PackPrice } from './types'

export const getMessage = (path: string, error: Err) => {
  const errorCode = error.code ? error.code.replace(/-|\//g, '_') : error.message
  if (!labels[errorCode]) {
    firebase.firestore().collection('logs').add({
      userId: firebase.auth().currentUser?.uid || '',
      error: errorCode,
      page: path,
      time: firebase.firestore.FieldValue.serverTimestamp()
    })
  }
  return labels[errorCode] || labels['unknownError']
}

export const quantityText = (quantity: number, weight?: number): string => {
  return weight && weight !== quantity ? `${quantityText(quantity)}(${quantityText(weight)})` : quantity === Math.trunc(quantity) ? quantity.toString() : quantity.toFixed(3)
}

export const quantityDetails = (basketPack: BasketPack) => {
  let text = `${labels.requested}: ${quantityText(basketPack.quantity)}`
  if ((basketPack.purchased ?? 0) > 0) {
    text += `, ${labels.purchased}: ${quantityText(basketPack.purchased ?? 0, basketPack.weight)}`
  }
  if ((basketPack.returned ?? 0) > 0) {
    text += `, ${labels.returned}: ${quantityText(basketPack.returned ?? 0)}`
  }
  return text
}

export const addQuantity = (q1: number, q2: number, q3 = 0) => {
  return Math.trunc(q1 * 1000 + q2 * 1000 + q3 * 1000) / 1000
}

export const productOfText = (trademark: string, countryId: string, countries: Country[]) => {
  const countryName = countries.find(c => c.id === countryId)?.name
  return trademark ? `${labels.productFrom} ${trademark}-${countryName}` : `${labels.productOf} ${countryName}`
}

export const rateProduct = (productId: string, value: number) => {
  firebase.firestore().collection('caustomers').doc(firebase.auth().currentUser?.uid).update({
    ratings: firebase.firestore.FieldValue.arrayUnion({
      productId,
      value,
      status: 'n'  
    })
  })
}

export const login = (mobile: string, password: string) => {
  return firebase.auth().signInWithEmailAndPassword(mobile + '@gmail.com', mobile.substring(9, 2) + password)
}

export const logout = () => {
  firebase.auth().signOut()
}

export const addPasswordRequest = (mobile: string) => {
  firebase.firestore().collection('password-requests').add({
    mobile,
    status: 'n',
    time: new Date()
  })
}

export const confirmOrder = (order: Order) => {
  const newOrder = {
    ...order,
    userId: firebase.auth().currentUser?.uid,
    isArchived: false,
  }
  console.log('new order === ', newOrder)
  firebase.firestore().collection('orders').add(newOrder)
}

export const register = async (mobile: string, name: string, regionId: string, password: string) => {
  await firebase.auth().createUserWithEmailAndPassword(mobile + '@gmail.com', mobile.substring(9, 2) + password)
  let userColors = []
  for (var i = 0; i < 4; i++){
    userColors.push(colors[Number(password.charAt(i))].name)
  }
  firebase.firestore().collection('customers').doc(firebase.auth().currentUser?.uid).set({
    mobile,
    name,
    regionId,
    status: 'n',
    colors: userColors,
    time: firebase.firestore.FieldValue.serverTimestamp()
  })
}

export const changePassword = async (oldPassword: string, newPassword: string) => {
  let user = firebase.auth().currentUser
  if (user) {
    const mobile = user.email?.substring(0, 10)
    if (mobile) {
      await firebase.auth().signInWithEmailAndPassword(mobile + '@gmail.com', mobile.substring(9, 2) + oldPassword)
      user = firebase.auth().currentUser
      if (user) {
        await user.updatePassword(mobile.substring(9, 2) + newPassword)
        let userColors = []
        for (var i = 0; i < 4; i++){
          userColors.push(colors[Number(newPassword.charAt(i))].name)
        }
        return firebase.firestore().collection('customers').doc(firebase.auth().currentUser?.uid).update({
          colors: userColors
        }) 
      }
    }
  }
}

export const readNotification = (notification: Notification, notifications: Notification[]) => {
  const otherNotifications = notifications.filter(n => n.id !== notification.id)
  otherNotifications.push({
    ...notification,
    status: 'r'
  })
  firebase.firestore().collection('customers').doc(firebase.auth().currentUser?.uid).update({
    notifications: otherNotifications
  })  
}

export const updateFavorites = (customer: Customer, productId: string) => {
  const favorites = customer.favorites?.slice() || []
  const found = favorites.indexOf(productId)
  if (found === -1) {
    favorites.push(productId) 
  } else {
    favorites.splice(found, 1)
  }
  firebase.firestore().collection('customers').doc(firebase.auth().currentUser?.uid).update({
    favorites
  })
}

export const updateOrder = (order: Order) => {
  const { id, ...others } = order
  const newTrans = {
    type: 'u',
    time: new Date().getTime()
  }
  others.trans.push(newTrans)
  others.lastUpdate = new Date()
  firebase.firestore().collection('orders').doc(order.id).update(others)
}

export const cancelOrder = (order: Order) => {
  const { id, ...others } = order
  const newTrans = {
    type: 'c',
    time: new Date().getTime()
  }
  others.trans.push(newTrans)
  others.status = 'c'
  others.lastUpdate = new Date()
  firebase.firestore().collection('orders').doc(order.id).update(others)
}

export const deleteNotification = (notificationId: string, notifications: Notification[]) => {
  const otherNotifications = notifications.filter(n => n.id !== notificationId)
  firebase.firestore().collection('customers').doc(firebase.auth().currentUser?.uid).update({
    notifications: otherNotifications
  })  
}

export const getBasket = (stateBasket: BasketPack[], packs: Pack[]) => {
  return stateBasket.filter(p => p.quantity > 0).map(p => {
    const lastPrice = packs.find(pa => pa.id === p.pack.id)?.price || 0
    const totalPriceText = `${(Math.round(lastPrice * p.quantity) / 100).toFixed(2)}${p.pack.byWeight ? '*' : ''}`
    const priceText = lastPrice === 0 ? labels.itemNotAvailable : (lastPrice === p.price ? `${labels.price}: ${(p.price / 100).toFixed(2)}` : `${labels.price}: ${(lastPrice / 100).toFixed(2)} (${(p.price / 100).toFixed(2)} ${labels.oldPrice})`)
    return {
      ...p,
      price: lastPrice,
      totalPriceText,
      priceText,
    }
  })
}

export const deleteStorePack = (storePack: PackPrice, packPrices: PackPrice[]) => {
  const batch = firebase.firestore().batch()
  const otherPrices = packPrices.filter(p => p.packId === storePack.packId && p.storeId !== storePack.storeId)
  const prices = otherPrices.map(p => {
    const {packId, ...others} = p
    return others
  })
  const price = getMinPrice(storePack, packPrices, true)
  const packRef = firebase.firestore().collection('packs').doc(storePack.packId)
  batch.update(packRef, {
    prices,
    price
  })
  const storeTransRef = firebase.firestore().collection('store-trans').doc()
  batch.set(storeTransRef, {
    storeId: storePack.storeId,
    packId: storePack.packId,
    oldPrice: storePack.price,
    newPrice: 0,
    time: new Date()
  })
  batch.commit()
}

const getMinPrice = (packPrice: PackPrice, packPrices: PackPrice[], isDeletion: boolean) => {
  const packStores = packPrices.filter(p => p.packId === packPrice.packId && p.storeId !== packPrice.storeId && p.price > 0 && p.isActive)
  if (!isDeletion && packPrice.isActive){
    packStores.push(packPrice)
  }
  const prices = packStores.map(s => s.price)
  return packStores.length > 0 ? Math.min(...prices) : 0
}

export const addPackPrice = (storePack: PackPrice, packPrices: PackPrice[]) => {
  const batch = firebase.firestore().batch()
  const { packId, ...others } = storePack
  const price = getMinPrice(storePack, packPrices, false)
  const packRef = firebase.firestore().collection('packs').doc(storePack.packId)
  batch.update(packRef, {
    prices: firebase.firestore.FieldValue.arrayUnion(others),
    price
  })
  const storeTransRef = firebase.firestore().collection('store-trans').doc()
  batch.set(storeTransRef, {
    storeId: storePack.storeId,
    packId: storePack.packId,
    oldPrice: 0,
    newPrice: storePack.price,
    time: new Date()
  })
  batch.commit()

}

export const changePrice = (storePack: PackPrice, packPrices: PackPrice[], oldPrice: number) => {
  const batch = firebase.firestore().batch()
  const otherPrices = packPrices.filter(p => p.packId === storePack.packId && p.storeId !== storePack.storeId)
  otherPrices.push(storePack)
  const prices = otherPrices.map(p => {
    const {packId, ...others} = p
    return others
  })
  const price = getMinPrice(storePack, packPrices, false)
  const packRef = firebase.firestore().collection('packs').doc(storePack.packId)
  batch.update(packRef, {
    prices,
    price
  })
  const storeTransRef = firebase.firestore().collection('store-trans').doc()
  batch.set(storeTransRef, {
    storeId: storePack.storeId,
    packId: storePack.packId,
    oldPrice,
    newPrice: storePack.price,
    time: new Date()
  })
  batch.commit()
}
