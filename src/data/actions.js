import firebase from './firebase'
import labels from './labels'
import { randomColors } from './config'
import { f7 } from 'framework7-react'
import { setup } from './config'

export const getMessage = (props, error) => {
  const errorCode = error.code ? error.code.replace(/-|\//g, '_') : error.message
  if (!labels[errorCode]) {
    firebase.firestore().collection('logs').add({
      userId: firebase.auth().currentUser.uid,
      error,
      page: props.f7route.route.component.name,
      time: firebase.firestore.FieldValue.serverTimestamp()
    })
  }
  return labels[errorCode] || labels['unknownError']
}

export const showMessage = messageText => {
  const message = f7.toast.create({
    text: `<span class="success">${messageText}<span>`,
    closeTimeout: 3000,
  })
  message.open()
}

export const showError = messageText => {
  const message = f7.toast.create({
    text: `<span class="error">${messageText}<span>`,
    closeTimeout: 3000,
  })
  message.open()
}

export const quantityText = quantity => {
  return `${quantity < 1 ? quantity * 1000 + ' ' + labels.gram : quantity}`
}

export const addQuantity = (q1, q2, q3 = 0) => {
  if (parseInt(q1) !== q1 || parseInt(q2) !== q2 || parseInt(q3) !== q3) {
    return parseInt((q1 * 1000) + (q2 * 1000) + (q3 * 1000)) / 1000
  } else {
    return q1 + q2 + q3
  }
}

export const quantityDetails = basketPack => {
  let text = `${labels.requested}: ${quantityText(basketPack.quantity)}`
  if (basketPack.purchased > 0) {
    text += `, ${labels.purchased}: ${quantityText(basketPack.purchased)}`
    if (basketPack.weight && basketPack.weight !== basketPack.purchased) {
      text += `, ${labels.weight}: ${quantityText(basketPack.weight)}`
    }
  }
  if (basketPack.returned > 0) {
    text += `, ${labels.returned}: ${quantityText(basketPack.returned)}`
  }
  return text
}

export const isSubCategory = (category1, category2, categories) => {
  const parent = categories.find(c => c.id === category1).parentId
  if (parent === '0') {
    return false
  } else if (parent === category2) {
    return true
  } else {
    return isSubCategory(parent, category2, categories)
  }

}


export const rateProduct = (user, productId, value) => {
  const ratings = user.ratings?.slice() || []
  ratings.push({
    productId,
    value,
    status: 'n'
  })
  return firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({
    ratings
  })
}

export const login = (mobile, password) => {
  return firebase.auth().signInWithEmailAndPassword(mobile + '@gmail.com', mobile.substring(9, 2) + password)
}

export const logout = () => {
  return firebase.auth().signOut()
}

export const addPasswordRequest = mobile => {
  localStorage.setItem('password-request', mobile)
  return firebase.firestore().collection('password-requests').add({
    mobile,
    status: 'n',
    time: firebase.firestore.FieldValue.serverTimestamp()
  })
}

export const confirmOrder = order => {
  const newOrder = {
    ...order,
    userId: firebase.auth().currentUser.uid,
    status: 'n',
    isArchived: false,
    time: firebase.firestore.FieldValue.serverTimestamp(),
    activeTime: firebase.firestore.FieldValue.serverTimestamp()
  }
  return firebase.firestore().collection('orders').add(newOrder)
}

export const cancelOrder = order => {
  return firebase.firestore().collection('orders').doc(order.id).update({
    status: 'c',
    lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
  })
}

export const addOrderRequest = (order, type) => {
  return firebase.firestore().collection('order-requests').add({
    order,
    type,
    status: 'n',
    time: firebase.firestore.FieldValue.serverTimestamp()
  })
}

export const registerUser = async (mobile, password, name) => {
  await firebase.auth().createUserWithEmailAndPassword(mobile + '@gmail.com', mobile.substring(9, 2) + password)
  let colors = []
  for (var i = 0; i < 4; i++){
    colors.push(randomColors[Number(password.charAt(i))].name)
  }
  return firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).set({
    name,
    mobile,
    colors,
    time: firebase.firestore.FieldValue.serverTimestamp()
  })
}

export const changePassword = async (oldPassword, newPassword) => {
  let user = firebase.auth().currentUser
  const mobile = user.email.substring(0, 10)
  await firebase.auth().signInWithEmailAndPassword(mobile + '@gmail.com', mobile.substring(9, 2) + oldPassword)
  user = firebase.auth().currentUser
  await user.updatePassword(mobile.substring(9, 2) + newPassword)
  let colors = []
  for (var i = 0; i < 4; i++){
    colors.push(randomColors[Number(newPassword.charAt(i))].name)
  }
  return firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).set({
    colors
  })
}

export const registerStoreOwner = async (owner, password) => {
  await firebase.auth().createUserWithEmailAndPassword(owner.mobile + '@gmail.com', owner.mobile.substring(9, 2) + password)
  let colors = []
  for (var i = 0; i < 4; i++){
    colors.push(randomColors[Number(password.charAt(i))].name)
  }
  return firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).set({
    ...owner,
    colors,
    time: firebase.firestore.FieldValue.serverTimestamp()
  })
}

