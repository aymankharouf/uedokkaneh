import { IonBadge, IonButton, IonButtons, IonFooter, IonIcon, IonToolbar, useIonAlert, useIonToast } from '@ionic/react'
import { cartOutline, homeOutline, trashOutline } from 'ionicons/icons'
import { useHistory, useLocation } from 'react-router'
import { useSelector } from 'react-redux'
import { BasketPack, Err, State } from '../data/types'
import { useDispatch } from 'react-redux'
import labels from '../data/labels'
import { getMessage } from '../data/actions'
import { useMemo } from 'react'
type Props = {
  inBasket?: boolean
}
const Footer = (props: Props) => {
  const dispatch = useDispatch()
  const stateBasket = useSelector<State, BasketPack[]>(state => state.basket)
  const basket = useMemo(() => stateBasket.filter(p => p.quantity > 0), [stateBasket])
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast()
  const [alert] = useIonAlert()
  const handleDelete = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.yes, handler: () => {
          try{
            dispatch({type: 'CLEAR_BASKET'})
            dispatch({type: 'SET_OPEN_ORDER', payload: undefined})
            message(labels.deleteSuccess, 3000)
            history.push('/')
          } catch(error) {
            const err = error as Err
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })

  }
  return (
    <IonFooter>
      <IonToolbar>
        <IonButtons slot="start" onClick={() => history.push('/')}>
          <IonButton>
            <IonIcon 
              slot="icon-only"
              icon={homeOutline} 
              // style={{fontSize: '20px', marginRight: '10px'}} 
            />
          </IonButton>
        </IonButtons>
        {props.inBasket ? 
          <IonButtons slot="end" onClick={handleDelete}>
            <IonButton>
              <IonIcon 
                slot="icon-only"
                icon={trashOutline} 
                // style={{fontSize: '20px', marginRight: '10px'}} 
              />
            </IonButton>
          </IonButtons>
        :
          <IonButtons slot="end" onClick={() => {if (basket.length > 0) history.push('/basket')}}>
            {basket.length > 0 && <IonBadge className="badge" style={{right: '10px'}}>{basket.length}</IonBadge>}
            <IonButton>
              <IonIcon 
                slot="icon-only"
                icon={cartOutline} 
                // style={{fontSize: '20px', marginRight: '10px'}} 
              />
            </IonButton>
          </IonButtons>
        }
      </IonToolbar>
    </IonFooter>
  )
}

export default Footer