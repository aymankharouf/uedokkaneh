import { useMemo, useState } from 'react'
import RatingStars from './rating-stars'
import { getMessage, updateFavorites, productOfText, addStoreTrans } from '../data/actions'
import labels from '../data/labels'
import { setup, colors } from '../data/config'
import { BasketPack, Country, Customer, Err, Order, Pack, PackPrice, State, StoreTrans } from '../data/types'
import { IonActionSheet, IonButton, IonCard, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonIcon, IonImg, IonPage, IonRow, useIonAlert, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useHistory, useLocation, useParams } from 'react-router'
import { ellipsisVerticalOutline } from 'ionicons/icons'
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
  const stateStoreTrans = useSelector<State, StoreTrans[]>(state => state.storeTrans)
  const stateCountries = useSelector<State, Country[]>(state => state.countries)
  const stateCustomer = useSelector<State, Customer | undefined>(state => state.customer)
  const stateBasket = useSelector<State, BasketPack[]>(state => state.basket)
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const pack = useMemo(() => statePacks.find(p => p.id === params.id), [statePacks, params.id])
  const isAvailable = useMemo(() => statePackPrices.find(p => p.storeId === stateCustomer?.storeId && p.packId === pack?.id) ? true : false, [statePackPrices, stateCustomer, pack])
  const countryName = useMemo(() => stateCountries.find(c => c.id === pack?.product.countryId)?.name, [stateCountries, pack])
  const otherOffers = useMemo(() => statePacks.filter(pa => pa.product.id === pack?.product.id && pa.id !== pack?.id && pa.isOffer), [statePacks, pack])
  const otherPacks = useMemo(() => statePacks.filter(pa => pa.product.id === pack?.product.id && pa.weightedPrice < pack?.weightedPrice!), [statePacks, pack])
  const [packActionOpened, setPackActionOpened] = useState(false)
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast()
  const [alert] = useIonAlert()
  const [transType, setTransType] = useState('')
  const addToBasket = () => {
    try{
      if (!pack) return
      const orderLimit = stateCustomer?.orderLimit || setup.orderLimit
      const activeOrders = stateOrders.filter(o => ['n', 'a', 'e', 'f', 'p'].includes(o.status))
      const activeOrdersTotal = activeOrders.reduce((sum, o) => sum + o.total, 0)
      if (activeOrdersTotal + pack?.price! > orderLimit) {
        throw new Error('limitOverFlow')
      }
      const { weightedPrice, ...others } = pack
      dispatch({type: 'ADD_TO_BASKET', payload: others})
      message(labels.addToBasketSuccess, 3000)
      history.goBack()
		} catch (error){
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const handleFavorite = () => {
    try{
      if (stateCustomer && pack) {
        updateFavorites(stateCustomer, pack.product.id!)
        message(stateCustomer?.favorites?.includes(pack.product.id!) ? labels.removeFavoriteSuccess : labels.addFavoriteSuccess, 3000)
      }
		} catch (error){
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const handleUnAvailable = () => {
    alert({
      header: labels.confirmationTitle,
      message: labels.confirmationText,
      buttons: [
        {text: labels.cancel},
        {text: labels.yes, handler: () => {
          try{
            if (stateStoreTrans.find(t => t.storeId === stateCustomer?.storeId! && t.packId === pack?.id! && t.status === 'n')) {
              throw new Error('previousTrans')
            }
            addStoreTrans(stateCustomer?.storeId!, pack?.id!, pack?.price || 0, 0)
            message(labels.deleteSuccess, 3000)
            history.goBack()
          } catch(error) {
            const err = error as Err
            message(getMessage(location.pathname, err), 3000)
          }    
        }},
      ],
    })
  }
  const handleAvailable = (type: string) => {
    setTransType(type)
    alert({
      header: labels.enterPrice,
      inputs: [{name: 'price', type: 'number'}],
      buttons: [
        {text: labels.cancel},
        {text: labels.ok, handler: (e) => handleAddPackStore(e.price)}
      ],
    })
  }
  const handleAddPackStore = (value: string) => {
    try{
      if (stateStoreTrans.find(t => t.storeId === stateCustomer?.storeId! && t.packId === pack?.id! && t.status === 'n')) {
        throw new Error('previousTrans')
      }
      if (+value !== Number((+value).toFixed(2)) || +value <= 0) {
        throw new Error('invalidPrice')
      }
      const newPrice = Math.round(+value * 100)
      const oldPrice = statePackPrices.find(p => p.packId === pack?.id && p.storeId === stateCustomer?.storeId)?.price
      if (transType === 'c' && newPrice === oldPrice) {
        throw new Error('samePrice')
      }
      if (transType === 'n') addStoreTrans(stateCustomer?.storeId!, pack?.id!, 0, newPrice)
      else addStoreTrans(stateCustomer?.storeId!, pack?.id!, oldPrice || 0, newPrice)
      message(transType === 'n' ? labels.addSuccess : labels.editSuccess, 3000)
      history.goBack()
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }

  let i = 0
  return (
    <IonPage>
      <Header title={`${pack?.product.name}${pack?.product.alias ? '-' + pack?.product.alias : ''}`} />
      {pack &&
        <IonContent fullscreen className="ion-padding">
          <IonCard>
            <IonGrid>
              <IonRow>
                <IonCol className="price">{(pack.price / 100).toFixed(2)}</IonCol>
              </IonRow>
              <IonRow>
                <IonCol className="card-title">
                  {pack.name}
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonImg src={pack.product.imageUrl || '/no-image.webp'} alt={labels.noImage} style={{margin: 'auto'}}/>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol style={{textAlign: 'center'}}>
                  {pack.product.description}
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>{productOfText(pack.product.trademark || '', countryName || '')}</IonCol>
                <IonCol className="ion-text-end"><RatingStars rating={pack.product.rating!} count={pack.product.ratingCount!} /></IonCol>
              </IonRow>
            </IonGrid>
          </IonCard>
        </IonContent>
      }
      {params.type === 'c' && !stateBasket.find(p => p.pack.id === pack?.id && p.quantity > 0) &&
        <div className="ion-text-center">
          <IonButton 
            fill="solid" 
            shape="round"
            color="secondary"
            style={{width: '10rem'}}
            onClick={() => addToBasket()}
          >
            {`${labels.addToBasket}`}
          </IonButton>
        </div>
      }
      {stateUser &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setPackActionOpened(true)}>
            <IonIcon ios={ellipsisVerticalOutline} />
          </IonFabButton>
        </IonFab>
      }
      <IonActionSheet
        mode='ios'
        isOpen={packActionOpened}
        onDidDismiss={() => setPackActionOpened(false)}
        buttons={[
          {
            text: pack?.product.id && stateCustomer?.favorites?.includes(pack.product.id) ? labels.removeFromFavorites : labels.addToFavorites,
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
            cssClass: stateCustomer?.storeId && isAvailable ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleAvailable('c')
          },
          {
            text: labels.available,
            cssClass: stateCustomer?.storeId && !isAvailable ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleAvailable('n')
          },
          {
            text: labels.unAvailable,
            cssClass: stateCustomer?.storeId && isAvailable ? colors[i++ % 10].name : 'ion-hide',
            handler: () => handleUnAvailable()
          },
        ]}
      />
      <Footer />
    </IonPage>
  )
}

export default PackDetails
