import { useState, useMemo } from 'react'
import { changePassword, getMessage } from '../data/actions'
import labels from '../data/labels'
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonPage, useIonLoading, useIonToast } from '@ionic/react'
import Header from './header'
import { useHistory, useLocation } from 'react-router'
import { patterns } from '../data/config'
import { Err } from '../data/types'

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('')
  const oldPasswordInvalid = useMemo(() => !patterns.password.test(oldPassword), [oldPassword])
  const [newPassword, setNewPassword] = useState('')
  const newPasswordInvalid = useMemo(() => !patterns.password.test(newPassword), [newPassword])
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast();
  const [loading, dismiss] = useIonLoading();

  const handleSubmit = async () => {
    try{
      loading()
      await changePassword(oldPassword, newPassword)
      dismiss()
      message(labels.changePasswordSuccess, 3000)
      history.goBack()
    } catch (error){
      dismiss()
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }

  return (
    <IonPage>
      <Header title={labels.changePassword} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color={oldPasswordInvalid ? 'danger' : ''}>
              {labels.oldPassword}
            </IonLabel>
            <IonInput 
              value={oldPassword} 
              type="number" 
              autofocus
              clearInput
              onIonChange={e => setOldPassword(e.detail.value!)} 
              color={oldPasswordInvalid ? 'danger' : ''}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color={newPasswordInvalid ? 'danger' : ''}>
              {labels.newPassword}
            </IonLabel>
            <IonInput 
              value={newPassword} 
              type="number" 
              clearInput
              onIonChange={e => setNewPassword(e.detail.value!)} 
              color={newPasswordInvalid ? 'danger' : ''}
            />
          </IonItem>
        </IonList>
        {!oldPasswordInvalid && !newPasswordInvalid && 
          <IonButton expand="block" fill="clear" onClick={handleSubmit}>{labels.submit}</IonButton>
        }
      </IonContent>
    </IonPage>
  )
}
export default ChangePassword
