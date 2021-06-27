import firebase from './firebase'
import labels from './labels'
import { randomColors, setup } from './config'
import { f7 } from 'framework7-react'
import { Error, OrderPack, BasketPack, Category, Order, UserInfo, Alarm, Pack, Notification } from './types'

export const getMessage = (path: string, error: Error) => {
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

export const showMessage = (messageText: string) => {
  const message = f7.toast.create({
    text: `<span class="success">${messageText}<span>`,
    closeTimeout: 3000,
  })
  message.open()
}

export const showError = (messageText: string) => {
  const message = f7.toast.create({
    text: `<span class="error">${messageText}<span>`,
    closeTimeout: 3000,
  })
  message.open()
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

export const productOfText = (trademark: string, country: string) => {
  return trademark ? `${labels.productFrom} ${trademark}-${country}` : `${labels.productOf} ${country}`
}

export const getChildren = (categoryId: string, categories: Category[]) => {
  let childrenArray = [categoryId]
  let children = categories.filter(c => c.parentId === categoryId)
  children.forEach(c => {
    const newChildren = getChildren(c.id, categories)
    childrenArray = [...childrenArray, ...newChildren]
  })
  return childrenArray
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
  const fixedFees = Math.round(setup.fixedFees * total)
  const fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 5) * 5
  let orderRef = firebase.firestore().collection('orders').doc(order1.id)
  batch.update(orderRef, {
    basket,
    total,
    fixedFees,
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

export const registerUser = async (mobile: string, name: string, storeName: string, locationId: string, password: string) => {
  await firebase.auth().createUserWithEmailAndPassword(mobile + '@gmail.com', mobile.substring(9, 2) + password)
  let colors = []
  for (var i = 0; i < 4; i++){
    colors.push(randomColors[Number(password.charAt(i))].name)
  }
  firebase.firestore().collection('users').doc(firebase.auth().currentUser?.uid).set({
    mobile,
    name,
    storeName,
    locationId,
    colors,
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
        let colors = []
        for (var i = 0; i < 4; i++){
          colors.push(randomColors[Number(newPassword.charAt(i))].name)
        }
        return firebase.firestore().collection('users').doc(firebase.auth().currentUser?.uid).update({
          colors
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

export const inviteFriend = (mobile: string, name: string) => {
  firebase.firestore().collection('users').doc(firebase.auth().currentUser?.uid).update({
    friends: firebase.firestore.FieldValue.arrayUnion({
      mobile,
      name,
      status: 'n'
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

export const updateFavorites = (user: UserInfo, productId: string) => {
  const favorites = user.favorites?.slice() || []
  const found = favorites.indexOf(productId)
  if (found === -1) {
    favorites.push(productId) 
  } else {
    favorites.splice(found, 1)
  }
  firebase.firestore().collection('users').doc(firebase.auth().currentUser?.uid).update({
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
    const fixedFees = Math.round(setup.fixedFees * total)
    const fraction = (total + fixedFees) - Math.floor((total + fixedFees) / 5) * 5
    const orderStatus = basket.length === 0 ? 'c' : order.status
    firebase.firestore().collection('orders').doc(order.id).update({
      basket,
      total,
      fixedFees,
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

export const notifyFriends = (offerId: string) => {
  firebase.firestore().collection('users').doc(firebase.auth().currentUser?.uid).update({
    notifyFriends: firebase.firestore.FieldValue.arrayUnion(offerId)
  })
}

export const deleteFriend = (user: UserInfo, mobile: string) => {
  const friends = user.friends?.slice()
  if (friends) {
    const friendIndex = friends.findIndex(f => f.mobile === mobile)
    friends.splice(friendIndex, 1)
    firebase.firestore().collection('users').doc(firebase.auth().currentUser?.uid).update({
      friends
    })
  }
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
        lastPrice = Math.round(offerInfo.price / (offerInfo.subQuantity ?? 0) * (offerInfo.subPercent ?? 0) * (1 + setup.profit))
      } else if (offerInfo.bonusPackId === p.packId) {
        lastPrice = Math.round(offerInfo.price / (offerInfo.bonusQuantity ?? 0) * (offerInfo.bonusPercent ?? 0) * (1 + setup.profit))
      } else {
        lastPrice = offerInfo?.price ?? 0
      }
    } else {
      lastPrice = packInfo?.price ?? 0
    }
    const totalPriceText = `${(Math.round(lastPrice * p.quantity) / 100).toFixed(2)}${p.byWeight ? '*' : ''}`
    const priceText = lastPrice === 0 ? labels.itemNotAvailable : (lastPrice === p.price ? `${labels.price}: ${(p.price / 100).toFixed(2)}` : `${labels.priceHasChanged}, ${labels.oldPrice}: ${(p.price / 100).toFixed(2)}, ${labels.newPrice}: ${(lastPrice / 100).toFixed(2)}`)
    const otherProducts = packs.filter(pa => pa.categoryId === packInfo?.categoryId && (pa.sales > packInfo.sales || pa.rating > packInfo.rating))
    const otherOffers = packs.filter(pa => pa.productId === packInfo?.productId && pa.id !== packInfo.id && (pa.isOffer || pa.offerEnd))
    const otherPacks = packs.filter(pa => pa.productId === packInfo?.productId && pa.weightedPrice < packInfo.weightedPrice)
    return {
      ...p,
      price: lastPrice,
      packInfo,
      totalPriceText,
      priceText,
      otherProducts: otherProducts.length,
      otherOffers: otherOffers.length,
      otherPacks: otherPacks.length
    }
  })
  return basket
}
