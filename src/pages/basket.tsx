import { useContext, useEffect, useState, useRef } from 'react'
import { f7, Block, Fab, Page, Navbar, List, ListItem, Toolbar, Link, Icon, Stepper, Actions, ActionsButton, Badge } from 'framework7-react'
import { StoreContext } from '../data/store'
import { showError, getMessage, quantityText, getBasket } from '../data/actions'
import labels from '../data/labels'
import { setup } from '../data/config'
import { iBigBasketPack } from '../data/interfaces'

const Basket = () => {
  const { state, dispatch } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [submitVisible, setSubmitVisible] = useState(true)
  const [currentPack, setCurrentPack] = useState<iBigBasketPack | undefined>(undefined)
  const [basket, setBasket] = useState<iBigBasketPack[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [weightedPacks, setWeightedPacks] = useState<iBigBasketPack[]>([])
  const [customerOrdersTotals] = useState(() => {
    const activeOrders = state.orders.filter(o => ['n', 'a', 'e', 'f', 'p'].includes(o.status))
    return activeOrders.reduce((sum, o) => sum + o.total, 0)
  })
  const hintsList = useRef<Actions>(null)
  useEffect(() => {
    if (state.basket.length === 0) f7.views.current.router.navigate('/home/', {reloadAll: true})
    else setBasket(getBasket(state.basket, state.packs))
  }, [state.basket, state.packs])
  useEffect(() => {
    setTotalPrice(() => basket.reduce((sum, p) => sum + Math.round(p.price * p.quantity), 0))
    setWeightedPacks(() => basket.filter(p => p.byWeight))
  }, [basket])
  useEffect(() => {
    const orderLimit = state.customerInfo?.orderLimit ?? setup.orderLimit
    if (customerOrdersTotals + totalPrice > orderLimit){
      setSubmitVisible(false)
    } else {
      setSubmitVisible(true)
    }
  }, [state.customerInfo, customerOrdersTotals, totalPrice])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])

  const handleConfirm = () => {
    try{
      if (state.customerInfo?.isBlocked) {
        throw new Error('blockedUser')
      }
      f7.views.current.router.navigate('/confirm-order/')
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  const handleIncrease = (pack: iBigBasketPack) => {
    try{
      dispatch({type: 'INCREASE_QUANTITY', payload: pack})
      const orderLimit = state.customerInfo?.orderLimit ?? setup.orderLimit
      if (customerOrdersTotals + totalPrice > orderLimit){
        throw new Error('limitOverFlow')
      }  
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  const handleHints = (pack: iBigBasketPack) => {
    setCurrentPack(pack)
    hintsList.current?.open()
  }
  return(
    <Page>
    <Navbar title={labels.basket} backLink={labels.back} />
    <Block>
      <List mediaList>
        {basket.map(p => 
          <ListItem
            title={p.productName}
            subtitle={p.productAlias}
            text={p.packName}
            footer={`${labels.totalPrice}:${p.totalPriceText}`}
            key={p.packId}
            className={(currentPack && currentPack.packId === p.packId) ? 'selected' : ''}
          >
            <img src={p.imageUrl} slot="media" className="img-list" alt={labels.noImage} />
            <div className="list-subtext1">{p.priceText}</div>
            <div className="list-subtext2">{`${labels.quantity}: ${quantityText(p.quantity)}`}</div>
            {p.closeExpired ? <Badge slot="text" color="red">{labels.closeExpired}</Badge> : ''}
            {p.price === 0 ? '' : 
              <Stepper 
                slot="after" 
                fill
                buttonsOnly
                onStepperPlusClick={() => handleIncrease(p)}
                onStepperMinusClick={() => dispatch({type: 'DECREASE_QUANTITY', payload: p})}
              />
            }
            {p.otherProducts + p.otherOffers + p.otherPacks === 0 ? '' : <Link className="hints" slot="footer" iconMaterial="warning" iconColor="red" onClick={()=> handleHints(p)}/>}
          </ListItem>
        )}
      </List>
      <p className="note">{weightedPacks.length > 0 ? labels.weightedPricesNote : ''}</p>
    </Block>
    {submitVisible ? 
      <Fab position="center-bottom" slot="fixed" text={`${labels.submit} ${(totalPrice / 100).toFixed(2)}`} color="green" onClick={() => handleConfirm()}>
        <Icon material="done"></Icon>
      </Fab>
    : <Fab position="center-bottom" slot="fixed" text={labels.limitOverFlowNote} color="red" href="/help/ol">
        <Icon material="report_problem"></Icon>
      </Fab>
    }
    <Actions ref={hintsList}>
      {currentPack?.otherProducts === 0 ? '' :
        <ActionsButton onClick={() => f7.views.current.router.navigate(`/hints/${currentPack?.packId}/type/p`)}>{labels.otherProducts}</ActionsButton>
      }
      {currentPack?.otherOffers === 0 ? '' :
        <ActionsButton onClick={() => f7.views.current.router.navigate(`/hints/${currentPack?.packId}/type/o`)}>{labels.otherOffers}</ActionsButton>
      }
      {currentPack?.otherPacks === 0 ? '' :
        <ActionsButton onClick={() => f7.views.current.router.navigate(`/hints/${currentPack?.packId}/type/w`)}>{labels.otherPacks}</ActionsButton>
      }
    </Actions>

    <Toolbar bottom>
      <Link href="/home/" iconMaterial="home" />
      <Link href="#" iconMaterial="delete" onClick={() => dispatch({type: 'CLEAR_BASKET'})} />
    </Toolbar>
  </Page>
  )
}
export default Basket
