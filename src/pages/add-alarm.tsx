import { useState, useContext, useEffect } from 'react'
import { f7, Page, Navbar, List, ListInput, Fab, Icon, Toggle, ListItem } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import { addAlarm, showMessage, showError, getMessage } from '../data/actions'
import labels from '../data/labels'
import { alarmTypes } from '../data/config'

type Props = {
  alarmType: string,
  packId: string
}
const AddAlarm = (props: Props) => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [pack] = useState(() => state.packs.find(p => p.id === props.packId))
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [priceErrorMessage, setPriceErrorMessage] = useState('')
  const [alternative, setAlternative] = useState('')
  const [alternativeErrorMessage, setAlternativeErrorMessage] = useState('')
  const [offerDays, setOfferDays] = useState('')
  const [isOffer, setIsOffer] = useState(false)
  const [buttonVisible, setButtonVisisble] = useState(false)
  const [currentPrice, setCurrentPrice] = useState<number|undefined>(undefined)
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
        setPriceErrorMessage('')
      } else {
        setPriceErrorMessage(labels.invalidPrice)
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
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    if (!price
    || (isOffer && !offerDays)
    || (props.alarmType === 'aa' && !alternative)
    || (props.alarmType === 'go' && !quantity) 
    || priceErrorMessage
    || alternativeErrorMessage) setButtonVisisble(false)
    else setButtonVisisble(true)
  }, [props.alarmType, price, isOffer, offerDays, alternative, quantity, state.customerInfo, priceErrorMessage, alternativeErrorMessage])
  const formatPrice = (value: string) => {
    return Number(value).toFixed(2)
  } 
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
      showMessage(labels.sendSuccess)
      f7.views.current.router.back()
    } catch (err) {
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }

  if (!state.user) return <Page><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></Page>
  return (
    <Page>
      <Navbar title={alarmTypes.find(t => t.id === props.alarmType)?.name} backLink={labels.back} />
      <List form>
        <ListInput 
          name="productName" 
          label={labels.productName}
          value={pack?.productName}
          type="text" 
          readonly
        />
        <ListInput 
          name="packName" 
          label={labels.packName}
          value={pack?.name}
          type="text" 
          readonly
        />
        <ListInput 
          name="currentPrice" 
          label={labels.currentPrice}
          value={((currentPrice || 0) / 100).toFixed(2)}
          type="number" 
          readonly
        />
        {props.alarmType === 'aa' ?
          <ListInput 
            name="alternative" 
            label={labels.alternative}
            placeholder={labels.namePlaceholder}
            clearButton 
            type="text" 
            value={alternative} 
            errorMessage={alternativeErrorMessage}
            errorMessageForce  
            onChange={e => setAlternative(e.target.value)}
            onInputClear={() => setAlternative('')}
          />
        : ''}
        <ListInput 
          name="price" 
          label={labels.price}
          placeholder={labels.pricePlaceholder}
          clearButton 
          type="number" 
          value={price} 
          errorMessage={priceErrorMessage}
          errorMessageForce  
          onChange={e => setPrice(e.target.value)}
          onInputClear={() => setPrice('')}
          onBlur={e => setPrice(formatPrice(e.target.value))}
        />
        {['eo', 'go'].includes(props.alarmType) ? 
          <ListInput 
            name="quantity" 
            label={labels.quantity}
            placeholder={labels.quantityPlaceholder}
            clearButton 
            type="number" 
            value={quantity} 
            onChange={e => setQuantity(e.target.value)}
            onInputClear={() => setQuantity('')}
          />
        : ''}
        <ListItem>
          <span>{labels.isOffer}</span>
          <Toggle 
            name="isOffer" 
            color="green" 
            checked={isOffer} 
            onToggleChange={() => setIsOffer(!isOffer)}
          />
        </ListItem>
        {isOffer ? 
          <ListInput 
            name="offerDays" 
            label={labels.offerDays}
            value={offerDays}
            clearButton 
            floatingLabel 
            type="number" 
            onChange={e => setOfferDays(e.target.value)}
            onInputClear={() => setOfferDays('')}
          />
        : ''}
      </List>
      {buttonVisible ?
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      : ''}
    </Page>
  )
}
export default AddAlarm
