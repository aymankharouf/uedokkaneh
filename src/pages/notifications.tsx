import { useMemo } from 'react'
import labels from '../data/labels'
import moment from 'moment'
import 'moment/locale/ar'
import { getMessage, deleteNotification } from '../data/actions'
import { Err, Notification, State } from '../data/types'
import { IonButton, IonButtons, IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonToast } from '@ionic/react'
import Header from './header'
import { useLocation } from 'react-router'
import { colors } from '../data/config'
import { trashOutline } from 'ionicons/icons'
import Footer from './footer'
import { useSelector } from 'react-redux'

const Notifications = () => {
  const stateNotifications = useSelector<State, Notification[]>(state => state.notifications)
  const notifications = useMemo(() => stateNotifications.sort((n1, n2) => n1.time > n2.time ? -1 : 1), [stateNotifications])
  const location = useLocation()
  const [message] = useIonToast()
  const handleDelete = (notification: Notification) => {
    try{
      deleteNotification(notification.id, stateNotifications)
      message(labels.deleteSuccess, 3000)
    } catch(error) {
      const err = error as Err
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
                  <IonText style={{color: colors[1].name}}><p>{n.text}</p></IonText>
                  <IonText style={{color: colors[2].name}}>{moment(n.time).fromNow()}</IonText>
                </IonLabel>
                <IonButtons slot="end" onClick={() => handleDelete(n)}>
                  <IonButton>
                    <IonIcon 
                      icon={trashOutline} 
                      slot="icon-only" 
                      color="danger"
                    />
                  </IonButton>
                </IonButtons>
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
