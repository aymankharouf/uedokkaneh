import { useMemo } from 'react'
import { getMessage, quantityText, getBasket } from '../data/actions'
import labels from '../data/labels'
import { colors, setup } from '../data/config'
import { BasketPack, Customer, Err, Order, Pack, State } from '../data/types'
import { IonButton, IonButtons, IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonToast } from '@ionic/react'
import Header from './header'
import { useHistory, useLocation } from 'react-router'
import { addOutline, removeOutline } from 'ionicons/icons'
import { useSelector, useDispatch } from 'react-redux'
import Footer from './footer'

const Basket = () => {
  const dispatch = useDispatch()
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateBasket = useSelector<State, BasketPack[]>(state => state.basket)
  const stateCustomer = useSelector<State, Customer | undefined>(state => state.customer)
  const stateOpenOrderId = useSelector<State, string | undefined>(state => state.openOrderId)
  const basket = useMemo(() => getBasket(stateBasket, statePacks), [stateBasket, statePacks])
  const totalPrice = useMemo(() => basket.reduce((sum, p) => sum + Math.round(p.price * p.quantity), 0), [basket])
  const weightedPacks = useMemo(() => basket.filter(p => p.pack.quantityType !== 'c'), [basket])
  const hasChanged = useMemo(() => stateBasket?.find(p => p.oldQuantity !== p.quantity) ? true : false, [stateBasket])
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast()
  const customerOrdersTotals = useMemo(() => stateOrders.filter(o => ['n', 'a', 'e', 'f', 'p'].includes(o.status)).reduce((sum, o) => sum + o.total, 0), [stateOrders])

  const handleConfirm = () => {
    try{
      if (stateCustomer?.status === 'b') {
        throw new Error('blockedUser')
      }
      history.push('/confirm-order')
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  const handleIncrease = (packId: string) => {
    try{
      dispatch({type: 'INCREASE_QUANTITY', payload: packId})
      const orderLimit = stateCustomer?.orderLimit || setup.orderLimit
      if (customerOrdersTotals + totalPrice > orderLimit){
        throw new Error('limitOverFlow')
      }  
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  const handleDecrease = (basketPack: BasketPack) => {
    try{
      if (basketPack.quantity === basketPack.purchased) {
        throw new Error('notLessPurchased')
      }
      dispatch({type: 'DECREASE_QUANTITY', payload: basketPack.pack.id})
    } catch(error) {
      const err = error as Err
			message(getMessage(location.pathname, err), 3000)
		}
  }
  return(
    <IonPage>
      <Header title={labels.basket} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {basket.length === 0 ?
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : basket.map(p => 
            <IonItem key={p.pack.id}>
              <IonLabel>
                <IonText style={{color: colors[0].name}}>{p.pack.product.name}</IonText>
                <IonText style={{color: colors[1].name}}>{p.pack.product.alias}</IonText>
                <IonText style={{color: colors[2].name}}>{p.pack.name}</IonText>
                <IonText style={{color: colors[3].name}}>{p.priceText}</IonText>
                <IonText style={{color: colors[4].name}}>{`${labels.quantity}: ${quantityText(p.quantity)}`}</IonText>
                {p.purchased > 0 && <IonText style={{color: colors[5].name}}>{`${labels.purchased}: ${quantityText(p.purchased)}`}</IonText>}
                <IonText style={{color: colors[6].name}}>{`${labels.totalPrice}:${p.totalPriceText}`}</IonText>
              </IonLabel>
              {p.price > 0 && <>
                <IonButtons slot="end" onClick={() => handleDecrease(p)}>
                  <IonIcon 
                    ios={removeOutline} 
                    color="primary" 
                    style={{fontSize: '25px', marginRight: '5px'}} 
                  />
                </IonButtons>
                <IonButtons slot="end" onClick={() => handleIncrease(p.pack.id)}>
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
      {totalPrice > 0 && (hasChanged || !stateOpenOrderId) && 
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
      }
      <Footer inBasket />
    </IonPage>
  )
}
export default Basket
