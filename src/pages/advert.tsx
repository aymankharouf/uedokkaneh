import { useContext, useState } from 'react'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { IonCard, IonCol, IonContent, IonGrid, IonImg, IonPage, IonRow } from '@ionic/react'
import Header from './header'

const Advert = () => {
  const { state } = useContext(StateContext)
  const [advert] = useState(state.adverts[0])
  return (
    <IonPage>
      <Header title={labels.advert} />
      <IonContent fullscreen>
        <IonCard>
          <IonGrid>
            <IonRow>
              <IonCol className="card-title">{advert.title}</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                {advert.imageUrl && <IonImg src={advert.imageUrl} alt={advert.title} />}
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol className="ion-text-center">{advert.text}</IonCol>
            </IonRow>
          </IonGrid>
        </IonCard>
      </IonContent>
    </IonPage>
  )
}

export default Advert
