import { useContext, useEffect, useState, useRef } from 'react'
import { f7, Page, Navbar, Card, CardContent, CardHeader, CardFooter, Fab, Toolbar, Icon, Actions, ActionsButton } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import RatingStars from './rating-stars'
import { StoreContext } from '../data/store'
import { addAlarm, showMessage, showError, getMessage, updateFavorites, productOfText, notifyFriends } from '../data/actions'
import labels from '../data/labels'
import { setup, alarmTypes } from '../data/config'
import { iPack } from '../data/interfaces'

interface iProps {
  id: string,
  type: string
}
const PackDetails = (props: iProps) => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [pack] = useState(() => state.packs.find(p => p.id === props.id))
  const [isAvailable, setIsAvailable] = useState(-1)
  const [subPackInfo, setSubPackInfo] = useState('')
  const [bonusPackInfo, setBonusPackInfo] = useState('')
  const [otherProducts, setOtherProducts] = useState<iPack[]>([])
  const [otherOffers, setOtherOffers] = useState<iPack[]>([])
  const [otherPacks, setOtherPacks] = useState<iPack[]>([])
  const offerActions = useRef<Actions>(null)
  const packActions = useRef<Actions>(null)
  useEffect(() => {
    setIsAvailable(() => state.packPrices.find(p => p.storeId === state.customerInfo?.storeId && p.packId === pack?.id) ? 1 : -1)
  }, [state.packPrices, state.customerInfo, pack])
  useEffect(() => {
    setSubPackInfo(() => {
      if (pack?.subPackId) {
        const price = Math.round(pack.price / (pack?.subQuantity ?? 0) * (pack?.subPercent ?? 0) * (1 + setup.profit))
        return `${pack.productName} ${pack?.subPackName}(${(price / 100).toFixed(2)})`
      } else {
        return ''
      }  
    })
    setBonusPackInfo(() => {
      if (pack?.bonusPackId) {
        const price = Math.round(pack.price / (pack.bonusQuantity ?? 0) * (pack.bonusPercent ?? 0) * (1 + setup.profit))
        return `${pack?.bonusProductName} ${pack.bonusPackName}(${(price / 100).toFixed(2)})`
      } else {
        return ''
      }  
    })
    setOtherProducts(() => state.packs.filter(pa => pa.categoryId === pack?.categoryId && (pa.sales > pack.sales || pa.rating > pack.rating)))
    setOtherOffers(() => state.packs.filter(pa => pa.productId === pack?.productId && pa.id !== pack.id && (pa.isOffer || pa.offerEnd)))
    setOtherPacks(() => state.packs.filter(pa => pa.productId === pack?.productId && pa.weightedPrice < pack.weightedPrice))
  }, [pack, state.packs])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const addToBasket = (packId?: string) => {
    try{
      if (state.customerInfo?.isBlocked) {
        throw new Error('blockedUser')
      }
      if (state.basket.find(p => p.packId === packId)) {
        throw new Error('alreadyInBasket')
      }
      let foundPack = state.packs.find(p => p.id === props.id)
      let price = pack?.price ?? 0
      let maxQuantity
      if (packId !== pack?.id) {
        foundPack = state.packs.find(p => p.id === packId)
        if (packId === pack?.subPackId) {
          price = Math.round((pack?.price ?? 0) / (pack?.subQuantity ?? 0) * (pack?.subPercent ?? 0) * (1 + setup.profit))
          maxQuantity = (pack?.subQuantity ?? 0) - 1
          if (pack?.bonusPackId) maxQuantity++
        } else  {
          price = Math.round((pack?.price ?? 0) / (pack?.bonusQuantity ?? 0) * (pack?.bonusPercent ?? 0) * (1 + setup.profit))
          maxQuantity = pack?.bonusQuantity ?? 0
        }
      }
      const purchasedPack = {
        ...foundPack,
        price,
        maxQuantity,
        offerId: pack?.id
      }
      const orderLimit = state.customerInfo?.orderLimit ?? setup.orderLimit
      const activeOrders = state.orders.filter(o => ['n', 'a', 'e', 'f', 'p'].includes(o.status))
      const activeOrdersTotal = activeOrders.reduce((sum, o) => sum + o.total, 0)
      if (activeOrdersTotal + purchasedPack.price > orderLimit) {
        throw new Error('limitOverFlow')
      }
      console.log('pack = ', purchasedPack)
      dispatch({type: 'ADD_TO_BASKET', payload: purchasedPack})
      showMessage(labels.addToBasketSuccess)
      f7.views.current.router.back()  
		} catch (err){
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }
  const handleAddAlarm = (alarmTypeId: string) => {
    try {
      if (alarmTypeId === 'ua') {
        f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
          try{
            if (state.customerInfo?.isBlocked) {
              throw new Error('blockedUser')
            }
            if (state.userInfo?.alarms?.find(a => a.packId === props.id && a.status === 'n')){
              throw new Error('duplicateAlarms')
            }
            const alarm = {
              packId: props.id,
              type: alarmTypeId,
              status: 'n'
            }
            addAlarm(alarm)
            showMessage(labels.sendSuccess)
            f7.views.current.router.back()
          } catch(err) {
            setError(getMessage(f7.views.current.router.currentRoute.path, err))
          }
        })  
      } else {
        if (state.customerInfo?.isBlocked) {
          throw new Error('blockedUser')
        }
        if (state.userInfo?.alarms?.find(a => a.packId === props.id && a.status === 'n')){
          throw new Error('duplicateAlarms')
        }
        f7.views.current.router.navigate(`/add-alarm/${props.id}/type/${alarmTypeId}`)
      }  
    } catch(err) {
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }
  const handleFavorite = () => {
    try{
      if (state.userInfo && pack) {
        updateFavorites(state.userInfo, pack.productId)
        showMessage(state.userInfo?.favorites?.includes(pack?.productId) ? labels.removeFavoriteSuccess : labels.addFavoriteSuccess)  
      }
		} catch (err){
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }
  const handleNotifyFriends = () => {
    try{
      if (state.customerInfo?.isBlocked) {
        throw new Error('blockedUser')
      }
      if (pack) {
        notifyFriends(pack.id)
        showMessage(labels.sendSuccess)  
      }
    } catch(err) {
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }
  return (
    <Page>
      <Navbar title={`${pack?.productName}${pack?.productAlias ? '-' + pack?.productAlias : ''}`} backLink={labels.back} />
      <Card>
        <CardHeader className="card-header">
          <div className="price">
            {((pack?.price ?? 0) / 100).toFixed(2)}
          </div>
        </CardHeader>
        <CardContent>
          <p className="card-title">{`${pack?.name} ${pack?.closeExpired ? '(' + labels.closeExpired + ')' : ''}`}</p>
          <img src={pack?.imageUrl} className="img-card" alt={labels.noImage} />
          <p className="card-title">{pack?.productDescription}</p>
        </CardContent>
        <CardFooter>
          <p>{productOfText(pack?.trademark ?? '', pack?.country ?? '')}</p>
          <p><RatingStars rating={pack?.rating ?? 0} count={pack?.ratingCount ?? 0} /></p>
        </CardFooter>
      </Card>
      {props.type === 'c' ? 
        <Fab 
          position="center-bottom" 
          slot="fixed" 
          text={`${labels.addToBasket}${pack?.isOffer ? '*' : ''}`} 
          color="green" 
          onClick={() => pack?.isOffer ? offerActions.current?.open() : addToBasket(pack?.id)}
        >
          <Icon material="add"></Icon>
        </Fab>
      : ''}
      {state.user ?
        <Fab position="left-top" slot="fixed" color="red" className="top-fab" onClick={() => packActions.current?.open()}>
          <Icon material="menu"></Icon>
        </Fab>
      : ''}
      {props.type === 'c' && pack?.isOffer ? <p className="note">{labels.offerHint}</p> : ''}
      <Actions ref={packActions}>
        {props.type === 'c' ? 
          <>
            <ActionsButton onClick={() => handleFavorite()}>{pack?.productId && state.userInfo?.favorites?.includes(pack.productId) ? labels.removeFromFavorites : labels.addToFavorites}</ActionsButton>
            {pack?.isOffer && state.userInfo?.friends?.find(f => f.status === 'r') ? 
              <ActionsButton onClick={() => handleNotifyFriends()}>{labels.notifyFriends}</ActionsButton>
            : ''}
            {otherProducts.length === 0 ? '' :
              <ActionsButton onClick={() => f7.views.current.router.navigate(`/hints/${pack?.id}/type/p`)}>{labels.otherProducts}</ActionsButton>
            }
            {otherOffers.length === 0 ? '' :
              <ActionsButton onClick={() => f7.views.current.router.navigate(`/hints/${pack?.id}/type/o`)}>{labels.otherOffers}</ActionsButton>
            }
            {otherPacks.length === 0 ? '' :
              <ActionsButton onClick={() => f7.views.current.router.navigate(`/hints/${pack?.id}/type/w`)}>{labels.otherPacks}</ActionsButton>
            }
          </>
        : ''}
        {props.type === 'o' && alarmTypes.map(p =>
          p.isAvailable === 0 || p.isAvailable === isAvailable ?
            <ActionsButton key={p.id} onClick={() => handleAddAlarm(p.id)}>
              {p.name}
            </ActionsButton>
          : ''
        )}
      </Actions>
      <Actions ref={offerActions}>
        <ActionsButton onClick={() => addToBasket(pack?.id)}>{labels.allOffer}</ActionsButton>
        <ActionsButton onClick={() => addToBasket(pack?.subPackId)}>{subPackInfo}</ActionsButton>
        {pack?.bonusPackId ? <ActionsButton onClick={() => addToBasket(pack?.bonusPackId)}>{bonusPackInfo}</ActionsButton> : ''}
      </Actions>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default PackDetails
