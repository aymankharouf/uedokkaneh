import firebase from './firebase'
import labels from './labels'
import { colors } from './config'
import { Err, OrderPack, BasketPack, Order, Alarm, Pack, Notification, Country, Customer } from './types'

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
  firebase.firestore().collection('users').doc(firebase.auth().currentUser?.uid).update({
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
    time: firebase.firestore.FieldValue.serverTimestamp()
  })
}

export const confirmOrder = (order: Order) => {
  const newOrder = {
    ...order,
    userId: firebase.auth().currentUser?.uid,
    isArchived: false,
    time: firebase.firestore.FieldValue.serverTimestamp()
  }
  firebase.firestore().collection('orders').add(newOrder)
}

export const cancelOrder = (order: Order) => {
  firebase.firestore().collection('orders').doc(order.id).update({
    status: 'c',
    lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
  })
}

export const mergeOrders = (order1: Order, order2: Order) => {
  const batch = firebase.firestore().batch()
  let basket = order1.basket.slice()
  order2.basket.forEach(p => {
    let newItem
    let found = basket.findIndex(bp => bp.packId === p.packId)
    if (found === -1) {
      newItem = p
    } else {
      const status = p.status === 'f' ? 'p' : p.status
      const newQuantity = addQuantity(basket[found].quantity, p.quantity)
      newItem = {
        ...basket[found],
        quantity: newQuantity,
        status,
        gross: status === 'f' ? Math.round((p.actual ?? 0) * (p.weight || p.purchased)) : Math.round((p.actual || 0) * (p.weight || p.purchased)) + Math.round(p.price * addQuantity(newQuantity, -1 * p.purchased)),
      }  
    }
    basket.splice(found === -1 ? basket.length : found, found === -1 ? 0 : 1, newItem)
  })
  const total = basket.reduce((sum, p) => sum + (p.gross || 0), 0)
  const fraction = total - Math.floor(total / 5) * 5
  let orderRef = firebase.firestore().collection('orders').doc(order1.id)
  batch.update(orderRef, {
    basket,
    total,
    fraction
  })
  orderRef = firebase.firestore().collection('orders').doc(order2.id)
  batch.update(orderRef, {
    status: 'm',
    lastUpdate: new Date()
  })
  batch.commit()
}

export const addOrderRequest = (order: Order, type: string, mergedOrder?: Order) => {
  const batch = firebase.firestore().batch()
  let orderRef = firebase.firestore().collection('orders').doc(order.id)
  const basket = type === 'm' ? mergedOrder?.basket : []
  batch.update(orderRef, {
    requestType: type,
    requestBasket: basket,
    requestTime: firebase.firestore.FieldValue.serverTimestamp()
  })
  if (mergedOrder) {
    orderRef = firebase.firestore().collection('orders').doc(mergedOrder.id)
    batch.update(orderRef, {
      status: 's',
      lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
    })
  }
  batch.commit()
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
        return firebase.firestore().collection('users').doc(firebase.auth().currentUser?.uid).update({
          colors: userColors
        }) 
      }
    }
  }
}

export const addAlarm = (alarm: Alarm) => {
  firebase.firestore().collection('users').doc(firebase.auth().currentUser?.uid).update({
    alarms: firebase.firestore.FieldValue.arrayUnion({
      ...alarm,
      id: Math.random().toString(),
      time: new Date()  
    })
  })
}

export const readNotification = (notification: Notification, notifications: Notification[]) => {
  const otherNotifications = notifications.filter(n => n.id === notification.id)
  otherNotifications.push({
    ...notification,
    status: 'r'
  })
  firebase.firestore().collection('users').doc(firebase.auth().currentUser?.uid).update({
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

export const editOrder = (order: Order, newBasket: OrderPack[]) => {
  let basket = newBasket.map(p => {
    const { oldQuantity, packInfo, ...others } = p
    return others
  })
  if (order.status === 'n') {
    basket = basket.filter(p => p.quantity > 0)
    const total = basket.reduce((sum, p) => sum + p.gross, 0)
    const fraction = total - Math.floor(total / 5) * 5
    const orderStatus = basket.length === 0 ? 'c' : order.status
    firebase.firestore().collection('orders').doc(order.id).update({
      basket,
      total,
      fraction,
      status: orderStatus,
    })
  } else {
    firebase.firestore().collection('orders').doc(order.id).update({
      requestType: 'e',
      requestBasket: basket,
      requestTime: firebase.firestore.FieldValue.serverTimestamp()
    })
  } 
}

export const deleteNotification = (notificationId: string, notifications: Notification[]) => {
  const otherNotifications = notifications.filter(n => n.id !== notificationId)
  firebase.firestore().collection('users').doc(firebase.auth().currentUser?.uid).update({
    notifications: otherNotifications
  })  
}

export const getBasket = (stateBasket: BasketPack[], packs: Pack[]) => {
  const basket = stateBasket.map(p => {
    const packInfo = packs.find(pa => pa.id === p.packId)
    let lastPrice
    if (p.offerId) {
      const offerInfo = packs.find(pa => pa.id === p.offerId)
      if (!offerInfo) {
        lastPrice = 0
      } else if (offerInfo.subPackId === p.packId) {
        lastPrice = Math.round(offerInfo.price / (offerInfo.subQuantity || 0))
      } else {
        lastPrice = offerInfo?.price ?? 0
      }
    } else {
      lastPrice = packInfo?.price ?? 0
    }
    const totalPriceText = `${(Math.round(lastPrice * p.quantity) / 100).toFixed(2)}${p.byWeight ? '*' : ''}`
    const priceText = lastPrice === 0 ? labels.itemNotAvailable : (lastPrice === p.price ? `${labels.price}: ${(p.price / 100).toFixed(2)}` : `${labels.price}: ${(lastPrice / 100).toFixed(2)} (${(p.price / 100).toFixed(2)} ${labels.oldPrice})`)
    return {
      ...p,
      price: lastPrice,
      packInfo,
      totalPriceText,
      priceText,
    }
  })
  return basket
}
