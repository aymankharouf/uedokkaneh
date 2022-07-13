import { useEffect } from 'react';
import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Route } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { Pack, Advert as AdvertType, PasswordRequest as PasswordRequestType, Order, Notification, Customer, PackPrice, StoreTrans } from './data/types'
import firebase from './data/firebase'

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css'
import '@ionic/react/css/float-elements.css'
import '@ionic/react/css/text-alignment.css'
import '@ionic/react/css/text-transformation.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'

/* Theme variables */
import './css/variables.css'
import './css/app.css'

import Home from './pages/home'
import Panel from './pages/panel'
import Login from './pages/login'
import Register from './pages/register'
import Packs from './pages/packs'
import PackDetails from './pages/pack-details'
import Basket from './pages/basket'
import ConfirmOrder from './pages/confirm-order'
import OrdersList from './pages/orders-list'
import OrderDetails from './pages/order-details'
import PasswordRequest from './pages/password-request'
import ChangePassword from './pages/change-password'
import Hints from './pages/hints'
import Help from './pages/help'
import Notifications from './pages/notifications'
import PurchasedPacks from './pages/purchased-packs'
import Advert from './pages/advert'
import Categories from './pages/categories';


const App = () => {
  const dispatch = useDispatch()
  const href = window.location.href
  if (href.length - href.replaceAll('/', '').length !== (href.endsWith('/') ? 3 : 2)) {
    window.location.href = window.location.hostname === 'localhost' ? href.substr(0, 21) : href.substr(0, 28)
  }
  useEffect(() => {
    const unsubscribeCategories = firebase.firestore().collection('lookups').doc('g').onSnapshot(doc => {
      if (doc.exists) dispatch({type: 'SET_CATEGORIES', payload: doc.data()?.values})
    }, err => {
      unsubscribeCategories()
    })  
    const unsubscribeCountries = firebase.firestore().collection('lookups').doc('c').onSnapshot(doc => {
      if (doc.exists) dispatch({type: 'SET_COUNTRIES', payload: doc.data()?.values})
    }, err => {
      unsubscribeCountries()
    })  
    const unsubscribePacks = firebase.firestore().collection('packs').where('price', '>', 0).onSnapshot(docs => {
      let packs: Pack[] = []
      docs.forEach(doc => {
        packs.push({
          id: doc.id,
          name: doc.data().name,
          product: doc.data().product,
          price: doc.data().price,
          weightedPrice: doc.data().price / doc.data().unitsCount,
          quantityType: doc.data().quantityType,
          unitsCount: doc.data().unitsCount,
          subPackId: doc.data().subPackId
        })
      })
      dispatch({type: 'SET_PACKS', payload: packs})
    }, err => {
      unsubscribePacks()
    })
    const unsubscribeAdverts = firebase.firestore().collection('adverts').where('isActive', '==', true).onSnapshot(docs => {
      let adverts: AdvertType[] = []
      docs.forEach(doc => {
        adverts.push({
          id: doc.id,
          type: doc.data().type,
          title: doc.data().title,
          text: doc.data().text,
          isActive: doc.data().isActive,
          imageUrl: doc.data().imageUrl
        })
      })
      dispatch({type: 'SET_ADVERTS', payload: adverts})
    }, err => {
      unsubscribeAdverts()
    })  
    const unsubscribeRegions = firebase.firestore().collection('lookups').doc('r').onSnapshot(doc => {
      if (doc.exists) dispatch({type: 'SET_REGIONS', payload: doc.data()?.values})
    }, err => {
      unsubscribeRegions()
    })  
    const unsubscribePasswordRequests = firebase.firestore().collection('password-requests').onSnapshot(docs => {
      let passwordRequests: PasswordRequestType[] = []
      docs.forEach(doc => {
        passwordRequests.push({
          id: doc.id,
          mobile: doc.data().mobile
        })
      })
      dispatch({type: 'SET_PASSWORD_REQUESTS', payload: passwordRequests})
    }, err => {
      unsubscribePasswordRequests()
    })  
    firebase.auth().onAuthStateChanged(user => {
      dispatch({type: 'LOGIN', payload: user})
      if (user){
        const localData = localStorage.getItem('basket')
        const basket = localData ? JSON.parse(localData) : []
        if (basket) dispatch({type: 'SET_BASKET', payload: basket}) 
        const unsubscribeCustomer = firebase.firestore().collection('customers').doc(user.uid).onSnapshot(doc => {
          if (doc.exists){
            const customer: Customer = {
              mobile: doc.data()!.mobile,
              status: doc.data()!.status,
              regionId: doc.data()!.regionId,
              storeId: doc.data()!.storeId,
              orderLimit: doc.data()!.orderLimit,
              deliveryFees: doc.data()!.deliveryFees,
              ratings: doc.data()!.ratings
            }
            const notifications: Notification[] = []
            if (doc.data()!.notifications) {
              doc.data()!.notifications.forEach((n: any) => {
                notifications.push({
                  id: n.id,
                  title: n.title,
                  text: n.text,
                  status: n.status,
                  time: n.time.toDate()
                })
              })
            }
            dispatch({type: 'SET_CUSTOMER', payload: customer})
            dispatch({type: 'SET_NOTIFICATIONS', payload: notifications})
          } else {
            firebase.auth().signOut()
          }
        }, err => {
          unsubscribeCustomer()
        })  
        const unsubscribeOrders = firebase.firestore().collection('orders').where('userId', '==', user.uid).onSnapshot(docs => {
          let orders: Order[] = []
          docs.forEach(doc => {
            orders.push({
              id: doc.id,
              basket: doc.data().basket,
              status: doc.data().status,
              total: doc.data().total,
              deliveryFees: doc.data().deliveryFees,
              deliveryTime: doc.data().deliveryTime,
              fraction: doc.data().fraction,
              trans: doc.data().trans,
              lastUpdate: doc.data().lastUpdate?.toDate()
            })
          })
          dispatch({type: 'SET_ORDERS', payload: orders})
        }, err => {
          unsubscribeOrders()
        })
        const unsubscribeStore = firebase.firestore().collection('stores').where('userId', '==', user.uid).onSnapshot(docs => {
          const packPrices: PackPrice[] = []
          const storeTrans: StoreTrans[] = []
          docs.forEach(doc => {
            if (doc.data().prices) {
              doc.data().prices.forEach((p: any) => {
                packPrices.push({
                  storeId: doc.id,
                  packId: p.packId,
                  price: p.price,
                  isActive: p.isActive,
                  lastUpdate: p.lastUpdate.toDate()
                })
              })
            }
            if (doc.data().trans) {
              doc.data().trans.forEach((t: any) => {
                storeTrans.push({
                  storeId: doc.id,
                  packId: t.packId,
                  oldPrice: t.oldPrice,
                  newPrice: t.newPrice,
                  status: t.status,
                  time: t.time.toDate()
                })
              })
            }

          })
          dispatch({type: 'SET_PACK_PRICES', payload: packPrices})
          dispatch({type: 'SET_STORE_TRANS', payload: storeTrans})
        }, err => {
          unsubscribeStore()
        })
      } else {
        dispatch({type: 'SET_CUSTOMER', payload: undefined})
        dispatch({type: 'SET_ORDERS', payload: []})
        dispatch({type: 'SET_NOTIFICATIONS', payload: []})
      }
    })
  }, [dispatch])
  return (
    <IonApp dir="rtl">
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <Panel />
          <IonRouterOutlet id="main" mode="ios">
            <Route path="/" exact={true} component={Home} />
            <Route path="/login" exact={true} component={Login} />
            <Route path="/password-request" exact={true} component={PasswordRequest} />
            <Route path="/change-password" exact={true} component={ChangePassword} />
            <Route path="/register" exact={true} component={Register} />
            <Route path="/packs/:type/:id" exact={true} component={Packs} />
            <Route path="/pack-details/:id/:type" exact={true} component={PackDetails} />
            <Route path="/basket" exact={true} component={Basket} />
            <Route path="/confirm-order" exact={true} component={ConfirmOrder} />
            <Route path="/orders-list" exact={true} component={OrdersList} />
            <Route path="/order-details/:id" exact={true} component={OrderDetails} />
            <Route path="/hints/:id/:type" exact={true} component={Hints} />
            <Route path="/help/:id" exact={true} component={Help} />
            <Route path="/notifications" exact={true} component={Notifications} />
            <Route path="/purchased-packs" exact={true} component={PurchasedPacks} />
            <Route path="/advert" exact={true} component={Advert} />
            <Route path="/categories/:id" exact={true} component={Categories} />
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;

