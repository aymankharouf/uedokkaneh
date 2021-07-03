import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { colors, storeSummary } from '../data/config'
import {IonButton, IonContent, IonPage} from '@ionic/react'
import Header from './header'
import Footer from './footer'

type ExtendedSections = {
  id: string,
  name: string,
  count: number
}
const StoreSummary = () => {
  const { state } = useContext(StateContext)
  const [sections, setSections] = useState<ExtendedSections[]>([])
  useEffect(() => {
    setSections(() => {
      const storePacks = state.packPrices.filter(p => p.storeId === state.customerInfo?.storeId)
      const extendedStorePacks = storePacks.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId)
        return {
          ...p,
          packInfo
        }
      })
      const sections = storeSummary.map(s => {
        const packs = extendedStorePacks.filter(p => (s.id === 'a') 
                                          || (s.id === 'o' && p.price > (p.packInfo?.price ?? 0)) 
                                          || (s.id === 'n' && p.price === (p.packInfo?.price ?? 0) && p.storeId !== p.packInfo?.minStoreId)
                                          || (s.id === 'l' && p.price === (p.packInfo?.price ?? 0) && p.storeId === p.packInfo?.minStoreId))
        return {
          ...s,
          count: packs.length
        }
      })
      return sections
    })
  }, [state.packPrices, state.packs, state.customerInfo])
  let i = 0
  return(
    <IonPage>
      <Header title={labels.myPacks} />
      <IonContent fullscreen>
        {sections.map(s => 
          <IonButton
            routerLink={`/store-packs/${s.id}`} 
            expand="block"
            shape="round"
            className={colors[i++ % 10].name}
            style={{margin: '0.9rem'}} 
            key={s.id}
          >
            {`${s.name} (${s.count})`}
          </IonButton>
        )}
      </IonContent>
      <Footer />
    </IonPage>
  )
}

export default StoreSummary
