import { useMemo } from 'react'
import { confirmOrder, getMessage, quantityText, getBasket, updateOrder } from '../data/actions'
import labels from '../data/labels'
import { setup, colors } from '../data/config'
import { BasketPack, State, Region, Customer, Pack, Advert, Order, Err } from '../data/types'
import { useHistory, useLocation } from 'react-router'
import { IonButton, IonContent, IonItem, IonLabel, IonList, IonPage, IonText, useIonToast } from '@ionic/react'
import Header from './header'
import { useSelector, useDispatch } from 'react-redux'
import firebase from '../data/firebase'
import Footer from './footer'

const ConfirmOrder = () => {
  const dispatch = useDispatch()
  const stateUser = useSelector<State, firebase.User | undefined>(state => state.user)
  const stateRegions = useSelector<State, Region[]>(state => state.regions)
  const stateCustomer = useSelector<State, Customer | undefined>(state => state.customer)
  const stateBasket = useSelector<State, BasketPack[]>(state => state.basket)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const stateAdverts = useSelector<State, Advert[]>(state => state.adverts)
  const stateOpenOrder = useSelector<State, string | undefined>(state => state.openOrderId)
  const basket = useMemo(() => getBasket(stateBasket, statePacks), [stateBasket, statePacks])
  const total = useMemo(() => basket.reduce((sum, p) => sum + Math.round(p.price * p.quantity), 0), [basket])
  const fraction = useMemo(() => total - Math.floor(total / 5) * 5, [total])
  const weightedPacks = useMemo(() => basket.filter(p => p.pack.quantityType !== 'c'), [basket])
  const regionFees = useMemo(() => stateRegions.find(r => r.id === stateCustomer?.regionId)?.fees || 0, [stateRegions, stateCustomer])
  const deliveryFees = useMemo(() => stateCustomer?.deliveryFees || regionFees, [stateCustomer, regionFees])
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast()

  const handleConfirm = () => {
    try{
      const orderLimit = stateCustomer?.orderLimit || setup.orderLimit
      const totalOrders = stateOrders.filter(o => o.id !== stateOpenOrder && ['n', 'a', 'e', 'f', 's'].includes(o.status)).reduce((sum, o) => sum + o.total, 0)
      if (totalOrders + total > orderLimit) {
        throw new Error('limitOverFlow')
      }
      let packs = basket.map(p => {
        const { totalPriceText, priceText, ...others } = p
        others.status = others.status === 'e' ? 'u' : others.status
        return others
      })
      let order: Order
      if (stateOpenOrder) {
        order = stateOrders.find(o => o.id === stateOpenOrder)!
        order.basket = packs
        order.total = total
        updateOrder(order)
      } else {
        if (stateAdverts[0]?.type === 'n') {
          message(stateAdverts[0].text, 2000)
          return
        }
        if (stateCustomer?.status === 'b') {
          throw new Error('blockedUser')
        }
        const activeOrders = stateOrders.filter(o => ['n', 'e', 's', 'f'].includes(o.status)).length
        if (activeOrders > 0) {
          throw new Error('activeOrderFound')
        }
        packs = packs.filter(p => p.price > 0)
        order = {
          status: 'n',
          basket: packs,
          deliveryFees,
          deliveryTime: '',
          total,
          fraction,
          lastUpdate: new Date(),      
          trans: [{type: 'n', time: new Date().getTime()}]
        }
        confirmOrder(order)
      }
      dispatch({type: 'CLEAR_BASKET'})
      dispatch({type: 'SET_OPEN_ORDER', payload: undefined})
      message(labels.sendSuccess, 3000)
      history.push('/')
    } catch (error){
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
  if (!stateUser) return <IonPage><h5 className="center"><a href="/login">{labels.relogin}</a></h5></IonPage>
  return (
    <IonPage>
      <Header title={labels.sendOrder} />
      <IonContent fullscreen>
        <IonList className="ion-padding">
          {basket.map(p => 
            <IonItem key={p.pack.id}>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{p.pack.product.name}</IonText>
                <IonText style={{color: colors[1].name}}>{p.pack.product.alias}</IonText>
                <IonText style={{color: colors[2].name}}>{p.pack.name}</IonText>
                <IonText style={{color: colors[3].name}}>{p.priceText}</IonText>
                <IonText style={{color: colors[4].name}}>{`${labels.quantity}: ${quantityText(p.quantity)}`}</IonText>
              </IonLabel>
              <IonLabel slot="end" className="price">{p.totalPriceText}</IonLabel>
            </IonItem>    
          )}
          <IonItem>
            <IonLabel>
              <IonText style={{color: colors[0].name}}>{labels.total}</IonText>
            </IonLabel>
            <IonLabel slot="end" className="price">{(total / 100).toFixed(2)}</IonLabel>
          </IonItem>    
          <IonItem>
            <IonLabel>
              <IonText style={{color: colors[1].name}}>{labels.deliveryFees}</IonText>
            </IonLabel>
            <IonLabel slot="end" className="price">{(deliveryFees / 100).toFixed(2)}</IonLabel>
          </IonItem>    
          <IonItem>
            <IonLabel>
              <IonText style={{color: colors[3].name}}>{labels.net}</IonText>
            </IonLabel>
            <IonLabel slot="end" className="price">{((total + deliveryFees - fraction) / 100).toFixed(2)}</IonLabel>
          </IonItem>    
        </IonList>
        <p className="note">{weightedPacks.length > 0 ? labels.weightedPricesNote : ''}</p>
      </IonContent>
      <div className="ion-text-center">
        <IonButton 
          fill="solid" 
          shape="round"
          color="secondary"
          style={{width: '10rem'}}
          onClick={handleConfirm}
        >
          {labels.send}
        </IonButton>
      </div>
      <Footer inBasket />
    </IonPage>
  )
}
export default ConfirmOrder
