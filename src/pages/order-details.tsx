import { useState, useMemo } from 'react'
import { cancelOrder, getMessage, quantityDetails } from '../data/actions'
import labels from '../data/labels'
import { colors } from '../data/config'
import { BasketPack, Err, Order, State } from '../data/types'
import { useHistory, useLocation, useParams } from 'react-router'
import { IonActionSheet, IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { ellipsisVerticalOutline } from 'ionicons/icons'
import { useSelector, useDispatch } from 'react-redux'
type Params = {
  id: string
}
const OrderDetails = () => {
  const dispatch = useDispatch()
  const params = useParams<Params>()
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const stateBasket = useSelector<State, BasketPack[]>(state => state.basket)
  const order = useMemo(() => stateOrders.find(o => o.id === params.id)!, [stateOrders, params.id])
  const [actionOpened, setActionOpened] = useState(false)
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast()
  const [alert] = useIonAlert()
  const orderBasket = useMemo(() => order.basket.map(p => {
    const priceNote = p.actual && p.actual !== p.price ? `${labels.orderPrice}: ${(p.price / 100).toFixed(2)}, ${labels.currentPrice}: ${(p.actual / 100).toFixed(2)}` : `${labels.unitPrice}: ${(p.price / 100).toFixed(2)}`
    return {
      ...p,
      priceNote,
    }
  }), [order])
  const activeOrder = useMemo(() => stateOrders.find(o => ['n', 'a', 'e', 's'].includes(o.status)), [stateOrders])
 
  const handleEdit = () => {
    try{
      if (stateBasket.length > 0) {
        throw new Error('clearBasketFirst')
      }
      const basket = order.basket.map(p => {
        return {
          ...p,
          oldQuantity: p.quantity
        }
      })
      dispatch({type: 'SET_BASKET', payload: basket})
      dispatch({type: 'SET_OPEN_ORDER', payload: order.id})
      history.push('/basket')
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
        {text: labels.yes, handler: () => {
          try{
            if (order) {
              cancelOrder(order)
              message(labels.deleteSuccess, 3000)
              history.goBack()
            }
          } catch(error) {
            const err = error as Err
            message(getMessage(location.pathname, err), 3000)
          }
        }},
      ],
    })
  }
  let i = 0
  return(
    <IonPage>
      <Header title={labels.orderDetails} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {orderBasket?.map(p => 
            <IonItem key={p.pack.id}>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{p.pack.product.name}</IonText>
                <IonText style={{color: colors[1].name}}>{p.pack.product.alias}</IonText>
                <IonText style={{color: colors[2].name}}>{p.pack.name}</IonText>
                <IonText style={{color: colors[3].name}}>{p.priceNote}</IonText>
                <IonText style={{color: colors[4].name}}>{quantityDetails(p)}</IonText>
              </IonLabel>
              <IonLabel slot="end" className="price">{((p.gross || 0) / 100).toFixed(2)}</IonLabel>
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
      {order.id === activeOrder?.id && 
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setActionOpened(true)} color="success">
            <IonIcon ios={ellipsisVerticalOutline} /> 
          </IonFabButton>
        </IonFab>
      }
      <IonActionSheet
        mode='ios'
        isOpen={actionOpened}
        onDidDismiss={() => setActionOpened(false)}
        buttons={[
          {
            text: labels.edit,
            cssClass: colors[i++ % 10].name,
            handler: () => handleEdit()
          },
          {
            text: labels.cancel,
            cssClass: order.status === 'n' ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleDelete()
          },
        ]}
      />
      <Footer />
    </IonPage>
  )
}
export default OrderDetails
