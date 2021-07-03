import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { deleteFriend, getMessage } from '../data/actions'
import { friendStatus, colors } from '../data/config'
import { Friend } from '../data/types'
import { IonContent, IonFab, IonFabButton, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useLocation } from 'react-router'
import { addOutline, trashOutline } from 'ionicons/icons'

const Friends = () => {
  const { state } = useContext(StateContext)
  const [friends, setFriends] = useState<Friend[]>([])
  const location = useLocation()
  const [message] = useIonToast()
  const [alert] = useIonAlert()
  useEffect(() => {
    setFriends(() => {
      const friends = state.userInfo?.friends?.slice() || []
      return friends.sort((f1, f2) => f1.name > f2.name ? 1 : -1)
    })
  }, [state.userInfo])
  const handleDelete = (mobile: string) => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.yes, handler: () => {
          try{
            if (state.userInfo) {
              deleteFriend(state.userInfo, mobile)
              message(labels.deleteSuccess, 3000)  
            }
          } catch(err) {
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })
  }
  let i = 0
  return (
    <IonPage>
      <Header title={labels.friends} />
      <IonContent fullscreen>
        <IonList className="ion-padding">
          {friends.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : friends.map(f =>
              <IonItem key={i++}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{f.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{f.mobile}</IonText>
                  <IonText style={{color: colors[2].name}}>{friendStatus.find(s => s.id === f.status)?.name}</IonText>
                </IonLabel>
                <IonIcon 
                  ios={trashOutline} 
                  slot="end" 
                  color="danger"
                  style={{fontSize: '20px', marginRight: '10px'}} 
                  onClick={()=> handleDelete(f.mobile)}
                />
              </IonItem>    
            )
          }
        </IonList>
      </IonContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton routerLink="/invite-friend" color="success">
          <IonIcon ios={addOutline} /> 
        </IonFabButton>
      </IonFab>
      <Footer />
    </IonPage>
  )
}

export default Friends
