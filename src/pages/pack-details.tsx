import { useMemo, useState } from 'react'
import RatingStars from './rating-stars'
import { addAlarm, getMessage, updateFavorites, productOfText } from '../data/actions'
import labels from '../data/labels'
import { setup, colors } from '../data/config'
import { BasketPack, Country, Customer, Err, Order, Pack, PackPrice, State } from '../data/types'
import { IonActionSheet, IonButton, IonCard, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonIcon, IonPage, IonRow, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useHistory, useLocation, useParams } from 'react-router'
import { menuOutline } from 'ionicons/icons'
import { useSelector, useDispatch } from 'react-redux'
import firebase from '../data/firebase'

type Params = {
  id: string,
  type: string
}
const PackDetails = () => {
  const dispatch = useDispatch()
  const params = useParams<Params>()
  const stateUser = useSelector<State, firebase.User | undefined>(state => state.user)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const stateCountries = useSelector<State, Country[]>(state => state.countries)
  const stateCustomer = useSelector<State, Customer | undefined>(state => state.customer)
  const stateBasket = useSelector<State, BasketPack[]>(state => state.basket)
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const pack = useMemo(() => statePacks.find(p => p.id === params.id), [statePacks, params.id])
  const isAvailable = useMemo(() => statePackPrices.find(p => p.storeId === stateCustomer?.storeId && p.packId === pack?.id) ? 1 : -1, [statePackPrices, stateCustomer, pack])
  const otherOffers = useMemo(() => statePacks.filter(pa => pa.productId === pack?.productId && pa.id !== pack.id && (pa.isOffer || pa.offerEnd)), [statePacks, pack])
  const otherPacks = useMemo(() => statePacks.filter(pa => pa.productId === pack?.productId && pa.weightedPrice < pack.weightedPrice), [statePacks, pack])
  const [packActionOpened, setPackActionOpened] = useState(false)
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast()
  const [alert] = useIonAlert()
  const addToBasket = (packId?: string) => {
    try{
      if (stateCustomer?.status === 'b') {
        throw new Error('blockedUser')
      }
      if (stateBasket.find(p => p.packId === packId)) {
        throw new Error('alreadyInBasket')
      }
      let foundPack = statePacks.find(p => p.id === params.id)
      let price = pack?.price ?? 0
      let maxQuantity
      if (packId !== pack?.id) {
        foundPack = statePacks.find(p => p.id === packId)
        if (packId === pack?.subPackId) {
          price = Math.round((pack?.price ?? 0) / (pack?.subQuantity || 0))
          maxQuantity = (pack?.subQuantity ?? 0) - 1
        }
      }
      const purchasedPack = {
        ...foundPack,
        price,
        maxQuantity,
        offerId: pack?.id
      }
      const orderLimit = stateCustomer?.orderLimit || setup.orderLimit
      const activeOrders = stateOrders.filter(o => ['n', 'a', 'e', 'f', 'p'].includes(o.status))
      const activeOrdersTotal = activeOrders.reduce((sum, o) => sum + o.total, 0)
      if (activeOrdersTotal + purchasedPack.price > orderLimit) {
        throw new Error('limitOverFlow')
      }
      dispatch({type: 'ADD_TO_BASKET', payload: purchasedPack})
      message(labels.addToBasketSuccess, 3000)
      history.goBack()
		} catch (error){
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const confirmAddAlarm = (alarmTypeId: string) => {
    try{
      if (stateCustomer?.status === 'b') {
        throw new Error('blockedUser')
      }
      if (stateCustomer?.alarms?.find(a => a.packId === params.id && a.status === 'n')){
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
    } catch(error) {
      const err = error as Err
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
        if (stateCustomer?.status === 'b') {
          throw new Error('blockedUser')
        }
        if (stateCustomer?.alarms?.find(a => a.packId === params.id && a.status === 'n')){
          throw new Error('duplicateAlarms')
        }
        history.push(`/add-alarm/${params.id}/${alarmTypeId}`)
      }  
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const handleFavorite = () => {
    try{
      if (stateCustomer && pack) {
        updateFavorites(stateCustomer, pack.productId)
        message(stateCustomer?.favorites?.includes(pack?.productId) ? labels.removeFavoriteSuccess : labels.addFavoriteSuccess, 3000)
      }
		} catch (error){
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
  let i = 0
  return (
    <IonPage>
      <Header title={`${pack?.product.name}${pack?.product.alias ? '-' + pack?.product.alias : ''}`} />
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
                <img src={pack?.imageUrl} alt={labels.noImage} />
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol style={{textAlign: 'center'}}>
                {pack?.product.description}
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>{productOfText(pack?.trademark || '', pack?.countryId || '', stateCountries)}</IonCol>
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
            onClick={() => addToBasket(pack?.id)}
          >
            {`${labels.addToBasket}`}
          </IonButton>
        </div>
      }
      {stateUser &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setPackActionOpened(true)} color="success">
            <IonIcon ios={menuOutline} />
          </IonFabButton>
        </IonFab>
      }
      <IonActionSheet
        isOpen={packActionOpened}
        onDidDismiss={() => setPackActionOpened(false)}
        buttons={[
          {
            text: pack?.productId && stateCustomer?.favorites?.includes(pack.productId) ? labels.removeFromFavorites : labels.addToFavorites,
            cssClass: params.type === 'c' ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleFavorite()
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
      <Footer />
    </IonPage>
  )
}

export default PackDetails
