import { useMemo } from 'react'
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
  const pack = useMemo(() => statePacks.find(p => p.id === props.id), [statePacks, props.id])
  const packs = useMemo(() => statePacks.filter(p => 
                                            (props.type === 'p' && p.product.categoryId === pack?.product.categoryId && (p.product.sales > pack.product.sales || p.product.rating > pack.product.rating)) ||
                                            (props.type === 'o' && p.product.id === pack?.product.id && p.id !== pack?.id && p.subPackId) ||
                                            (props.type === 'w' && p.product.id === pack?.product.id && p.weightedPrice < (pack?.weightedPrice || 0))
                                          )
                                          .sort((p1, p2) => p1.weightedPrice - p2.weightedPrice)
  , [pack, statePacks, props.type]) 
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
                  <IonImg src={p.product.imageUrl} alt={labels.noImage} />
                </IonThumbnail>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.product.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.product.alias}</IonText>
                  <IonText style={{color: colors[2].name}}>{p.name}</IonText>
                  <IonText style={{color: colors[3].name}}>{p.product.description}</IonText>
                  <IonText style={{color: colors[4].name}}>{productOfText(p.product.trademark, p.product.countryId, stateCountries)}</IonText>
                  <IonText style={{color: colors[5].name}}>{`${labels.category}: ${stateCategories.find(c => c.id === p.product.categoryId)?.name}`}</IonText>
                </IonLabel>
                <IonLabel slot="end" className="price">{p.subPackId ? '' : (p.price / 100).toFixed(2)}</IonLabel>
                {!!p.subPackId && <IonBadge slot="end" color="success">{(p.price / 100).toFixed(2)}</IonBadge>}
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