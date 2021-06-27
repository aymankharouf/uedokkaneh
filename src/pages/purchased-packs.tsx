import { useContext, useEffect, useState, useRef } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Actions, ActionsButton, Icon, Link } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StateContext } from '../data/state-provider'
import { quantityText, addQuantity } from '../data/actions'
import labels from '../data/labels'
import moment from 'moment'
import 'moment/locale/ar'
import { showMessage, showError, getMessage, rateProduct } from '../data/actions'
import { Order } from '../data/types'

type PurchasedPack = {
  packId: string,
  productId: string,
  productName: string,
  productAlias: string,
  packName: string,
  imageUrl: string,
  bestPrice: number,
  lastPrice: number,
  quantity: number,
  lastQuantity: number,
  lastTime: Date
}

const PurchasedPacks = () => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
	const [purchasedPacks, setPurchasedPacks] = useState<PurchasedPack[]>([])
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([])
  const [currentPack, setCurrentPack] = useState<PurchasedPack | undefined>(undefined)
  const actionsList = useRef<Actions>(null)
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  useEffect(() => {
    setDeliveredOrders(() => {
      const deliveredOrders = state.orders.filter(o => o.status === 'd')
      return deliveredOrders.sort((o1, o2) => o1.time! > o2.time! ? -1 : 1)
    })
  }, [state.orders])
	useEffect(() => {
		let packsArray: PurchasedPack[] = []
		deliveredOrders.forEach(o => {
			o.basket.forEach(p => {
        const found = packsArray.findIndex(pa => pa.packId === p.packId)
				if (found > -1) {
          packsArray.splice(found, 1, {
            ...packsArray[found],
            bestPrice: packsArray[found].bestPrice <= p.actual! ? packsArray[found].bestPrice! : p.actual!,
            lastPrice: p.actual!,
            quantity: addQuantity(packsArray[found].quantity, p.purchased),
            lastQuantity: p.purchased,
            lastTime: o.time!
          })
				} else {
          packsArray.push({
            packId: p.packId,
            productId: p.productId,
            productName: p.productName,
            productAlias: p.productAlias,
            packName: p.packName,
            imageUrl: p.imageUrl,
            bestPrice: p.actual!,
            lastPrice: p.actual!,
            quantity: p.purchased,
            lastQuantity: p.purchased,
            lastTime: o.time!
          })
        }
			})
		})
		setPurchasedPacks(packsArray.sort((p1, p2) => p2.lastTime > p1.lastTime ? -1 : 1))
  }, [deliveredOrders])
  const handleRate = (value: number) => {
    try{
      if (state.customerInfo?.isBlocked) {
        throw new Error('blockedUser')
      }
      if (currentPack) {
        rateProduct(currentPack.productId, value)
        showMessage(labels.ratingSuccess)  
      }
    } catch(err) {
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }
  const handleActions = (pack: PurchasedPack)=> {
    setCurrentPack(pack)
    actionsList.current?.open()
  }
  let i = 0
  return(
    <Page>
      <Navbar title={labels.purchasedPacks} backLink={labels.back} />
      <Block>
				<List mediaList>
					{purchasedPacks.length === 0 ? 
						<ListItem title={labels.noData} /> 
					: purchasedPacks.map(p => 
							<ListItem
								title={`${p.productName}${p.productAlias ? '-' + p.productAlias : ''}`}
								subtitle={p.packName}
                text={`${labels.bestPrice}: ${(p.bestPrice / 100).toFixed(2)}`}
                footer={`${labels.lastTime}: ${moment(p.lastTime).fromNow()}`}
								key={i++}
                className={currentPack?.packId === p.packId ? 'selected' : ''}
              >
                <img src={p.imageUrl} slot="media" className="img-list" alt={labels.noImage} />
                <div className="list-subtext1">{`${labels.lastPrice}: ${(p.lastPrice / 100).toFixed(2)}`}</div>
                <div className="list-subtext2">{`${labels.quantity}: ${quantityText(p.quantity)}`}</div>
                <div className="list-subtext3">{`${labels.lastQuantity}: ${quantityText(p.lastQuantity)}`}</div>
                {state.userInfo?.ratings?.find(r => r.productId === p.productId) ? '' : <Link slot="after" iconMaterial="favorite_border" onClick={()=> handleActions(p)}/> }
							</ListItem>
						)
					}
				</List>
      </Block>
      <Actions ref={actionsList}>
        <ActionsButton onClick={() => handleRate(5)}>
          {labels.rateGood}
          <Icon material="thumb_up" color="green"></Icon>
        </ActionsButton>
        <ActionsButton onClick={() => handleRate(3)}>
          {labels.rateMiddle}
          <Icon material="thumbs_up_down" color="blue"></Icon>
        </ActionsButton>
        <ActionsButton onClick={() => handleRate(1)}>
          {labels.rateBad}
          <Icon material="thumb_down" color="red"></Icon>
        </ActionsButton>
      </Actions>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default PurchasedPacks