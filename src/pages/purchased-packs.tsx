import { useEffect, useState } from 'react'
import { quantityText, addQuantity } from '../data/actions'
import labels from '../data/labels'
import moment from 'moment'
import 'moment/locale/ar'
import { getMessage, rateProduct } from '../data/actions'
import { CustomerInfo, Err, Order, State, UserInfo } from '../data/types'
import { IonActionSheet, IonButtons, IonContent, IonIcon, IonImg, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useLocation } from 'react-router'
import { colors } from '../data/config'
import { heartDislikeOutline, heartHalfOutline, heartOutline } from 'ionicons/icons'
import { useSelector } from 'react-redux'

type PurchasedPack = {
  packId: string,
  productId: string,
  productName: string,
  productAlias: string,
  packName: string,
  imageUrl: string,
  bestPrice: number,
  lastPrice: number,
  quantity: number,
  lastQuantity: number,
  lastTime: Date
}

const PurchasedPacks = () => {
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const stateUserInfo = useSelector<State, UserInfo | undefined>(state => state.userInfo)
  const stateCustomerInfo = useSelector<State, CustomerInfo | undefined>(state => state.customerInfo)
	const [purchasedPacks, setPurchasedPacks] = useState<PurchasedPack[]>([])
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([])
  const [currentPack, setCurrentPack] = useState<PurchasedPack | undefined>(undefined)
  const [ratingOpened, setRatingOpened] = useState(false)
  const location = useLocation()
  const [message] = useIonToast()

  useEffect(() => {
    setDeliveredOrders(() => {
      const deliveredOrders = stateOrders.filter(o => o.status === 'd')
      return deliveredOrders.sort((o1, o2) => o1.time! > o2.time! ? -1 : 1)
    })
  }, [stateOrders])
	useEffect(() => {
		let packsArray: PurchasedPack[] = []
		deliveredOrders.forEach(o => {
			o.basket.forEach(p => {
        const found = packsArray.findIndex(pa => pa.packId === p.packId)
				if (found > -1) {
          packsArray.splice(found, 1, {
            ...packsArray[found],
            bestPrice: packsArray[found].bestPrice <= p.actual! ? packsArray[found].bestPrice! : p.actual!,
            lastPrice: p.actual!,
            quantity: addQuantity(packsArray[found].quantity, p.purchased),
            lastQuantity: p.purchased,
            lastTime: o.time!
          })
				} else {
          packsArray.push({
            packId: p.packId,
            productId: p.productId,
            productName: p.productName,
            productAlias: p.productAlias,
            packName: p.packName,
            imageUrl: p.imageUrl,
            bestPrice: p.actual!,
            lastPrice: p.actual!,
            quantity: p.purchased,
            lastQuantity: p.purchased,
            lastTime: o.time!
          })
        }
			})
		})
		setPurchasedPacks(packsArray.sort((p1, p2) => p2.lastTime > p1.lastTime ? -1 : 1))
  }, [deliveredOrders])
  const handleRate = (value: number) => {
    try{
      if (stateCustomerInfo?.isBlocked) {
        throw new Error('blockedUser')
      }
      if (currentPack) {
        rateProduct(currentPack.productId, value)
        message(labels.ratingSuccess, 3000)  
      }
    } catch(error) {
      const err = error as Err
      message(getMessage(location.pathname, err), 3000)
    }
  }
  const handleActions = (pack: PurchasedPack)=> {
    setCurrentPack(pack)
    setRatingOpened(true)
  }
  let i = 0
  return(
    <IonPage>
      <Header title={labels.purchasedPacks} />
      <IonContent fullscreen>
				<IonList className="ion-padding">
					{purchasedPacks.length === 0 ? 
						<IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
					: purchasedPacks.map(p => 
              <IonItem key={i++} className={currentPack?.packId === p.packId ? 'selected' : ''}>
                <IonThumbnail slot="start">
                  <IonImg src={p.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.productName}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.productAlias}</IonText>
                  <IonText style={{color: colors[2].name}}>{p.packName}</IonText>
                  <IonText style={{color: colors[3].name}}>{`${labels.bestPrice}: ${(p.bestPrice / 100).toFixed(2)}`}</IonText>
                  <IonText style={{color: colors[4].name}}>{`${labels.lastPrice}: ${(p.lastPrice / 100).toFixed(2)}`}</IonText>
                  <IonText style={{color: colors[5].name}}>{`${labels.quantity}: ${quantityText(p.quantity)}`}</IonText>
                  <IonText style={{color: colors[6].name}}>{`${labels.lastQuantity}: ${quantityText(p.lastQuantity)}`}</IonText>
                  <IonText style={{color: colors[7].name}}>{`${labels.lastTime}: ${moment(p.lastTime).fromNow()}`}</IonText>
                </IonLabel>
                {!stateUserInfo?.ratings?.find(r => r.productId === p.productId) &&
                  <IonButtons slot="end" onClick={() => handleActions(p)}>
                    <IonIcon 
                      ios={heartOutline} 
                      color="primary" 
                      style={{fontSize: '25px', marginRight: '5px'}} 
                    />
                  </IonButtons>
                }
              </IonItem>
						)
					}
				</IonList>
      </IonContent>
      <IonActionSheet
        isOpen={ratingOpened}
        onDidDismiss={() => setRatingOpened(false)}
        buttons={[
          {
            text: labels.rateGood,
            icon: heartOutline,
            cssClass: 'good',
            handler: () => handleRate(5)
          },
          {
            text: labels.rateMiddle,
            icon: heartHalfOutline,
            cssClass: 'medium',
            handler: () => handleRate(3)
          },
          {
            text: labels.rateBad,
            icon: heartDislikeOutline,
            cssClass: 'bad',
            handler: () => handleRate(1)
          },
        ]}
      />
      <Footer />
    </IonPage>
  )
}

export default PurchasedPacks