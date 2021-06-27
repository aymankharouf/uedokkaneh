import { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, Link, Badge } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import { confirmOrder, showMessage, showError, getMessage, quantityText, getBasket } from '../data/actions'
import labels from '../data/labels'
import { setup } from '../data/config'
import { BasketPack, Discount, BigBasketPack } from '../data/types'

const ConfirmOrder = () => {
  const { state, dispatch } = useContext(StateContext)
  const [error, setError] = useState('')
  const [basket, setBasket] = useState<BigBasketPack[]>([])
  const [total, setTotal] = useState(0)
  const [fixedFees, setFixedFees] = useState(0)
  const [fraction, setFraction] = useState(0)
  const [discount, setDiscount] = useState<Discount>()
  const [weightedPacks, setWeightedPacks] = useState<BasketPack[]>([])
  const [locationFees] = useState(() => state.locations.find(l => l.id === state.userInfo?.locationId)?.fees ?? 0)
  const [deliveryFees] = useState(state.customerInfo?.deliveryFees ?? locationFees)
  useEffect(() => {
    setBasket(getBasket(state.basket, state.packs))
  }, [state.basket, state.packs])

  useEffect(() => {
    setTotal(() => basket.reduce((sum, p) => sum + Math.round(p.price * p.quantity), 0))
    setWeightedPacks(() => basket.filter(p => p.byWeight))
  }, [basket])
  useEffect(() => {
    setFixedFees(() => Math.round(setup.fixedFees * total))
  }, [total])
  useEffect(() => {
    setFraction((total + fixedFees) - Math.floor((total + fixedFees) / 5) * 5)
  }, [total, fixedFees])
  useEffect(() => {
    setDiscount(() => {
      const orders = state.orders.filter(o => o.status !== 'c')
      let discount = {
        value: 0,
        type: 'n'
      }
      if (orders.length === 0) {
        discount.value = setup.firstOrderDiscount
        discount.type = 'f'
      } else if ((state.customerInfo?.discounts || 0) > 0) {
        discount.value = Math.min(state.customerInfo?.discounts || 0, setup.maxDiscount)
        discount.type = 'o'
      } else if ((state.customerInfo?.specialDiscount || 0) > 0) {
        discount.value = state.customerInfo?.specialDiscount || 0
        discount.type = 's'
      }
      return discount
    }) 
  }, [state.orders, state.customerInfo])

  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleConfirm = () => {
    try{
      if (state.adverts[0]?.type === 'n') {
        showMessage(state.adverts[0].text)
        return
      }
      if (state.customerInfo?.isBlocked) {
        throw new Error('blockedUser')
      }
      const orderLimit = state.customerInfo?.orderLimit || setup.orderLimit
      const activeOrders = state.orders.filter(o => ['n', 'a', 'e', 'f', 'p'].includes(o.status))
      const totalOrders = activeOrders.reduce((sum, o) => sum + o.total, 0)
      if (totalOrders + total > orderLimit) {
        throw new Error('limitOverFlow')
      }
      const packs = basket.filter(p => p.price > 0)
      const newPacks = packs.map(p => {
        return {
          packId: p.packId,
          productId: p.productId,
          productName: p.productName,
          productAlias: p.productAlias,
          packName: p.packName,
          imageUrl: p.imageUrl,
          price: p.price,
          quantity: p.quantity,
          closeExpired: p.closeExpired,
          byWeight: p.byWeight,
          gross: Math.round(p.price * p.quantity),
          offerId: p.offerId || '',
          purchased: 0,
          status: 'n'
        }
      })
      const order = {
        status: 'n',
        basket: newPacks,
        fixedFees,
        deliveryFees,
        discount,
        total,
        fraction
      }
      console.log('order = ', order)
      confirmOrder(order)
      showMessage(labels.sendSuccess)
      f7.views.current.router.navigate('/home/', {reloadAll: true})
      dispatch({ type: 'CLEAR_BASKET'})
    } catch (err){
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }
  const handleDelete = () => {
    f7.views.current.router.navigate('/home/', {reloadAll: true})
    dispatch({type: 'CLEAR_BASKET'})  
  }
  if (!state.user) return <Page><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></Page>
  return (
    <Page>
      <Navbar title={labels.sendOrder} backLink={labels.back} />
      <Block>
        <p className="note">{labels.orderHelp} <a href="/help/o">{labels.clickHere}</a></p>
        {locationFees === 0 ? <p className="note">{labels.noDelivery}</p> : ''}
        <List mediaList>
          {basket.map(p => 
            <ListItem
              key={p.packId}
              title={p.productName}
              subtitle={p.productAlias}
              text={p.packName}
              footer={`${labels.quantity}: ${quantityText(p.quantity)}`}
              after={p.totalPriceText}
            >
              <div className="list-subtext1">{p.priceText}</div>
              {p.closeExpired ? <Badge slot="text" color="red">{labels.closeExpired}</Badge> : ''}
            </ListItem>
          )}
          <ListItem 
            title={labels.total} 
            className="total" 
            after={(total / 100).toFixed(2)} 
          />
          <ListItem 
            title={labels.fixedFees} 
            className="fees" 
            after={((fixedFees + deliveryFees) / 100).toFixed(2)} 
          />
          <ListItem 
            title={labels.discount}
            className="discount" 
            after={(((discount?.value ?? 0) + fraction) / 100).toFixed(2)} 
          /> 
          <ListItem 
            title={labels.net} 
            className="net" 
            after={((total + fixedFees + deliveryFees - (discount?.value ?? 0) - fraction) / 100).toFixed(2)} 
          />
          </List>
        <p className="note">{weightedPacks.length > 0 ? labels.weightedPricesNote : ''}</p>
      </Block>
      <Fab position="center-bottom" slot="fixed" text={labels.send} color="green" onClick={() => handleConfirm()}>
        <Icon material="done"></Icon>
      </Fab>
      <Toolbar bottom>
        <Link href='/home/' iconMaterial="home" />
        <Link href='#' iconMaterial="delete" onClick={() => handleDelete()} />
      </Toolbar>
    </Page>
  )
}
export default ConfirmOrder
