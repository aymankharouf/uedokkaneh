import { IonBackButton, IonButton, IonButtons, IonHeader, IonIcon, IonSearchbar, IonTitle, IonToolbar } from '@ionic/react'
import { useState } from 'react'
import { useHistory } from 'react-router'
import labels from '../data/labels'
import { useSelector, useDispatch } from 'react-redux'
import { State } from '../data/types'
import { searchOutline } from 'ionicons/icons'

type Props = {
  title?: string,
  withSearch?: boolean
}
const Header = (props: Props) => {
  const dispatch = useDispatch()
  const stateSearchText = useSelector<State, string>(state => state.searchText)
  const [visible, setVisible] = useState(false)
  const history = useHistory()
  const handleVisible = () => {
    dispatch({type: 'SET_SEARCH', payload: ''})
    setVisible(true)
  }
  return (
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start" onClick={() => history.goBack()}>
          <IonBackButton text={labels.back} />
        </IonButtons>
        {props.withSearch && 
          <IonButtons slot="end" onClick={handleVisible}>
            <IonButton>
              <IonIcon 
                icon={searchOutline}
                size="small" 
                slot="icon-only"
              />
            </IonButton>
          </IonButtons>
        }
        <IonTitle>{props.title}</IonTitle>
      </IonToolbar>
      {visible && 
        <IonToolbar>
          <IonSearchbar
            placeholder={labels.search} 
            value={stateSearchText} 
            onIonChange={e => dispatch({type: 'SET_SEARCH', payload: e.detail.value})}
          />
        </IonToolbar>
      }
    </IonHeader>
  )
}

export default Header