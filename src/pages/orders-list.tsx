import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { orderStatus } from '../data/config'
import { Order } from '../data/types'

const OrdersList = () => {
  const { state } = useContext(StateContext)
  const [orders, setOrders] = useState<Order[]>([])
  useEffect(() => {
    setOrders(() => {
      const orders = state.orders.filter(o => ['n', 'a', 'e', 'u', 'f', 'p', 'd'].includes(o.status))
      return orders.sort((o1, o2) => o2.time! > o1.time! ? -1 : 1)
    })
  }, [state.orders])
  return(
    <Page>
      <Navbar title={labels.myOrders} backLink={labels.back} />
      <Block>
        <List mediaList>
          {orders.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : orders.map(o =>
              <ListItem
                link={`/order-details/${o.id}`}
                title={orderStatus.find(s => s.id === o.status)?.name}
                subtitle={moment(o.time).fromNow()}
                after={(o.total / 100).toFixed(2)}
                key={o.id}
              />
            )
          }
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default OrdersList
