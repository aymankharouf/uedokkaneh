import { useEffect } from 'react';
import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Route } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { Pack, PackPrice, Advert as AdvertType, PasswordRequest as PasswordRequestType, Order, UserInfo, Notification } from './data/types'
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
import AddAlarm from './pages/add-alarm'
import PasswordRequest from './pages/password-request'
import StoreSummary from './pages/store-summary'
import StorePacks from './pages/store-packs'
import ChangePassword from './pages/change-password'
import Hints from './pages/hints'
import Help from './pages/help'
import Notifications from './pages/notifications'
import PurchasedPacks from './pages/purchased-packs'
import Advert from './pages/advert'
import EditOrder from './pages/edit-order'
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
      let packPrices: PackPrice[] = []
      docs.forEach(doc => {
        packs.push({
          id: doc.id,
          name: doc.data().name,
          productId: doc.data().productId,
          productName: doc.data().productName,
          productAlias: doc.data().productAlias,
          productDescription: doc.data().productDescription,
          imageUrl: doc.data().imageUrl,
          price: doc.data().price,
          categoryId: doc.data().categoryId,
          sales: doc.data().sales,
          rating: doc.data().rating,
          ratingCount: doc.data().ratingCount,
          isOffer: doc.data().isOffer,
          offerEnd: doc.data().offerEnd,
          weightedPrice: doc.data().weightedPrice,
          isDivided: doc.data().isDivided,
          trademark: doc.data().trademark,
          countryId: doc.data().countryId,
          closeExpired: doc.data().closeExpired,
          byWeight: doc.data().byWeight,
          withGift: doc.data().withGift,
          gift: doc.data().gift,
          unitsCount: doc.data().unitsCount
        })
        if (doc.data().prices) {
          doc.data().prices.forEach((p: any) => {
            packPrices.push({
              packId: doc.id,
              storeId: p.storeId,
              price: p.price,
              time: p.time.toDate()
            })
          })
        }
      })
      dispatch({type: 'SET_PACKS', payload: packs})
      dispatch({type: 'SET_PACK_PRICES', payload: packPrices})
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
        const unsubscribeUser = firebase.firestore().collection('users').doc(user.uid).onSnapshot(doc => {
          if (doc.exists){
            const userInfo: UserInfo = {
              mobile: doc.data()!.mobile,
              regionId: doc.data()!.regionId,
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
            dispatch({type: 'SET_USER_INFO', payload: userInfo})
            dispatch({type: 'SET_NOTIFICATIONS', payload: notifications})
          } else {
            firebase.auth().signOut()
          }
        }, err => {
          unsubscribeUser()
        })  
        const unsubscribeCustomer = firebase.firestore().collection('customers').doc(user.uid).onSnapshot(doc => {
          if (doc.exists){
            dispatch({type: 'SET_CUSTOMER_INFO', payload: doc.data()})
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
              fraction: doc.data().fraction,
              requestType: doc.data().requestType,
              time: doc.data().time?.toDate()
            })
          })
          dispatch({type: 'SET_ORDERS', payload: orders})
        }, err => {
          unsubscribeOrders()
        }) 
      } else {
        dispatch({type: 'CLEAR_USER_INFO'})
        dispatch({type: 'CLEAR_CUSTOMER_INFO'})
        dispatch({type: 'SET_ORDERS', payload: []})
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
            <Route path="/register/:type" exact={true} component={Register} />
            <Route path="/packs/:type/:id" exact={true} component={Packs} />
            <Route path="/pack-details/:id/:type" exact={true} component={PackDetails} />
            <Route path="/add-alarm/:packId/:alarmType" exact={true} component={AddAlarm} />
            <Route path="/basket" exact={true} component={Basket} />
            <Route path="/confirm-order" exact={true} component={ConfirmOrder} />
            <Route path="/orders-list" exact={true} component={OrdersList} />
            <Route path="/order-details/:id" exact={true} component={OrderDetails} />
            <Route path="/store-summary" exact={true} component={StoreSummary} />
            <Route path="/store-packs/:type" exact={true} component={StorePacks} />
            <Route path="/hints/:id/:type" exact={true} component={Hints} />
            <Route path="/help/:id" exact={true} component={Help} />
            <Route path="/notifications" exact={true} component={Notifications} />
            <Route path="/purchased-packs" exact={true} component={PurchasedPacks} />
            <Route path="/advert" exact={true} component={Advert} />
            <Route path="/edit-order/:id" exact={true} component={EditOrder} />
            <Route path="/categories/:id" exact={true} component={Categories} />
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;

