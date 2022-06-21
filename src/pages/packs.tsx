import { useState, useEffect } from 'react'
import labels from '../data/labels'
import { sortByList, colors } from '../data/config'
import { getChildren, productOfText } from '../data/actions'
import { Category, Pack, State, UserInfo } from '../data/types'
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
  const stateUserInfo = useSelector<State, UserInfo | undefined>(state => state.userInfo)
  const [packs, setPacks] = useState<Pack[]>([])
  const [category] = useState(() => stateCategories.find(category => category.id === params.id))
  const [sortBy, setSortBy] = useState('v')
  const [actionOpened, setActionOpened] = useState(false)
  useEffect(() => {
    setPacks(() => {
      const children = params.type === 'a' ? getChildren(params.id, stateCategories) : [params.id]
      const packs = statePacks.filter(p => !params.id || (params.type === 'f' && stateUserInfo?.favorites?.includes(p.productId)) || children.includes(p.categoryId))
      return packs.sort((p1, p2) => p1.weightedPrice - p2.weightedPrice)
    })
  }, [statePacks, stateUserInfo, params.id, params.type, stateCategories])
  const handleSorting = (sortByValue: string) => {
    setSortBy(sortByValue)
    switch(sortByValue){
      case 'p':
        setPacks([...packs].sort((p1, p2) => p1.price - p2.price))
        break
      case 's':
        setPacks([...packs].sort((p1, p2) => p2.sales - p1.sales))
        break
      case 'r':
        setPacks([...packs].sort((p1, p2) => p2.rating - p1.rating))
        break
      case 'o':
        setPacks([...packs].sort((p1, p2) => (p2.isOffer || p2.offerEnd ? 1 : 0) - (p1.isOffer || p1.offerEnd ? 1 : 0)))
        break
      case 'v':
        setPacks([...packs].sort((p1, p2) => p1.weightedPrice - p2.weightedPrice))
        break
      default:
    }
  }
  let i = 0
  return(
    <IonPage>
      <Header title={category?.name || (params.type === 'f' ? labels.favorites : labels.allProducts)} />
      <IonContent fullscreen>
        <IonList className="ion-padding">
          {packs.length > 1 &&
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
      <IonActionSheet
        isOpen={actionOpened}
        onDidDismiss={() => setActionOpened(false)}
        buttons={
          sortByList.map(o => 
            o.id === sortBy ? ''
            : {
              text: o.name,
              cssClass: colors[i++ % 10].name,
              handler: () => handleSorting(o.id)
            }
          )
        }
      />
      <Footer />
    </IonPage>
  )
}

export default Packs