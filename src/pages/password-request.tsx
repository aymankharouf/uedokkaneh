import { useState, useMemo } from 'react'
import { getMessage, addPasswordRequest } from '../data/actions'
import labels from '../data/labels'
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import Header from './header'
import { useHistory, useLocation } from 'react-router'
import { patterns } from '../data/config'
import { useSelector } from 'react-redux'
import { Err, PasswordRequest as PasswordRequestType, State } from '../data/types'

const PasswordRequest = () => {
  const statePasswordRequests = useSelector<State, PasswordRequestType[]>(state => state.passwordRequests)
  const [mobile, setMobile] = useState('')
  const mobileInvalid = useMemo(() => !mobile || !patterns.mobile.test(mobile), [mobile])
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast();
  const handlePasswordRequest = () => {
    try{
      if (statePasswordRequests.find(r => r.mobile === mobile)) {
        throw new Error('duplicatePasswordRequest')
      }
      addPasswordRequest(mobile)
      message(labels.sendSuccess, 3000)
      history.goBack()
    } catch (error){
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }

  return (
    <IonPage>
      <Header title={labels.passwordRequest} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color={mobileInvalid ? 'danger' : ''}>
              {labels.mobile}
            </IonLabel>
            <IonInput 
              value={mobile} 
              type="number" 
              autofocus
              clearInput
              onIonChange={e => setMobile(e.detail.value!)} 
              color={mobileInvalid ? 'danger' : ''}
            />
          </IonItem>
        </IonList>
        {!mobileInvalid &&  
          <div className="ion-padding" style={{textAlign: 'center'}}>
            <IonButton 
              fill="solid" 
              shape="round"
              style={{width: '10rem'}}
              onClick={handlePasswordRequest}
            >
              {labels.send}
            </IonButton>
          </div>
        }
      </IonContent>
    </IonPage>
  )
}
export default PasswordRequest
