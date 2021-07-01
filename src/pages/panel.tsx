import { useContext, useState, useEffect, useRef } from 'react'
import { StateContext } from '../data/state-provider'
import { logout } from '../data/actions'
import labels from '../data/labels'
import { IonBadge, IonContent, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle } from '@ionic/react'
import { useHistory } from 'react-router'

const Panel = () => {
  const { state, dispatch } = useContext(StateContext)
  const [notifications, setNotifications] = useState(0)
  const menuEl = useRef<HTMLIonMenuElement | null>(null)
  const history = useHistory()
  useEffect(() => {
    setNotifications(() => state.notifications.filter(n => n.status === 'n').length)
  }, [state.notifications])
  const handleLogout = () => {
    logout()
    dispatch({type: 'LOGOUT'})
    history.push('/')
    if (menuEl.current) menuEl.current.close()
    dispatch({type: 'CLEAR_BASKET'})
  }
  return(
    <IonMenu contentId="main" type="overlay" ref={menuEl} className="dark">
      <IonContent>
        <IonList>
          <IonMenuToggle autoHide={false}>
            {state.user ?
              <>
                <IonItem href="#" onClick={handleLogout}>
                  <IonLabel style={{marginBottom: '5px'}}>{labels.logout}</IonLabel>
                </IonItem>
                <IonItem routerLink="/change-password" style={{marginBottom: '0px', marginTop: '0px'}}>
                  <IonLabel>{labels.changePassword}</IonLabel>
                </IonItem>
                <IonItem routerLink="/notifications">
                  <IonLabel>{labels.notifications}</IonLabel>
                  {notifications > 0 && <IonBadge color="danger">{notifications}</IonBadge>}
                </IonItem>
                <IonItem routerLink="/packs/0/type/f" style={{marginBottom: '0px', marginTop: '0px'}}>
                  <IonLabel>{labels.favorites}</IonLabel>
                </IonItem>
                <IonItem routerLink="/orders-list" style={{marginBottom: '0px', marginTop: '0px'}}>
                  <IonLabel>{labels.myOrders}</IonLabel>
                </IonItem>
                <IonItem routerLink="/purchased-packs" style={{marginBottom: '0px', marginTop: '0px'}}>
                  <IonLabel>{labels.purchasedPacks}</IonLabel>
                </IonItem>
                <IonItem routerLink="/friends" style={{marginBottom: '0px', marginTop: '0px'}}>
                  <IonLabel>{labels.friends}</IonLabel>
                </IonItem>
              </>
            : <>
                <IonItem routerLink='/login'>
                  <IonLabel>{labels.login}</IonLabel>
                </IonItem>
                <IonItem routerLink='/register/o'>
                  <IonLabel>{labels.registerStoreOwner}</IonLabel>
                </IonItem>
              </>
            }
            {state.user && state.user.displayName && 
              <IonItem routerLink='/store-summary'>
                <IonLabel>{labels.myPacks}</IonLabel>
              </IonItem>
            }
          </IonMenuToggle>
        </IonList>
      </IonContent>
    </IonMenu>
  )
}
export default Panel
