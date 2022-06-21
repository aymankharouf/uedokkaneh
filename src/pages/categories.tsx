import { useState, useEffect } from 'react'
import labels from '../data/labels'
import { colors } from '../data/config'
import { Category, State } from '../data/types'
import {IonButton, IonContent, IonLoading, IonPage} from '@ionic/react'
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
  const [categories, setCategories] = useState<Category[]>([])
  const [currentCategory] = useState(() => stateCategories.find(c => c.id === params.id))
  useEffect(() => {
    setCategories(() => {
      const categories = stateCategories.filter(c => c.parentId === params.id)
      return categories.sort((c1, c2) => c1.ordering - c2.ordering)
    })
  }, [stateCategories, params.id])

  let i = 0
  return(
    <IonPage>
      <IonLoading isOpen={stateCategories.length === 0} />
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
