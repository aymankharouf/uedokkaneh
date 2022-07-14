import { useMemo } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { colors, orderStatus } from '../data/config'
import { Order, State } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useSelector } from 'react-redux'

const OrdersList = () => {
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const orders = useMemo(() => stateOrders.filter(o => ['n', 'a', 'e', 'u', 'f', 'p', 'd'].includes(o.status))
                                          .sort((o1, o2) => o2.lastUpdate > o1.lastUpdate ? 1 : -1)
                          , [stateOrders])
  return(
    <IonPage>
      <Header title={labels.myOrders} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {orders.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : orders.map(o =>
              <IonItem key={o.id} routerLink={`/order-details/${o.id}`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{orderStatus.find(s => s.id === o.status)?.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{moment(o.lastUpdate).fromNow()}</IonText>
                </IonLabel>
                <IonLabel slot="end" className="price">{((o.total + o.deliveryFees - o.fraction) / 100).toFixed(2)}</IonLabel>
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
