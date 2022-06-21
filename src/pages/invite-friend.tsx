import { useState, useEffect } from 'react'
import { inviteFriend, getMessage } from '../data/actions'
import labels from '../data/labels'
import { IonContent, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast, IonButton } from '@ionic/react'
import Header from './header'
import { useHistory, useLocation } from 'react-router'
import { patterns } from '../data/config'
import { useSelector } from 'react-redux'
import { CustomerInfo, Err, State, UserInfo } from '../data/types'

const InviteFriend = () => {
  const stateCustomerInfo = useSelector<State, CustomerInfo | undefined>(state => state.customerInfo)
  const stateUserInfo = useSelector<State, UserInfo | undefined>(state => state.userInfo)
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [nameInvalid, setNameInvalid] = useState(true)
  const [mobileInvalid, setMobileInvalid] = useState(true)
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast()

  useEffect(() => {
    setNameInvalid(!name || !patterns.name.test(name))
  }, [name])
  useEffect(() => {
    setMobileInvalid(!mobile || !patterns.mobile.test(mobile))
  }, [mobile])
  const handleSend = () => {
    try{
      if (stateCustomerInfo?.isBlocked) {
        throw new Error('blockedUser')
      }
      if (stateUserInfo?.friends?.find(f => f.mobile === mobile)) {
        throw new Error('duplicateInvitation')
      }
      if (mobile === stateUserInfo?.mobile) {
        throw new Error('invalidMobile')
      }
      inviteFriend(mobile, name)
      message(labels.sendSuccess, 3000)
      history.goBack()
    } catch (error){
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }

  return (
    <IonPage>
      <Header title={labels.inviteFriend} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color={nameInvalid ? 'danger' : 'primary'}>
              {labels.name}
            </IonLabel>
            <IonInput 
              value={name} 
              type="text" 
              placeholder={labels.namePlaceholder}
              autofocus
              clearInput
              onIonChange={e => setName(e.detail.value!)} 
              color={nameInvalid ? 'danger' : ''}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color={mobileInvalid ? 'danger' : 'primary'}>
              {labels.mobile}
            </IonLabel>
            <IonInput 
              value={mobile} 
              type="number" 
              placeholder={labels.mobilePlaceholder}
              clearInput
              onIonChange={e => setMobile(e.detail.value!)} 
              color={mobileInvalid ? 'danger' : ''}
            />
          </IonItem>
        </IonList>
      </IonContent>
      {!mobileInvalid && !nameInvalid &&
        <div className="ion-padding" style={{textAlign: 'center'}}>
          <IonButton 
            fill="solid" 
            shape="round"
            style={{width: '10rem'}}
            onClick={handleSend}
          >
            {labels.send}
          </IonButton>
        </div>
      }
    </IonPage>
  )
}
export default InviteFriend
