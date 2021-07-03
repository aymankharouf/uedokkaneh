import { useContext, useEffect, useState } from 'react'
import { StateContext } from '../data/state-provider'
import { getMessage, quantityText, getBasket } from '../data/actions'
import labels from '../data/labels'
import { colors, setup } from '../data/config'
import { BigBasketPack } from '../data/types'
import { IonBadge, IonButton, IonButtons, IonContent, IonIcon, IonImg, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail, useIonToast } from '@ionic/react'
import Header from './header'
import { useHistory, useLocation } from 'react-router'
import { addOutline, removeOutline } from 'ionicons/icons'

const Basket = () => {
  const { state, dispatch } = useContext(StateContext)
  const [submitVisible, setSubmitVisible] = useState(true)
  const [basket, setBasket] = useState<BigBasketPack[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [weightedPacks, setWeightedPacks] = useState<BigBasketPack[]>([])
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast()
  const [customerOrdersTotals] = useState(() => {
    const activeOrders = state.orders.filter(o => ['n', 'a', 'e', 'f', 'p'].includes(o.status))
    return activeOrders.reduce((sum, o) => sum + o.total, 0)
  })
  useEffect(() => {
    if (state.basket.length === 0) history.push('/home')
    else setBasket(getBasket(state.basket, state.packs))
  }, [state.basket, state.packs, history])
  useEffect(() => {
    setTotalPrice(() => basket.reduce((sum, p) => sum + Math.round(p.price * p.quantity), 0))
    setWeightedPacks(() => basket.filter(p => p.byWeight))
  }, [basket])
  useEffect(() => {
    const orderLimit = state.customerInfo?.orderLimit ?? setup.orderLimit
    if (customerOrdersTotals + totalPrice > orderLimit){
      setSubmitVisible(false)
    } else {
      setSubmitVisible(true)
    }
  }, [state.customerInfo, customerOrdersTotals, totalPrice])

  const handleConfirm = () => {
    try{
      if (state.customerInfo?.isBlocked) {
        throw new Error('blockedUser')
      }
      history.push('/confirm-order')
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  const handleIncrease = (pack: BigBasketPack) => {
    try{
      dispatch({type: 'INCREASE_QUANTITY', payload: pack})
      const orderLimit = state.customerInfo?.orderLimit ?? setup.orderLimit
      if (customerOrdersTotals + totalPrice > orderLimit){
        throw new Error('limitOverFlow')
      }  
    } catch(err) {
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return(
    <IonPage>
      <Header title={labels.basket} />
      <IonContent fullscreen>
        <IonList className="ion-padding">
          {basket.length === 0 ?
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : basket.map(p => 
            <IonItem key={p.packId}>
              <IonThumbnail slot="start">
                <IonImg src={p.imageUrl} alt={labels.noImage} />
              </IonThumbnail>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{p.productName}</IonText>
                <IonText style={{color: colors[1].name}}>{p.productAlias}</IonText>
                <IonText style={{color: colors[2].name}}>{p.packName}</IonText>
                <IonText style={{color: colors[3].name}}>{p.priceText}</IonText>
                <IonText style={{color: colors[4].name}}>{`${labels.quantity}: ${quantityText(p.quantity)}`}</IonText>
                <IonText style={{color: colors[5].name}}>{`${labels.totalPrice}:${p.totalPriceText}`}</IonText>
                {p.closeExpired && <IonBadge color="danger">{labels.closeExpired}</IonBadge>}
              </IonLabel>
              {p.price > 0 && <>
                <IonButtons slot="end" onClick={() => dispatch({type: 'DECREASE_QUANTITY', payload: p})}>
                  <IonIcon 
                    ios={removeOutline} 
                    color="primary" 
                    style={{fontSize: '25px', marginRight: '5px'}} 
                  />
                </IonButtons>
                <IonButtons slot="end" onClick={() => handleIncrease(p)}>
                  <IonIcon 
                    ios={addOutline} 
                    color="primary" 
                    style={{fontSize: '25px', marginRight: '5px'}} 
                  />
                </IonButtons>
              </>}
            </IonItem>    
          )}
        </IonList>
        <p className="note">{weightedPacks.length > 0 ? labels.weightedPricesNote : ''}</p>
      </IonContent>
      {submitVisible ? 
        <div className="ion-text-center">
          <IonButton 
            fill="solid" 
            shape="round"
            color="secondary"
            style={{width: '10rem'}}
            onClick={handleConfirm}
          >
            {`${labels.submit} ${(totalPrice / 100).toFixed(2)}`}
          </IonButton>
        </div>
      : 
        <div className="ion-text-center">
          <IonButton 
            fill="solid" 
            shape="round"
            color="danger"
            style={{width: '10rem'}}
            onClick={() => history.push('/help/ol')}
          >
            {labels.limitOverFlowNote}
          </IonButton>
        </div>
      }
    </IonPage>
  )
}
export default Basket
