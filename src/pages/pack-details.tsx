import { useContext, useEffect, useState } from 'react'
import RatingStars from './rating-stars'
import { StateContext } from '../data/state-provider'
import { addAlarm, getMessage, updateFavorites, productOfText, notifyFriends } from '../data/actions'
import labels from '../data/labels'
import { setup, colors } from '../data/config'
import { Pack } from '../data/types'
import { IonActionSheet, IonButton, IonCard, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonIcon, IonImg, IonPage, IonRow, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useHistory, useLocation, useParams } from 'react-router'
import { menuOutline } from 'ionicons/icons'

type Params = {
  id: string,
  type: string
}
const PackDetails = () => {
  const { state, dispatch } = useContext(StateContext)
  const params = useParams<Params>()
  const [pack] = useState(() => state.packs.find(p => p.id === params.id))
  const [isAvailable, setIsAvailable] = useState(-1)
  const [subPackInfo, setSubPackInfo] = useState('')
  const [bonusPackInfo, setBonusPackInfo] = useState('')
  const [otherProducts, setOtherProducts] = useState<Pack[]>([])
  const [otherOffers, setOtherOffers] = useState<Pack[]>([])
  const [otherPacks, setOtherPacks] = useState<Pack[]>([])
  const [packActionOpened, setPackActionOpened] = useState(false)
  const [offerActionOpened, setOfferActionOpened] = useState(false)
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast()
  const [alert] = useIonAlert()
  useEffect(() => {
    setIsAvailable(() => state.packPrices.find(p => p.storeId === state.customerInfo?.storeId && p.packId === pack?.id) ? 1 : -1)
  }, [state.packPrices, state.customerInfo, pack])
  useEffect(() => {
    setSubPackInfo(() => {
      if (pack?.subPackId) {
        const price = Math.round(pack.price / (pack?.subQuantity ?? 0) * (pack?.subPercent ?? 0) * (1 + setup.profit))
        return `${pack.productName} ${pack?.subPackName}(${(price / 100).toFixed(2)})`
      } else {
        return ''
      }  
    })
    setBonusPackInfo(() => {
      if (pack?.bonusPackId) {
        const price = Math.round(pack.price / (pack.bonusQuantity ?? 0) * (pack.bonusPercent ?? 0) * (1 + setup.profit))
        return `${pack?.bonusProductName} ${pack.bonusPackName}(${(price / 100).toFixed(2)})`
      } else {
        return ''
      }  
    })
    setOtherProducts(() => state.packs.filter(pa => pa.categoryId === pack?.categoryId && (pa.sales > pack.sales || pa.rating > pack.rating)))
    setOtherOffers(() => state.packs.filter(pa => pa.productId === pack?.productId && pa.id !== pack.id && (pa.isOffer || pa.offerEnd)))
    setOtherPacks(() => state.packs.filter(pa => pa.productId === pack?.productId && pa.weightedPrice < pack.weightedPrice))
  }, [pack, state.packs])
  const addToBasket = (packId?: string) => {
    try{
      if (state.customerInfo?.isBlocked) {
        throw new Error('blockedUser')
      }
      if (state.basket.find(p => p.packId === packId)) {
        throw new Error('alreadyInBasket')
      }
      let foundPack = state.packs.find(p => p.id === params.id)
      let price = pack?.price ?? 0
      let maxQuantity
      if (packId !== pack?.id) {
        foundPack = state.packs.find(p => p.id === packId)
        if (packId === pack?.subPackId) {
          price = Math.round((pack?.price ?? 0) / (pack?.subQuantity ?? 0) * (pack?.subPercent ?? 0) * (1 + setup.profit))
          maxQuantity = (pack?.subQuantity ?? 0) - 1
          if (pack?.bonusPackId) maxQuantity++
        } else  {
          price = Math.round((pack?.price ?? 0) / (pack?.bonusQuantity ?? 0) * (pack?.bonusPercent ?? 0) * (1 + setup.profit))
          maxQuantity = pack?.bonusQuantity ?? 0
        }
      }
      const purchasedPack = {
        ...foundPack,
        price,
        maxQuantity,
        offerId: pack?.id
      }
      const orderLimit = state.customerInfo?.orderLimit || setup.orderLimit
      const activeOrders = state.orders.filter(o => ['n', 'a', 'e', 'f', 'p'].includes(o.status))
      const activeOrdersTotal = activeOrders.reduce((sum, o) => sum + o.total, 0)
      if (activeOrdersTotal + purchasedPack.price > orderLimit) {
        throw new Error('limitOverFlow')
      }
      dispatch({type: 'ADD_TO_BASKET', payload: purchasedPack})
      message(labels.addToBasketSuccess, 3000)
      history.goBack()
		} catch (err){
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const confirmAddAlarm = (alarmTypeId: string) => {
    try{
      if (state.customerInfo?.isBlocked) {
        throw new Error('blockedUser')
      }
      if (state.userInfo?.alarms?.find(a => a.packId === params.id && a.status === 'n')){
        throw new Error('duplicateAlarms')
      }
      const alarm = {
        packId: params.id,
        type: alarmTypeId,
        status: 'n'
      }
      addAlarm(alarm)
      message(labels.sendSuccess, 3000)
      history.goBack()
    } catch(err) {
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const handleAddAlarm = (alarmTypeId: string) => {
    try {
      if (alarmTypeId === 'ua') {
        alert({
          header: labels.confirmationTitle,
          message: labels.confirmationText,
          buttons: [
            {text: labels.cancel},
            {text: labels.yes, handler: () => confirmAddAlarm(alarmTypeId)},
          ],
        })
      } else {
        if (state.customerInfo?.isBlocked) {
          throw new Error('blockedUser')
        }
        if (state.userInfo?.alarms?.find(a => a.packId === params.id && a.status === 'n')){
          throw new Error('duplicateAlarms')
        }
        history.push(`/add-alarm/${params.id}/${alarmTypeId}`)
      }  
    } catch(err) {
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const handleFavorite = () => {
    try{
      if (state.userInfo && pack) {
        updateFavorites(state.userInfo, pack.productId)
        message(state.userInfo?.favorites?.includes(pack?.productId) ? labels.removeFavoriteSuccess : labels.addFavoriteSuccess, 3000)
      }
		} catch (err){
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const handleNotifyFriends = () => {
    try{
      if (state.customerInfo?.isBlocked) {
        throw new Error('blockedUser')
      }
      if (pack) {
        notifyFriends(pack.id)
        message(labels.sendSuccess, 3000)
      }
    } catch(err) {
      message(getMessage(location.pathname, err), 3000)
    }
  }
  let i = 0
  return (
    <IonPage>
      <Header title={`${pack?.productName}${pack?.productAlias ? '-' + pack?.productAlias : ''}`} />
      <IonContent fullscreen>
        <IonCard>
          <IonGrid>
            <IonRow>
              <IonCol className="price">{((pack?.price ?? 0) / 100).toFixed(2)}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol className="card-title">
                {`${pack?.name} ${pack?.closeExpired ? '(' + labels.closeExpired + ')' : ''}`}
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonImg src={pack?.imageUrl} alt={labels.noImage} />
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol style={{textAlign: 'center'}}>
                {pack?.productDescription}
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{productOfText(pack?.trademark ?? '', pack?.country ?? '')}</IonCol>
              <IonCol className="ion-text-end"><RatingStars rating={pack?.rating ?? 0} count={pack?.ratingCount ?? 0} /></IonCol>
            </IonRow>
          </IonGrid>
        </IonCard>
      </IonContent>
      {params.type === 'c' && 
        <div className="ion-text-center">
          <IonButton 
            fill="solid" 
            shape="round"
            color="secondary"
            style={{width: '10rem'}}
            onClick={() => pack?.isOffer ? setOfferActionOpened(true) : addToBasket(pack?.id)}
          >
            {`${labels.addToBasket}${pack?.isOffer ? '*' : ''}`}
          </IonButton>
        </div>
      }
      {state.user &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setPackActionOpened(true)} color="success">
            <IonIcon ios={menuOutline} />
          </IonFabButton>
        </IonFab>
      }
      {params.type === 'c' && pack?.isOffer ? <p className="note">{labels.offerHint}</p> : ''}
      <IonActionSheet
        isOpen={packActionOpened}
        onDidDismiss={() => setPackActionOpened(false)}
        buttons={[
          {
            text: pack?.productId && state.userInfo?.favorites?.includes(pack.productId) ? labels.removeFromFavorites : labels.addToFavorites,
            cssClass: params.type === 'c' ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleFavorite()
          },
          {
            text: labels.notifyFriends,
            cssClass: params.type === 'c' && pack?.isOffer && state.userInfo?.friends?.find(f => f.status === 'r') ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleNotifyFriends()
          },
          {
            text: labels.otherProducts,
            cssClass: params.type === 'c' && otherProducts.length > 0 ? colors[i++ % 10].name : 'ion-hide',
            handler: () => history.push(`/hints/${pack?.id}/p`)
          },
          {
            text: labels.otherOffers,
            cssClass: params.type === 'c' && otherOffers.length > 0 ? colors[i++ % 10].name : 'ion-hide',
            handler: () => history.push(`/hints/${pack?.id}/o`)
          },
          {
            text: labels.otherPacks,
            cssClass: params.type === 'c' && otherPacks.length > 0 ? colors[i++ % 10].name : 'ion-hide',
            handler: () => history.push(`/hints/${pack?.id}/w`)
          },
          {
            text: labels.changePrice,
            cssClass: params.type === 'o' && isAvailable === 1 ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleAddAlarm('cp')
          },
          {
            text: labels.packAvailable,
            cssClass: params.type === 'o' && isAvailable === -1 ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleAddAlarm('av')
          },
          {
            text: labels.packUnAvailable,
            cssClass: params.type === 'o' && isAvailable === 1 ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleAddAlarm('ua')
          },
          {
            text: labels.AlternativeAvailable,
            cssClass: params.type === 'o' ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleAddAlarm('aa')
          },
          {
            text: labels.closedExpireOffer,
            cssClass: params.type === 'o' ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleAddAlarm('eo')
          },
          {
            text: labels.groupOffer,
            cssClass: params.type === 'o' ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleAddAlarm('go')
          },
        ]}
      />
      <IonActionSheet
        isOpen={offerActionOpened}
        onDidDismiss={() => setOfferActionOpened(false)}
        buttons={[
          {
            text: labels.allOffer,
            cssClass: 'good',
            handler: () => addToBasket(pack?.id)
          },
          {
            text: subPackInfo,
            cssClass: 'medium',
            handler: () => addToBasket(pack?.subPackId)
          },
          {
            text: bonusPackInfo,
            cssClass: pack?.bonusPackId ? 'bad' : 'ion-hide',
            handler: () => addToBasket(pack?.bonusPackId)
          },
        ]}
      />
      <Footer />
    </IonPage>
  )
}

export default PackDetails
