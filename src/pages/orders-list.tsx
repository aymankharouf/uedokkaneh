import { useContext, useState, useEffect } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { colors, orderStatus } from '../data/config'
import { Order } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'

const OrdersList = () => {
  const { state } = useContext(StateContext)
  const [orders, setOrders] = useState<Order[]>([])
  useEffect(() => {
    setOrders(() => {
      const orders = state.orders.filter(o => ['n', 'a', 'e', 'u', 'f', 'p', 'd'].includes(o.status))
      return orders.sort((o1, o2) => o2.time! > o1.time! ? -1 : 1)
    })
  }, [state.orders])
  return(
    <IonPage>
      <Header title={labels.myOrders} />
      <IonContent fullscreen>
        <IonList>
          {orders.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : orders.map(o =>
              <IonItem key={o.id} routerLink={`/order-details/${o.id}`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{orderStatus.find(s => s.id === o.status)?.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{moment(o.time).fromNow()}</IonText>
                  <IonText style={{color: colors[2].name}}>{(o.total / 100).toFixed(2)}</IonText>
                </IonLabel>
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default OrdersList
