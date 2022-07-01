import { useMemo } from 'react'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { colors } from '../data/config'
import { productOfText } from '../data/actions'
import { Country, Customer, Pack, PackPrice, State } from '../data/types'
import { IonBadge, IonContent, IonImg, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useSelector } from 'react-redux'

const StorePacks = () => {
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateCountries = useSelector<State, Country[]>(state => state.countries)
  const stateCustomer = useSelector<State, Customer | undefined>(state => state.customer)
  const storePacks = useMemo(() => statePackPrices.filter(p => p.storeId === stateCustomer?.storeId)
                                                  .map(p => {
                                                    const pack = statePacks.find(pa => pa.id === p.packId)!
                                                    return {
                                                      ...p,
                                                      pack
                                                    }
                                                  })
  , [statePackPrices, statePacks, stateCustomer])

  let i = 0
  return(
    <IonPage>
      <Header title={labels.myPacks} />
      <IonContent fullscreen>
        <IonList className="ion-padding">
          {storePacks.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem> 
          : storePacks.map(p => 
              <IonItem key={i++} routerLink={`/pack-details/${p.packId}/o`}>
                <IonThumbnail slot="start">
                  <IonImg src={p.pack.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.pack.product.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.pack.product.alias}</IonText>
                  <IonText style={{color: colors[2].name}}>{p.pack.product.description}</IonText>
                  <IonText style={{color: colors[3].name}}>{p.pack.name}</IonText>
                  <IonText style={{color: colors[4].name}}>{productOfText(p.pack.trademark || '', p.pack.countryId || '', stateCountries)}</IonText>
                  {p.price > (p.pack.price ?? 0) && <IonText style={{color: colors[5].name}}>{`${labels.myPrice}: ${(p.price / 100).toFixed(2)}`}</IonText>}
                  <IonText style={{color: colors[6].name}}>{moment(p.time).fromNow()}</IonText>
                  {p.pack.isOffer && <IonBadge color="success">{labels.offer}</IonBadge>}
                </IonLabel>
                <IonLabel slot="end" className="price">{((p.pack.price ?? 0) / 100).toFixed(2)}</IonLabel>
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
