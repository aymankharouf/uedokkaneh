import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { productOfText } from '../data/actions'
import { Pack } from '../data/types'
import { IonBadge, IonContent, IonImg, IonItem, IonLabel, IonList, IonPage, IonText, IonThumbnail } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'

type Props = {
  id: string,
  type: string
}
const Hints = (props: Props) => {
  const { state } = useContext(StateContext)
  const [pack] = useState(() => state.packs.find(p => p.id === props.id))
  const [packs, setPacks] = useState<Pack[]>([])
  useEffect(() => {
    setPacks(() => {
      let packs = state.packs.filter(p => 
        (props.type === 'p' && p.categoryId === pack?.categoryId && (p.sales > pack.sales || p.rating > pack.rating)) ||
        (props.type === 'o' && p.productId === pack?.productId && p.id !== pack.id && (p.isOffer || p.offerEnd)) ||
        (props.type === 'w' && p.productId === pack?.productId && p.weightedPrice < pack.weightedPrice)
      )
      return packs.sort((p1, p2) => p1.weightedPrice - p2.weightedPrice)  
    })
  }, [pack, state.packs, state.categories, props.type]) 
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
                  <IonText style={{color: colors[4].name}}>{productOfText(p.trademark, p.country)}</IonText>
                  <IonText style={{color: colors[5].name}}>{`${labels.category}: ${state.categories.find(c => c.id === p.categoryId)?.name}`}</IonText>
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