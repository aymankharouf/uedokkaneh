import { useEffect, useMemo, useState } from 'react'
import { quantityText, addQuantity } from '../data/actions'
import labels from '../data/labels'
import moment from 'moment'
import 'moment/locale/ar'
import { getMessage, rateProduct } from '../data/actions'
import { Customer, Err, Order, BasketPack, State } from '../data/types'
import { IonActionSheet, IonButtons, IonContent, IonIcon, IonImg, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail, useIonToast } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useLocation } from 'react-router'
import { colors } from '../data/config'
import { heartDislikeOutline, heartHalfOutline, heartOutline } from 'ionicons/icons'
import { useSelector } from 'react-redux'

type PurchasedPack = {
  orderPack: BasketPack,
  bestPrice: number,
  lastPrice: number,
  quantity: number,
  lastQuantity: number,
  lastTime: Date
}

const PurchasedPacks = () => {
  const stateOrders = useSelector<State, Order[]>(state => state.orders)
  const stateCustomer = useSelector<State, Customer | undefined>(state => state.customer)
	const [purchasedPacks, setPurchasedPacks] = useState<PurchasedPack[]>([])
  const [currentPack, setCurrentPack] = useState<PurchasedPack | undefined>(undefined)
  const [ratingOpened, setRatingOpened] = useState(false)
  const location = useLocation()
  const [message] = useIonToast()
  const deliveredOrders = useMemo(() => stateOrders.filter(o => o.status === 'd').sort((o1, o2) => o1.lastUpdate! > o2.lastUpdate! ? -1 : 1), [stateOrders])
	useEffect(() => {
		let packsArray: PurchasedPack[] = []
		deliveredOrders.forEach(o => {
			o.basket.forEach(p => {
        const found = packsArray.findIndex(pa => pa.orderPack.pack.id === p.pack.id)
				if (found > -1) {
          packsArray.splice(found, 1, {
            ...packsArray[found],
            bestPrice: packsArray[found].bestPrice <= p.actual! ? packsArray[found].bestPrice! : p.actual!,
            lastPrice: p.actual!,
            quantity: addQuantity(packsArray[found].quantity, (p.purchased || 0)),
            lastQuantity: (p.purchased || 0),
            lastTime: o.lastUpdate!
          })
				} else {
          packsArray.push({
            orderPack: p,
            bestPrice: p.actual!,
            lastPrice: p.actual!,
            quantity: (p.purchased || 0),
            lastQuantity: (p.purchased || 0),
            lastTime: o.lastUpdate!
          })
        }
			})
		})
		setPurchasedPacks(packsArray.sort((p1, p2) => p2.lastTime > p1.lastTime ? -1 : 1))
  }, [deliveredOrders])
  const handleRate = (value: number) => {
    try{
      if (stateCustomer?.status === 'b') {
        throw new Error('blockedUser')
      }
      if (currentPack) {
        rateProduct(currentPack.orderPack.pack.product.id!, value)
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
      <IonContent fullscreen className="ion-padding">
				<IonList>
					{purchasedPacks.length === 0 ? 
						<IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
					: purchasedPacks.map(p => 
              <IonItem key={i++} className={currentPack?.orderPack.pack.id === p.orderPack.pack.id ? 'selected' : ''}>
                <IonThumbnail slot="start">
                  <IonImg src={p.orderPack.pack.product.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.orderPack.pack.product.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.orderPack.pack.product.alias}</IonText>
                  <IonText style={{color: colors[2].name}}>{p.orderPack.pack.name}</IonText>
                  <IonText style={{color: colors[3].name}}>{`${labels.bestPrice}: ${(p.bestPrice / 100).toFixed(2)}`}</IonText>
                  <IonText style={{color: colors[4].name}}>{`${labels.lastPrice}: ${(p.lastPrice / 100).toFixed(2)}`}</IonText>
                  <IonText style={{color: colors[5].name}}>{`${labels.quantity}: ${quantityText(p.quantity)}`}</IonText>
                  <IonText style={{color: colors[6].name}}>{`${labels.lastQuantity}: ${quantityText(p.lastQuantity)}`}</IonText>
                  <IonText style={{color: colors[7].name}}>{`${labels.lastTime}: ${moment(p.lastTime).fromNow()}`}</IonText>
                </IonLabel>
                {!stateCustomer?.ratings?.find(r => r.productId === p.orderPack.pack.product.id) &&
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