export const addAlarm = (user, alarm) => {
  const alarms = user.alarms?.slice() || []
  alarms.push({
    ...alarm,
    id: Math.random(),
    status: 'n',
    time: new Date()
  })
  return firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({
    alarms
  })
}

export const inviteFriend = (user, mobile, name) => {
  const invitations = user.invitations?.slice() || []
  invitations.push({
    mobile,
    name,
    status: 'n'
  })
  return firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({
    invitations
  })
}

export const readNotification = (user, notificationId) => {
  const newNotifications = user.notifications.slice()
  const notificationIndex = newNotifications.findIndex(n => n.id === notificationId)
  newNotifications.splice(notificationIndex, 1, {
    ...user.notifications[notificationIndex],
    status: 'r'
  })
  return firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({
    notifications: newNotifications
  })
}

export const updateFavorites = (user, productId) => {
  const favorites = user.favorites?.slice() || []
  const found = favorites.indexOf(productId)
  if (found === -1) {
    favorites.push(productId) 
  } else {
    favorites.splice(found, 1)
  }
  return firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({
    favorites
  })
}

export const editOrder = (order, newBasket, customer, locations) => {
  if (order.status === 'n') {
    const basket = newBasket.filter(p => p.quantity > 0)
    const total = basket.reduce((sum, p) => sum + p.gross, 0)
    const fraction = total - Math.floor(total / 50) * 50
    const fixedFees = Math.ceil((order.urgent ? 1.5 : 1) * setup.fixedFees * total / 50) * 50 - fraction
    const customerLocation = locations.find(l => l.id === customer.locationId) || ''
    const deliveryFees = order.withDelivery ? (customerLocation?.deliveryFees || setup.deliveryFees) * (order.urgent ? 1.5 : 1) - (customer.deliveryDiscount || 0) : 0
    const orderStatus = basket.length === 0 ? 'c' : order.status
    return firebase.firestore().collection('orders').doc(order.id).update({
      basket,
      total,
      fixedFees,
      withDelivery: order.withDelivery,
      urgent: order.urgent,
      deliveryFees,
      status: orderStatus,
      deliveryDiscount: order.withDelivery ? customer.deliveryDiscount : 0
    })
  } else {
    return firebase.firestore().collection('order-requests').add({
      order,
      type: 'e',
      basket: newBasket,
      status: 'n',
      time: firebase.firestore.FieldValue.serverTimestamp()
    })
  } 
}

export const deleteNotification = (user, notificationId) => {
  const newNotifications = user.notifications.slice()
  const notificationIndex = newNotifications.findIndex(n => n.id === notificationId)
  newNotifications.splice(notificationIndex, 1)
  return firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({
    notifications: newNotifications
  })
}

export const takeOrder = order => {
  return firebase.firestore().collection('orders').doc(order.id).update({
    status: 't',
    lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
  })
}

export const returnOrderPacks = (order, pack, returned) => {
  const batch = firebase.firestore().batch()
  const orderPack = order.basket.find(p => p.packId === pack.id)
  const otherPacks = order.basket.filter(p => p.packId !== pack.id)
  let status, gross
  if (returned === 0 && orderPack.returned > 0) {
    if (pack.isDivided) {
      status = parseInt(Math.abs(addQuantity(orderPack.quantity, -1 * orderPack.purchased)) / orderPack.quantity * 100) <= setup.weightErrorMargin ? 'f' : 'pu'
    } else {
      status = orderPack.quantity === orderPack.purchased ? 'f' : 'pu'
    }
    gross = parseInt(orderPack.actual * (orderPack.weight || orderPack.purchased))
  } else {
    if (returned === orderPack.purchased) {
      status = 'r'
      gross = 0
    } else {
      status = 'pr'
      gross = parseInt(orderPack.actual * addQuantity(orderPack.weight || orderPack.purchased, -1 * returned))
    }
  }
  const basket = [
    ...otherPacks, 
    {
      ...orderPack, 
      status,
      gross,
      returned: pack.isDivided || !pack.byWeight ? returned : orderPack.purchased,
    }
  ]
  let profit = basket.reduce((sum, p) => sum + (['p', 'f', 'pu', 'pr'].includes(p.status) ? parseInt((p.actual - p.cost) * addQuantity(p.weight || p.purchased, -1 * (p.returned || 0))) : 0), 0)
  const total = basket.reduce((sum, p) => sum + (p.gross || 0), 0)
  const fraction = total - Math.floor(total / 50) * 50
  const fixedFees = Math.ceil((order.urgent ? 1.5 : 1) * setup.fixedFees * total / 50) * 50 - fraction
  const orderRef = firebase.firestore().collection('orders').doc(order.id)
  batch.update(orderRef, {
    basket,
    total,
    profit,
    fixedFees
  })
  return batch.commit()
}
