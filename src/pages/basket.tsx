import { useContext, useEffect, useState, useRef } from 'react'
import { StateContext } from '../data/state-provider'
import { getMessage, quantityText, getBasket } from '../data/actions'
import labels from '../data/labels'
import { colors, setup } from '../data/config'
import { BigBasketPack } from '../data/types'
import { IonActionSheet, IonButton, IonContent, IonImg, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail, useIonToast } from '@ionic/react'
import Header from './header'
import { useHistory, useLocation } from 'react-router'

const Basket = () => {
  const { state, dispatch } = useContext(StateContext)
  const [submitVisible, setSubmitVisible] = useState(true)
  const [currentPack, setCurrentPack] = useState<BigBasketPack | undefined>(undefined)
  const [basket, setBasket] = useState<BigBasketPack[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [weightedPacks, setWeightedPacks] = useState<BigBasketPack[]>([])
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast()
  const [actionOpened, setActionOpened] = useState(false)
  const [customerOrdersTotals] = useState(() => {
    const activeOrders = state.orders.filter(o => ['n', 'a', 'e', 'f', 'p'].includes(o.status))
    return activeOrders.reduce((sum, o) => sum + o.total, 0)
  })
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
  const handleHints = (pack: BigBasketPack) => {
    setCurrentPack(pack)
    setActionOpened(true)
  }
  let i = 0
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
          </IonLabel>
          <IonLabel slot="end" className="price">{p.price!.toFixed(2)}</IonLabel>
        </IonItem>    

          // <ListItem
          //   title={p.productName}
          //   subtitle={p.productAlias}
          //   text={p.packName}
          //   footer={`${labels.totalPrice}:${p.totalPriceText}`}
          //   key={p.packId}
          //   className={(currentPack && currentPack.packId === p.packId) ? 'selected' : ''}
          // >
          //   <img src={p.imageUrl} slot="media" className="img-list" alt={labels.noImage} />
          //   <div className="list-subtext1">{p.priceText}</div>
          //   <div className="list-subtext2">{`${labels.quantity}: ${quantityText(p.quantity)}`}</div>
          //   {p.closeExpired ? <Badge slot="text" color="red">{labels.closeExpired}</Badge> : ''}
          //   {p.price === 0 ? '' : 
          //     <Stepper 
          //       slot="after" 
          //       fill
          //       buttonsOnly
          //       onStepperPlusClick={() => handleIncrease(p)}
          //       onStepperMinusClick={() => dispatch({type: 'DECREASE_QUANTITY', payload: p})}
          //     />
          //   }
          //   {p.otherProducts + p.otherOffers + p.otherPacks === 0 ? '' : <Link className="hints" slot="footer" iconMaterial="warning" iconColor="red" onClick={()=> handleHints(p)}/>}
          // </ListItem>
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
    <IonActionSheet
      isOpen={actionOpened}
      onDidDismiss={() => setActionOpened(false)}
      buttons={[
        {
          text: labels.otherProducts,
          cssClass: currentPack && currentPack.otherProducts > 0 ? colors[i++ % 10].name : 'ion-hide',
          handler: () => history.push(`/hints/${currentPack?.packId}/type/p`)
        },
        {
          text: labels.otherOffers,
          cssClass: currentPack && currentPack.otherOffers > 0 ? colors[i++ % 10].name : 'ion-hide',
          handler: () => history.push(`/hints/${currentPack?.packId}/type/o`)
        },
        {
          text: labels.otherPacks,
          cssClass: currentPack && currentPack.otherPacks > 0 ? colors[i++ % 10].name : 'ion-hide',
          handler: () => history.push(`/hints/${currentPack?.packId}/type/w`)
        },
      ]}
    />
  </IonPage>
  )
}
export default Basket
