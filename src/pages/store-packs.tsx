import { useState, useEffect } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { colors, storeSummary } from '../data/config'
import { productOfText } from '../data/actions'
import { CustomerInfo, Pack, PackPrice, State } from '../data/types'
import { useParams } from 'react-router'
import { IonBadge, IonContent, IonImg, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useSelector } from 'react-redux'

type Params = {
  type: string
}
type ExtendedPackPrice = PackPrice & {
  packInfo: Pack
}
const StorePacks = () => {
  const params = useParams<Params>()
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateCustomerInfo = useSelector<State, CustomerInfo | undefined>(state => state.customerInfo)
  const [storePacks, setStorePacks] = useState<ExtendedPackPrice[]>([])
  useEffect(() => {
    setStorePacks(() => {
      const storePacks = statePackPrices.filter(p => p.storeId === stateCustomerInfo?.storeId)
      const extendedStorePacks = storePacks.map(p => {
        const packInfo = statePacks.find(pa => pa.id === p.packId)!
        return {
          ...p,
          packInfo
        }
      })
      return extendedStorePacks.filter(p => (params.type === 'a')
                            || (params.type === 'o' && p.price > (p.packInfo.price ?? 0)) 
                            || (params.type === 'n' && p.price === (p.packInfo.price ?? 0) && p.storeId !== p.packInfo?.minStoreId)
                            || (params.type === 'l' && p.price === (p.packInfo.price ?? 0) && p.storeId === p.packInfo?.minStoreId))
    })
  }, [statePackPrices, statePacks, stateCustomerInfo, params.type])

  let i = 0
  return(
    <IonPage>
      <Header title={storeSummary.find(s => s.id === params.type)?.name} />
      <IonContent fullscreen>
        <IonList className="ion-padding">
          {storePacks.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : storePacks.map(p => 
              <IonItem key={i++} routerLink={`/pack-details/${p.packId}/o`}>
                <IonThumbnail slot="start">
                  <IonImg src={p.packInfo.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.packInfo.productName}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.packInfo.productAlias}</IonText>
                  <IonText style={{color: colors[2].name}}>{p.packInfo.productDescription}</IonText>
                  <IonText style={{color: colors[3].name}}>{p.packInfo.name}</IonText>
                  <IonText style={{color: colors[4].name}}>{productOfText(p.packInfo.trademark ?? '', p.packInfo.country ?? '')}</IonText>
                  {p.price > (p.packInfo.price ?? 0) && <IonText style={{color: colors[5].name}}>{`${labels.myPrice}: ${(p.price / 100).toFixed(2)}`}</IonText>}
                  <IonText style={{color: colors[6].name}}>{moment(p.time).fromNow()}</IonText>
                  {p.packInfo.isOffer && <IonBadge color="success">{labels.offer}</IonBadge>}
                </IonLabel>
                <IonLabel slot="end" className="price">{((p.packInfo.price ?? 0) / 100).toFixed(2)}</IonLabel>
              </IonItem>
            )
          }
        </IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default StorePacks
