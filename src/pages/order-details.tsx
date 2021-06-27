import { useState, useEffect, useContext, useRef } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, Actions, ActionsButton, Badge } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StateContext } from '../data/state-provider'
import { cancelOrder, mergeOrders, addOrderRequest, showMessage, showError, getMessage, quantityDetails } from '../data/actions'
import labels from '../data/labels'
import { orderPackStatus } from '../data/config'
import { Order, OrderPack } from '../data/types'

type Props = {
  id: string
}
type ExtendedOrderPack = OrderPack & {
  priceNote: string,
  statusNote: string
}
const OrderDetails = (props: Props) => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(() => state.orders.find(o => o.id === props.id))
  const [orderBasket, setOrderBasket] = useState<ExtendedOrderPack[]>([])
  const [lastOrder, setLastOrder] = useState<Order | undefined>(undefined)
  const orderActions = useRef<Actions>(null)
  useEffect(() => {
    setOrder(() => state.orders.find(o => o.id === props.id))
  }, [state.orders, props.id])
  useEffect(() => {
    setOrderBasket(() => order ? order.basket.map(p => {
      const priceNote = p.actual && p.actual !== p.price ? `${labels.orderPrice}: ${(p.price / 100).toFixed(2)}, ${labels.currentPrice}: ${(p.actual / 100).toFixed(2)}` : `${labels.unitPrice}: ${(p.price / 100).toFixed(2)}`
      const statusNote = `${orderPackStatus.find(s => s.id === p.status)?.name} ${p.overPriced ? labels.overPricedNote : ''}`
      return {
        ...p,
        priceNote,
        statusNote
      }
    }) : [])
    setLastOrder(() => {
      const orders = state.orders.filter(o => o.id !== order?.id && !['c', 'm', 'r'].includes(o.status))
      orders.sort((o1, o2) => o2.time! > o1.time! ? -1 : 1)
      return ['n', 'a', 'e'].includes(orders[0]?.status) ? orders[0] : undefined
    })
  }, [order, state.orders])
 
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleEdit = () => {
    try{
      if (state.customerInfo?.isBlocked) {
        throw new Error('blockedUser')
      }
      if (order?.status !== 'n' && order?.requestType) {
        throw new Error('duplicateOrderRequest')
      }
      f7.views.current.router.navigate(`/edit-order/${order?.id}`)
    } catch(err) {
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }
  const handleDelete = () => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        if (state.customerInfo?.isBlocked) {
          throw new Error('blockedUser')
        }
        if (order) {
          if (order.status === 'n') {
            cancelOrder(order)
            showMessage(labels.deleteSuccess)
            f7.views.current.router.back()
          } else {
            if (order.requestType) {
              throw new Error('duplicateOrderRequest')
            }
            addOrderRequest(order, 'c')
            showMessage(labels.sendSuccess)
            f7.views.current.router.back()
          }  
        }
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })    
  }
  const handleMerge = () => {
    try{
      if (state.customerInfo?.isBlocked) {
        throw new Error('blockedUser')
      }
      if (lastOrder?.status !== 'n' && lastOrder?.requestType) {
        throw new Error('duplicateOrderRequest')
      }
      let found
      if (order && lastOrder) {
        for (let p of order.basket) {
          found = lastOrder.basket.find(bp => bp.packId === p.packId)
          if (found && found.price !== p.price) {
            throw new Error('samePackWithDiffPrice')
          }
          if (found?.weight && found.weight > 0 && state.packs.find(pa => pa.id === p.packId)?.isDivided) {
            throw new Error('samePackPurchasedByWeight')
          }
        }  
        if (lastOrder.status === 'n') {
          mergeOrders(lastOrder, order)
          showMessage(labels.mergeSuccess)
        } else {
          addOrderRequest(lastOrder, 'm', order)
          showMessage(labels.sendSuccess)  
        }
        f7.views.current.router.back()
      }
    } catch(err) {
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }
  return(
    <Page>
      <Navbar title={labels.orderDetails} backLink={labels.back} />
      {order && ['n', 'a', 'e'].includes(order.status) && 
        <Fab position="left-top" slot="fixed" color="green" className="top-fab" onClick={() => orderActions.current?.open()}>
          <Icon material="menu"></Icon>
        </Fab>
      }
      <Block>
        <List mediaList>
          {orderBasket.map(p => 
            <ListItem 
              title={p.productName}
              subtitle={p.productAlias}
              text={p.packName}
              footer={`${labels.status}: ${p.statusNote}`}
              after={(p.gross / 100).toFixed(2)}
              key={p.packId} 
            >
              <div className="list-subtext1">{p.priceNote}</div>
              <div className="list-subtext2">{quantityDetails(p)}</div>
              {p.closeExpired ? <Badge slot="text" color="red">{labels.closeExpired}</Badge> : ''}
            </ListItem>
          )}
          <ListItem 
            title={labels.total} 
            className="total"
            after={((order?.total ?? 0) / 100).toFixed(2)} 
          />
          <ListItem 
            title={labels.fixedFees} 
            className="fees" 
            after={(((order?.fixedFees ?? 0) + (order?.deliveryFees ?? 0)) / 100).toFixed(2)} 
          />
          <ListItem 
            title={labels.discount} 
            className="discount" 
            after={(((order?.discount?.value ?? 0) + (order?.fraction ?? 0)) / 100).toFixed(2)} 
          /> 
          <ListItem 
            title={labels.net} 
            className="net" 
            after={(((order?.total ?? 0) + (order?.fixedFees ?? 0) + (order?.deliveryFees ?? 0) - (order?.discount?.value ?? 0) - (order?.fraction ?? 0)) / 100).toFixed(2)} 
          />
        </List>
      </Block>
      <Actions ref={orderActions}>
        <ActionsButton onClick={() => handleEdit()}>{order?.status === 'n' ? labels.editBasket : labels.editBasketRequest}</ActionsButton>
        <ActionsButton onClick={() => handleDelete()}>{order?.status === 'n' ? labels.cancel : labels.cancelRequest}</ActionsButton>
        {order?.status === 'n' && lastOrder ? 
          <ActionsButton onClick={() => handleMerge()}>{lastOrder.status === 'n' ? labels.merge : labels.mergeRequest}</ActionsButton>
        : ''}
      </Actions>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default OrderDetails
