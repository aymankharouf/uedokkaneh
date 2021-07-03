import { useContext, useState, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { colors } from '../data/config'
import { Category } from '../data/types'
import {IonButton, IonContent, IonLoading, IonPage} from '@ionic/react'
import { useParams } from 'react-router'
import Header from './header'
import Footer from './footer'

type Params = {
  id: string
} 
const Categories = () => {
  const { state } = useContext(StateContext)
  const params = useParams<Params>()
  const [categories, setCategories] = useState<Category[]>([])
  const [currentCategory] = useState(() => state.categories.find(c => c.id === params.id))
  useEffect(() => {
    setCategories(() => {
      const categories = state.categories.filter(c => c.parentId === params.id)
      return categories.sort((c1, c2) => c1.ordering - c2.ordering)
    })
  }, [state.categories, params.id])

  let i = 0
  return(
    <IonPage>
      <IonLoading isOpen={state.categories.length === 0} />
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
            routerLink={c.isLeaf ? `/packs/c/${c.id}` : `/categories/${c.id}`} 
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
