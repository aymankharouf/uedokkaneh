import { useState, useMemo } from 'react'
import labels from '../data/labels'
import { sortByList, colors } from '../data/config'
import { productOfText } from '../data/actions'
import { Category, Country, Customer, Pack, State } from '../data/types'
import { IonActionSheet, IonBadge, IonContent, IonImg, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonText, IonThumbnail } from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'

type Params = {
  id: string,
  type: string
}
const Packs = () => {
  const params = useParams<Params>()
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateCategories = useSelector<State, Category[]>(state => state.categories)
  const stateCountries = useSelector<State, Country[]>(state => state.countries)
  const stateCustomer = useSelector<State, Customer | undefined>(state => state.customer)
  const category = useMemo(() => stateCategories.find(category => category.id === params.id), [stateCategories, params.id])
  const [sortBy, setSortBy] = useState('v')
  const [actionOpened, setActionOpened] = useState(false)
  const packs = useMemo(() => {
    const packs = statePacks.filter(p => params.type === 'a' || (params.type === 'c' && p.product.categoryId === params.id) || (params.type === 'f' && stateCustomer?.favorites?.includes(p.product.id!)))
    switch(sortBy) {
      case 'p':
        return packs.sort((p1, p2) => p1.price - p2.price)
      case 's':
        return packs.sort((p1, p2) => p2.product.sales - p1.product.sales)
      case 'r':
        return packs.sort((p1, p2) => p2.product.rating - p1.product.rating)
      case 'v':
        return packs.sort((p1, p2) => p1.weightedPrice - p2.weightedPrice)
    }
  }, [statePacks, stateCustomer, params.id, params.type, sortBy])
  let i = 0
  return(
    <IonPage>
      <Header title={category?.name || (params.type === 'f' ? labels.favorites : labels.allProducts)} />
      <IonContent fullscreen>
        <IonList className="ion-padding">
          {(packs?.length || 0) > 0 &&
            <IonItem>
              <IonLabel position="floating" color="primary">{labels.sortBy}</IonLabel>
              <IonSelect 
                ok-text={labels.ok} 
                cancel-text={labels.cancel} 
                value={sortBy}
                onIonChange={e => setSortBy(e.detail.value)}
              >
                {sortByList.map(s => <IonSelectOption key={s.id} value={s.id}>{s.name}</IonSelectOption>)}
              </IonSelect>
            </IonItem>
          }
          {packs?.length === 0 ?
            <IonItem> 
              <IonLabel>{labels.noData}</IonLabel>
            </IonItem>
          : packs?.map(p => 
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
                <IonLabel slot="end" className="price">{p.isOffer ? '' : (p.price / 100).toFixed(2)}</IonLabel>
                {p.isOffer && <IonBadge slot="end" color="success">{(p.price / 100).toFixed(2)}</IonBadge>}
              </IonItem>
            )
          }
        </IonList>
      </IonContent>
      <IonActionSheet
        isOpen={actionOpened}
        onDidDismiss={() => setActionOpened(false)}
        buttons={
          sortByList.map(o => 
            o.id === sortBy ? ''
            : {
              text: o.name,
              cssClass: colors[i++ % 10].name,
              handler: () => setSortBy(o.id)
            }
          )
        }
      />
      <Footer />
    </IonPage>
  )
}

export default Packs