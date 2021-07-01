import {useState, useEffect, useContext} from 'react'
import {getMessage, addPasswordRequest} from '../data/actions'
import labels from '../data/labels'
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonPage, useIonToast } from '@ionic/react'
import Header from './header'
import { useHistory, useLocation } from 'react-router'
import { StateContext } from '../data/state-provider'
import { patterns } from '../data/config'

const PasswordRequest = () => {
  const {state} = useContext(StateContext)
  const [mobile, setMobile] = useState('')
  const [mobileInvalid, setMobileInvalid] = useState(false)
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast();
  useEffect(() => {
    setMobileInvalid(!mobile || !patterns.mobile.test(mobile))
  }, [mobile])
  const handlePasswordRequest = () => {
    try{
      if (state.passwordRequests.find(r => r.mobile === mobile)) {
        throw new Error('duplicatePasswordRequest')
      }
      addPasswordRequest(mobile)
      message(labels.sendSuccess, 3000)
      history.goBack()
    } catch (err){
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
