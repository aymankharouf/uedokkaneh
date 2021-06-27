import { useContext, useEffect, useState } from 'react'
import { f7, Block, Fab, Page, Navbar, List, ListItem, Toolbar, Icon, Stepper } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import { editOrder, showMessage, showError, getMessage, quantityDetails } from '../data/actions'
import labels from '../data/labels'
import BottomToolbar from './bottom-toolbar'
import { setup } from '../data/config'
import { OrderPack } from '../data/types'

type Props = {
  id: string
}
const EditOrder = (props: Props) => {
  const { state, dispatch } = useContext(StateContext)
  const [error, setError] = useState('')
  const [order] = useState(() => state.orders.find(o => o.id === props.id))
  const [orderBasket, setOrderBasket] = useState<OrderPack[]>([])
  const [total, setTotal] = useState(0)
  const [overLimit, setOverLimit] = useState(false)
  const [hasChanged, setHasChanged] = useState(false)
  const [customerOrdersTotals] = useState(() => {
    const activeOrders = state.orders.filter(o => ['n', 'a', 'e', 'f', 'p'].includes(o.status))
    return activeOrders.reduce((sum, o) => sum + o.total, 0)
  })
  useEffect(() => {
    if (order) {
      const basket = order.basket.map(p => {
        return {
          ...p,
          oldQuantity: p.quantity
        }
      })
      dispatch({type: 'LOAD_ORDER_BASKET', payload: basket})
    }
  }, [dispatch, order])
  useEffect(() => {
    setOrderBasket(() => {
      const basket = state.orderBasket?.filter(p => p.quantity > 0) || []
      return basket.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId)
        return {
          ...p,
          packInfo
        }
      })
    })
  }, [state.orderBasket, state.packs])
  useEffect(() => {
    setHasChanged(() => state.orderBasket?.find(p => p.oldQuantity !== p.quantity) ? true : false)
  }, [state.orderBasket])
  useEffect(() => {
    setTotal(() => orderBasket.reduce((sum, p) => sum + p.gross, 0))
  }, [orderBasket])
  useEffect(() => {
    const orderLimit = state.customerInfo?.orderLimit ?? setup.orderLimit
    if (customerOrdersTotals + total > orderLimit){
      setOverLimit(true)
    } else {
      setOverLimit(false)
    }
  }, [state.customerInfo, customerOrdersTotals, total])

  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleSubmit = () => {
    try{
      if (state.customerInfo?.isBlocked) {
        throw new Error('blockedUser')
      }
      if (order) {
        editOrder(order, state.orderBasket)
        showMessage(order.status === 'n' ? labels.editSuccess : labels.sendSuccess)
        dispatch({type: 'CLEAR_ORDER_BASKET'})
        f7.views.current.router.back()  
      }
    } catch(err) {
			setError(getMessage(f7.views.current.router.currentRoute.path, err))
		}
  }
  return (
    <Page>
      <Navbar title={labels.editOrder} backLink={labels.back} />
      <Block>
        <List mediaList>
          {orderBasket.map(p =>
            <ListItem
              title={p.productName}
              subtitle={p.productAlias}
              text={p.packName}
              footer={`${labels.price}: ${(p.gross / 100).toFixed(2)}`}
              after={p.packInfo ? '' : labels.unAvailableNote}
              key={p.packId}
            >
              <div className="list-subtext1">{`${labels.unitPrice}: ${(p.price / 100).toFixed(2)}`}</div>
              <div className="list-subtext2">{quantityDetails(p)}</div>
              {p.packInfo ? 
                <Stepper
                  slot="after"
                  fill
                  buttonsOnly
                  onStepperPlusClick={() => dispatch({type: 'INCREASE_ORDER_QUANTITY', payload: p})}
                  onStepperMinusClick={() => dispatch({type: 'DECREASE_ORDER_QUANTITY', payload: p})}
                />
              : ''}
            </ListItem>
          )}
        </List>
      </Block>
      {(!overLimit && hasChanged) &&
        <Fab position="center-bottom" slot="fixed" text={`${labels.submit} ${(total / 100).toFixed(2)}`} color="green" onClick={() => handleSubmit()}>
          <Icon material="done"></Icon>
        </Fab>
      }
      {overLimit && 
        <Fab position="center-bottom" slot="fixed" text={labels.limitOverFlowNote} color="red" href="/help/ol">
          <Icon material="report_problem"></Icon>
        </Fab>
      }
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default EditOrder
