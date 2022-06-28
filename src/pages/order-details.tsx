import { useState, useMemo } from 'react'
import { cancelOrder, mergeOrders, addOrderRequest, getMessage, quantityDetails } from '../data/actions'
import labels from '../data/labels'
import { colors, orderPackStatus } from '../data/config'
import { CustomerInfo, Err, Order, Pack, State } from '../data/types'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonActionSheet, IonBadge, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { menuOutline } from 'ionicons/icons'
import { useSelector, useDispatch } from 'react-redux'

type Params = {
  id: string
}
const OrderDetails = () => {
  const dispatch = useDispatch()
  const params = useParams<Params>()
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const stateCustomerInfo = useSelector<State, CustomerInfo | undefined>(state => state.customerInfo)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const order = useMemo(() => stateOrders.find(o => o.id === params.id)!, [stateOrders, params.id])
  const [actionOpened, setActionOpened] = useState(false)
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast()
  const [alert] = useIonAlert()
  const orderBasket = useMemo(() => order.basket.map(p => {
    const priceNote = p.actual && p.actual !== p.price ? `${labels.orderPrice}: ${(p.price / 100).toFixed(2)}, ${labels.currentPrice}: ${(p.actual / 100).toFixed(2)}` : `${labels.unitPrice}: ${(p.price / 100).toFixed(2)}`
    const statusNote = `${orderPackStatus.find(s => s.id === p.status)?.name} ${p.overPriced ? labels.overPricedNote : ''}`
    return {
      ...p,
      priceNote,
      statusNote
    }
  }), [order])
  const lastOrder = useMemo(() => {
    const orders = stateOrders.filter(o => o.id !== order.id && !['c', 'm', 'r'].includes(o.status))
    orders.sort((o1, o2) => o2.time! > o1.time! ? -1 : 1)
    return ['n', 'a', 'e'].includes(orders[0]?.status) ? orders[0] : undefined
  }, [order, stateOrders])
 
  const handleEdit = () => {
    try{
      if (stateCustomerInfo?.isBlocked) {
        throw new Error('blockedUser')
      }
      if (order.status !== 'n' && order.requestType) {
        throw new Error('duplicateOrderRequest')
      }
      const basket = order.basket.map(p => {
        return {
          ...p,
          oldQuantity: p.quantity
        }
      })
      dispatch({type: 'LOAD_ORDER_BASKET', payload: basket})
      history.push(`/edit-order/${order.id}`)
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const confirmDelete = () => {
    try{
      if (stateCustomerInfo?.isBlocked) {
        throw new Error('blockedUser')
      }
      if (order) {
        if (order.status === 'n') {
          cancelOrder(order)
          message(labels.deleteSuccess, 3000)
          history.goBack()
        } else {
          if (order.requestType) {
            throw new Error('duplicateOrderRequest')
          }
          addOrderRequest(order, 'c')
          message(labels.sendSuccess, 3000)
          history.goBack()
        }  
      }
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const handleDelete = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.yes, handler: () => confirmDelete()},
      ],
    })
  }
  const handleMerge = () => {
    try{
      if (stateCustomerInfo?.isBlocked) {
        throw new Error('blockedUser')
      }
      if (lastOrder?.status !== 'n' && lastOrder?.requestType) {
        throw new Error('duplicateOrderRequest')
      }
      let found
      if (order && lastOrder) {
        for (let p of order.basket) {
          found = lastOrder.basket.find(bp => bp.packId === p.packId)
          if (found && found.price !== p.price) {
            throw new Error('samePackWithDiffPrice')
          }
          if (found?.weight && found.weight > 0 && statePacks.find(pa => pa.id === p.packId)?.isDivided) {
            throw new Error('samePackPurchasedByWeight')
          }
        }  
        if (lastOrder.status === 'n') {
          mergeOrders(lastOrder, order)
          message(labels.mergeSuccess, 3000)
        } else {
          addOrderRequest(lastOrder, 'm', order)
          message(labels.sendSuccess, 3000)  
        }
        history.goBack()
      }
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
  let i = 0
  return(
    <IonPage>
      <Header title={labels.orderDetails} />
      <IonContent fullscreen>
        <IonList className="ion-padding">
          {orderBasket?.map(p => 
            <IonItem key={p.packId}>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{p.productName}</IonText>
                <IonText style={{color: colors[1].name}}>{p.productAlias}</IonText>
                <IonText style={{color: colors[2].name}}>{p.packName}</IonText>
                <IonText style={{color: colors[3].name}}>{p.priceNote}</IonText>
                <IonText style={{color: colors[4].name}}>{quantityDetails(p)}</IonText>
                <IonText style={{color: colors[5].name}}>{`${labels.status}: ${p.statusNote}`}</IonText>
                {p.closeExpired && <IonBadge color="danger">{labels.closeExpired}</IonBadge>}
              </IonLabel>
              <IonLabel slot="end" className="price">{(p.gross / 100).toFixed(2)}</IonLabel>
            </IonItem>
          )}
          <IonItem>
            <IonLabel>
              <IonText style={{color: colors[0].name}}>{labels.total}</IonText>
            </IonLabel>
            <IonLabel slot="end" className="price">{(order.total / 100).toFixed(2)}</IonLabel>
          </IonItem>
          {order.deliveryFees &&
            <IonItem>
              <IonLabel>
                <IonText style={{color: colors[1].name}}>{labels.deliveryFees}</IonText>
              </IonLabel>
              <IonLabel slot="end" className="price">{(order.deliveryFees / 100).toFixed(2)}</IonLabel>
            </IonItem>    
          }
          {order.fraction > 0 &&
            <IonItem>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{labels.discount}</IonText>
              </IonLabel>
              <IonLabel slot="end" className="price">{(order.fraction! / 100).toFixed(2)}</IonLabel>
            </IonItem>    
          }
          <IonItem>
            <IonLabel>
              <IonText style={{color: colors[0].name}}>{labels.net}</IonText>
            </IonLabel>
            <IonLabel slot="end" className="price">{((order.total + order.deliveryFees - order.fraction) / 100).toFixed(2)}</IonLabel>
          </IonItem>    
        </IonList>
      </IonContent>
      {order && ['n', 'a', 'e'].includes(order.status) && 
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setActionOpened(true)} color="success">
            <IonIcon ios={menuOutline} /> 
          </IonFabButton>
        </IonFab>
      }
      <IonActionSheet
        isOpen={actionOpened}
        onDidDismiss={() => setActionOpened(false)}
        buttons={[
          {
            text: order.status === 'n' ? labels.editBasket : labels.editBasketRequest,
            cssClass: colors[i++ % 10].name,
            handler: () => handleEdit()
          },
          {
            text: order.status === 'n' ? labels.cancel : labels.cancelRequest,
            cssClass: colors[i++ % 10].name,
            handler: () => handleDelete()
          },
          {
            text: lastOrder?.status === 'n' ? labels.merge : labels.mergeRequest,
            cssClass: order.status === 'n' && lastOrder ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleMerge()
          }
        ]}
      />
      <Footer />
    </IonPage>
  )
}
export default OrderDetails
