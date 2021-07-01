import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import moment from 'moment'
import 'moment/locale/ar'
import { getMessage, deleteNotification } from '../data/actions'
import { Notification } from '../data/types'
import { IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonToast } from '@ionic/react'
import Header from './header'
import { useLocation } from 'react-router'
import { colors } from '../data/config'
import { trashOutline } from 'ionicons/icons'
import Footer from './footer'

const Notifications = () => {
  const { state } = useContext(StateContext)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const location = useLocation()
  const [message] = useIonToast()
  useEffect(() => {
      setNotifications(() => [...state.notifications].sort((n1, n2) => n2.time > n1.time ? -1 : 1))
  }, [state.notifications])
  const handleDelete = (notification: Notification) => {
    try{
      deleteNotification(notification.id, state.notifications)
      message(labels.deleteSuccess, 3000)
    } catch(err) {
      message(getMessage(location.pathname, err), 3000)
    }
  }
  return (
    <IonPage>
      <Header title={labels.notifications} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {notifications.length === 0 ?
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : notifications.map(n => 
              <IonItem key={n.id}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{n.title}</IonText>
                  <IonText style={{color: colors[1].name}}><p>{n.message}</p></IonText>
                  <IonText style={{color: colors[2].name}}>{moment(n.time).fromNow()}</IonText>
                </IonLabel>
                <IonIcon 
                  ios={trashOutline} 
                  slot="end" 
                  color="danger"
                  style={{fontSize: '20px', marginRight: '10px'}} 
                  onClick={()=> handleDelete(n)}
                />
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default Notifications
