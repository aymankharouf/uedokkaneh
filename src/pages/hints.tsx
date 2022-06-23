import { useState, useEffect } from 'react'
import labels from '../data/labels'
import { productOfText } from '../data/actions'
import { Category, Country, Pack, State } from '../data/types'
import { IonBadge, IonContent, IonImg, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { useSelector } from 'react-redux'

type Props = {
  id: string,
  type: string
}
const Hints = (props: Props) => {
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateCategories = useSelector<State, Category[]>(state => state.categories)
  const stateCountries = useSelector<State, Country[]>(state => state.countries)
  const [pack] = useState(() => statePacks.find(p => p.id === props.id))
  const [packs, setPacks] = useState<Pack[]>([])
  useEffect(() => {
    setPacks(() => {
      let packs = statePacks.filter(p => 
        (props.type === 'p' && p.categoryId === pack?.categoryId && (p.sales > pack.sales || p.rating > pack.rating)) ||
        (props.type === 'o' && p.productId === pack?.productId && p.id !== pack.id && (p.isOffer || p.offerEnd)) ||
        (props.type === 'w' && p.productId === pack?.productId && p.weightedPrice < pack.weightedPrice)
      )
      return packs.sort((p1, p2) => p1.weightedPrice - p2.weightedPrice)  
    })
  }, [pack, statePacks, stateCategories, props.type]) 
  return(
    <IonPage>
      <Header title={props.type === 'p' ? labels.otherProducts : (props.type === 'o' ? labels.otherOffers : labels.otherPacks)} />
      <IonContent fullscreen>
        <IonList className="ion-padding">
          {packs.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : packs.map(p => 
              <IonItem key={p.id} routerLink={`/pack-details/${p.id}/c`}>
                <IonThumbnail slot="start">
                  <IonImg src={p.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.productName}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.productAlias}</IonText>
                  <IonText style={{color: colors[2].name}}>{p.name}</IonText>
                  <IonText style={{color: colors[3].name}}>{p.productDescription}</IonText>
                  <IonText style={{color: colors[4].name}}>{productOfText(p.trademark, p.countryId, stateCountries)}</IonText>
                  <IonText style={{color: colors[5].name}}>{`${labels.category}: ${stateCategories.find(c => c.id === p.categoryId)?.name}`}</IonText>
                  {p.closeExpired && <IonBadge color="danger">{labels.closeExpired}</IonBadge>}
                </IonLabel>
                <IonLabel slot="end" className="price">{p.isOffer || p.offerEnd ? '' : (p.price / 100).toFixed(2)}</IonLabel>
                {(p.isOffer || p.offerEnd) && <IonBadge slot="end" color="success">{(p.price / 100).toFixed(2)}</IonBadge>}
              </IonItem>
            )
          }
        </IonList>
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default Hints