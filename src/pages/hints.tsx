import { useMemo } from 'react'
import labels from '../data/labels'
import { productOfText } from '../data/actions'
import { Category, Country, Pack, State } from '../data/types'
import { IonContent, IonItem, IonLabel, IonList, IonPage, IonText } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { colors } from '../data/config'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router'

type Params = {
  id: string,
  type: string
}
const Hints = () => {
  const params = useParams<Params>()
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateCategories = useSelector<State, Category[]>(state => state.categories)
  const stateCountries = useSelector<State, Country[]>(state => state.countries)
  const pack = useMemo(() => statePacks.find(p => p.id === params.id), [statePacks, params.id])
  const packs = useMemo(() => statePacks.filter(p => 
                                            (params.type === 'p' && p.product.categoryId === pack?.product.categoryId && p.product.id !== pack.product.id) ||
                                            (params.type === 'o' && p.product.id === pack?.product.id && p.id !== pack?.id)
                                          )
                                          .map(p => {
                                            const category = stateCategories.find(c => c.id === p.product.categoryId)!
                                            const country = stateCountries.find(c => c.id === p.product.countryId)
                                            return {
                                              ...p,
                                              categoryName: category.name,
                                              countryName: country?.name || ''
                                            }              
                                          })
                                          .sort((p1, p2) => p1.weightedPrice - p2.weightedPrice)
  , [pack, statePacks, params.type, stateCategories, stateCountries]) 
  return(
    <IonPage>
      <Header title={params.type === 'p' ? labels.otherProducts : labels.otherOffers} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          {packs.length === 0 ? 
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : packs.map(p => 
              <IonItem key={p.id} routerLink={`/pack-details/${p.id}/c`}>
                <IonLabel>
                  <IonText style={{color: colors[0].name}}>{p.product.name}</IonText>
                  <IonText style={{color: colors[1].name}}>{p.product.alias}</IonText>
                  <IonText style={{color: colors[2].name}}>{p.name}</IonText>
                  <IonText style={{color: colors[3].name}}>{p.product.description}</IonText>
                  <IonText style={{color: colors[4].name}}>{productOfText(p.product.trademark, p.countryName)}</IonText>
                  <IonText style={{color: colors[5].name}}>{`${labels.category}: ${p.categoryName}`}</IonText>
                </IonLabel>
                <IonLabel slot="end" className="price">{(p.price / 100).toFixed(2)}</IonLabel>
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