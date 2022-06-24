

import { useMemo } from 'react'
import labels from '../data/labels'
import { colors } from '../data/config'
import { Category, State } from '../data/types'
import {IonButton, IonContent, IonPage} from '@ionic/react'
import { useParams } from 'react-router'
import Header from './header'
import Footer from './footer'
import { useSelector } from 'react-redux'

type Params = {
  id: string
} 
const Categories = () => {
  const params = useParams<Params>()
  const stateCategories = useSelector<State, Category[]>(state => state.categories)
  const categories = useMemo(() => stateCategories.filter(c => c.parentId === params.id).sort((c1, c2) => c1.ordering - c2.ordering), [stateCategories, params.id])
  const currentCategory = useMemo(() => stateCategories.find(c => c.id === params.id), [stateCategories, params.id])
  let i = 0
  return(
    <IonPage>
      <Header title={currentCategory?.name} />
      <IonContent fullscreen>
        <IonButton 
          routerLink={`/packs/a/${params.id}/0`} 
          expand="block"
          shape="round"
          className={colors[i++ % 10].name}
          style={{margin: '0.9rem'}}
        >
          {labels.allProducts}
        </IonButton>
        {categories.map(c => 
          <IonButton
            routerLink={`/packs/c/${c.id}`} 
            expand="block"
            shape="round"
            className={colors[i++ % 10].name}
            style={{margin: '0.9rem'}} 
            key={c.id}
          >
            {c.name}
          </IonButton>
        )}
      </IonContent>
      <Footer />
    </IonPage>
  )
}


export default Categories