import { useState, useContext, useEffect } from 'react'
import { StateContext } from '../data/state-provider'
import { addAlarm, getMessage } from '../data/actions'
import labels from '../data/labels'
import { alarmTypes } from '../data/config'
import { IonContent, IonFab, IonFabButton, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonToggle, useIonToast } from '@ionic/react'
import Header from './header'
import { checkmarkOutline } from 'ionicons/icons'
import { useHistory, useLocation } from 'react-router'

type Props = {
  alarmType: string,
  packId: string
}
const AddAlarm = (props: Props) => {
  const { state } = useContext(StateContext)
  const [pack] = useState(() => state.packs.find(p => p.id === props.packId))
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [priceInvalid, setPriceInvalid] = useState(false)
  const [alternative, setAlternative] = useState('')
  const [alternativeErrorMessage, setAlternativeErrorMessage] = useState('')
  const [offerDays, setOfferDays] = useState('')
  const [isOffer, setIsOffer] = useState(false)
  const [buttonVisible, setButtonVisisble] = useState(false)
  const [currentPrice, setCurrentPrice] = useState<number|undefined>(undefined)
  const history = useHistory()
  const location = useLocation()
  const [message] = useIonToast()
  useEffect(() => {
    setCurrentPrice(() => {
      if (props.alarmType === 'cp') {
        return state.packPrices.find(p => p.storeId === state.customerInfo?.storeId && p.packId === pack?.id)?.price
      } else {
        return pack?.price
      }
    })
  }, [state.packPrices, props.alarmType, state.customerInfo, pack])
  useEffect(() => {
    const validatePrice = (value: string) => {
      if (Number(value) > 0 && Number(value) * 100 !== Number(currentPrice)) {
        setPriceInvalid(false)
      } else {
        setPriceInvalid(true)
      }  
    }
    if (price) validatePrice(price)
  }, [price, pack, props.alarmType, currentPrice])
  useEffect(() => {
    const patterns = {
      name: /^.{4,50}$/,
    }
    const validateAlternative = (value: string) => {
      if (patterns.name.test(value)){
        setAlternativeErrorMessage('')
      } else {
        setAlternativeErrorMessage(labels.invalidName)
      }
    }  
    if (alternative) validateAlternative(alternative)
  }, [alternative])

  useEffect(() => {
    if (!price
    || (isOffer && !offerDays)
    || (props.alarmType === 'aa' && !alternative)
    || (props.alarmType === 'go' && !quantity) 
    || priceInvalid
    || alternativeErrorMessage) setButtonVisisble(false)
    else setButtonVisisble(true)
  }, [props.alarmType, price, isOffer, offerDays, alternative, quantity, state.customerInfo, priceInvalid, alternativeErrorMessage])
  const handleSubmit = () => {
    try{
      if (state.customerInfo?.isBlocked) {
        throw new Error('blockedUser')
      }
      if (offerDays && Number(offerDays) <= 0) {
        throw new Error('invalidPeriod')
      }
      if ((props.alarmType === 'go' && Number(quantity) < 2) || (quantity && props.alarmType === 'eo' && Number(quantity) < 1)){
        throw new Error('invalidQuantity')
      }
      const alarm = {
        packId: pack?.id,
        type: props.alarmType,
        price: Number(price) * 100,
        quantity: Number(quantity),
        alternative,
        offerDays: Number(offerDays),
        status: 'n'
      }
      addAlarm(alarm)
      message(labels.sendSuccess, 3000)
      history.replace('/')
    } catch (err) {
      message(getMessage(location.pathname, err), 3000)
    }
  }

  return (
    <IonPage>
      <Header title={alarmTypes.find(t => t.id === props.alarmType)?.name} />
      <IonContent fullscreen className="ion-padding">
        <IonList>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.productName}
            </IonLabel>
            <IonInput 
              value={pack?.productName} 
              type="text" 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.packName}
            </IonLabel>
            <IonInput 
              value={pack?.name} 
              type="text" 
              readonly
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating" color="primary">
              {labels.currentPrice}
            </IonLabel>
            <IonInput 
              value={((currentPrice || 0) / 100).toFixed(2)} 
              type="number" 
              readonly
            />
          </IonItem>
          {props.alarmType === 'aa' &&
            <IonItem>
              <IonLabel position="floating" color="primary">
                {labels.alternative}
              </IonLabel>
              <IonInput 
                value={alternative} 
                type="text" 
                clearInput
                onIonChange={e => setAlternative(e.detail.value!)} 
              />
            </IonItem>
          }
          <IonItem>
            <IonLabel position="floating" color={priceInvalid ? 'danger' : 'primary'}>
              {labels.price}
            </IonLabel>
            <IonInput 
              value={price} 
              type="number" 
              clearInput
              onIonChange={e => setPrice(e.detail.value!)} 
              color={priceInvalid ? 'danger' : ''}
            />
          </IonItem>
          {['eo', 'go'].includes(props.alarmType) &&
            <IonItem>
              <IonLabel position="floating" color="primary">
                {labels.quantity}
              </IonLabel>
              <IonInput 
                value={quantity} 
                type="number" 
                clearInput
                onIonChange={e => setQuantity(e.detail.value!)} 
              />
            </IonItem>
          }
          <IonItem>
            <IonLabel color="primary">{labels.isOffer}</IonLabel>
            <IonToggle checked={isOffer} onIonChange={() => setIsOffer(s => !s)}/>
          </IonItem>
          {isOffer &&
            <IonItem>
              <IonLabel position="floating" color="primary">
                {labels.offerDays}
              </IonLabel>
              <IonInput 
                value={offerDays} 
                type="number" 
                clearInput
                onIonChange={e => setOfferDays(e.detail.value!)} 
              />
            </IonItem>
          }
        </IonList>
      </IonContent>
      {buttonVisible &&
        <IonFab vertical="top" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleSubmit} color="success">
            <IonIcon ios={checkmarkOutline} />
          </IonFabButton>
        </IonFab>
      }
    </IonPage>
  )
}
export default AddAlarm
