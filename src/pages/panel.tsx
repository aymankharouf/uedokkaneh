import { useRef, useMemo } from 'react'
import { logout } from '../data/actions'
import labels from '../data/labels'
import { IonBadge, IonContent, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle } from '@ionic/react'
import { useHistory } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import firebase from '../data/firebase'
import { Customer, Notification, State } from '../data/types'

const Panel = () => {
  const dispatch = useDispatch()
  const stateUser = useSelector<State, firebase.User | undefined>(state => state.user)
  const stateCustomer = useSelector<State, Customer | undefined>(state => state.customer)
  const stateNotifications = useSelector<State, Notification[]>(state => state.notifications)
  const menuEl = useRef<HTMLIonMenuElement | null>(null)
  const history = useHistory()
  const notifications = useMemo(() => stateNotifications.filter(n => n.status === 'n').length, [stateNotifications])
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
            {stateUser ?
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
                <IonItem routerLink="/packs/f/0" style={{marginBottom: '0px', marginTop: '0px'}}>
                  <IonLabel>{labels.favorites}</IonLabel>
                </IonItem>
                <IonItem routerLink="/orders-list" style={{marginBottom: '0px', marginTop: '0px'}}>
                  <IonLabel>{labels.myOrders}</IonLabel>
                </IonItem>
                <IonItem routerLink="/purchased-packs" style={{marginBottom: '0px', marginTop: '0px'}}>
                  <IonLabel>{labels.purchasedPacks}</IonLabel>
                </IonItem>
              </>
            : <>
                <IonItem routerLink='/login'>
                  <IonLabel>{labels.login}</IonLabel>
                </IonItem>
              </>
            }
            {stateCustomer && stateCustomer.storeId && 
              <IonItem routerLink='/packs/s/0'>
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
