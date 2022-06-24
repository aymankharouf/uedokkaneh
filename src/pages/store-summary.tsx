import { useMemo } from 'react'
import labels from '../data/labels'
import { colors, storeSummary } from '../data/config'
import {IonButton, IonContent, IonPage} from '@ionic/react'
import Header from './header'
import Footer from './footer'
import { useSelector } from 'react-redux'
import { CustomerInfo, Pack, PackPrice, State } from '../data/types'

const StoreSummary = () => {
  const statePackPrices = useSelector<State, PackPrice[]>(state => state.packPrices)
  const statePacks = useSelector<State, Pack[]>(state => state.packs)
  const stateCustomerInfo = useSelector<State, CustomerInfo | undefined>(state => state.customerInfo)
  const sections = useMemo(() => {
    const storePacks = statePackPrices.filter(p => p.storeId === stateCustomerInfo?.storeId)
                                      .map(p => {
                                        const packInfo = statePacks.find(pa => pa.id === p.packId)
                                        return {
                                          ...p,
                                          packInfo
                                        }
                                      })
      return storeSummary.map(s => {
        const packs = storePacks.filter(p => (s.id === 'a') 
                                          || (s.id === 'o' && p.price > (p.packInfo?.price ?? 0)) 
                                          || (s.id === 'n' && p.price === (p.packInfo?.price ?? 0) && p.storeId !== p.packInfo?.minStoreId)
                                          || (s.id === 'l' && p.price === (p.packInfo?.price ?? 0) && p.storeId === p.packInfo?.minStoreId))
        return {
          ...s,
          count: packs.length
        }
      })
  }, [statePackPrices, statePacks, stateCustomerInfo])
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
