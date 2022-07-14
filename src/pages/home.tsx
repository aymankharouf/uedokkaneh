import { useMemo } from 'react'
import labels from '../data/labels'
import { Advert, Notification, State } from '../data/types'
import { Category } from '../data/types'
import { IonBadge, IonButton, IonButtons, IonContent, IonHeader, IonLoading, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import {colors} from '../data/config'
import Footer from './footer'
import { useSelector } from 'react-redux'

const Home = () => {
  const stateAdverts = useSelector<State, Advert[]>(state => state.adverts)
  const stateNotifications = useSelector<State, Notification[]>(state => state.notifications)
  const stateCategories = useSelector<State, Category[]>(state => state.categories)
  const categories = useMemo(() => stateCategories.filter(c => !c.parentId).sort((c1, c2) => c1.ordering - c2.ordering), [stateCategories])
  const advert = useMemo(() => stateAdverts.find(a => a.isActive), [stateAdverts])
  const notifications = useMemo(() => stateNotifications.filter(n => n.status === 'n').length, [stateNotifications])
  let i = 0
  return (
    <IonPage>
      <IonLoading isOpen={stateCategories.length === 0} />
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
            {notifications > 0 && 
              <IonBadge className="badge" style={{left: '20px'}}>
                {notifications}
              </IonBadge>
            }
          </IonButtons>
          <IonTitle><img src="/dokaneh_logo.png" alt="logo" style={{width: '120px', marginBottom: '-5px'}} /></IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large"><img src="/dokaneh_logo.png" alt="logo" style={{width: '120px', marginBottom: '-15px'}} /></IonTitle>
          </IonToolbar>
        </IonHeader>
        {advert && 
          <IonButton 
            routerLink="/advert" 
            expand="block" 
            shape="round" 
            fill="outline"
            className="advert"
          >
            {advert.title}
          </IonButton>
        }
        <IonButton 
          routerLink="/packs/a/0"
          expand="block"
          shape="round"
          className={colors[i++ % 10].name}
          style={{margin: '0.9rem'}}
        >
          {labels.allProducts}
        </IonButton>
        {categories.map(c => 
          <IonButton
            routerLink={`/categories/${c.id}`} 
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

export default Home
