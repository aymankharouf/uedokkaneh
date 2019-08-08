import React, { useContext, useState } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, ListInput, Fab, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import ReLogin from './ReLogin'
import { StoreContext } from '../data/Store';
import { confirmOrder } from '../data/Actions'


const ConfirmOrder = props => {
  const { state, user, dispatch } = useContext(StoreContext)
  const totalPrice = state.basket.reduce((a, product) => a + Number(product.netPrice), 0)
  const handleOrder = e => {
    const order = {
      basket: state.basket,
      total: parseFloat(totalPrice + 0.250).toFixed(3)
    }
    confirmOrder(order).then(() => {
      props.f7router.navigate('/home/')
      dispatch({type: 'CLEAR_BASKET'})
    })
  }
  if (!user) return <ReLogin callingPage="confirmOrder"/>
  return(
    <Page>
      <Navbar title="Order" backLink="Back" />
      <Block>
        <List>
          {state.basket && state.basket.map(product => 
            <ListItem 
              key={product.id} 
              title={`${product.name} (${product.quantity})`} 
              after={product.netPrice}
            />
          )}
          <ListItem title="Total" className="total" after={parseFloat(totalPrice).toFixed(3)} />
          <ListItem title="Delivery" className="delivery" after="0.250" />
          <ListItem title="Net Total" className="net" after={parseFloat(totalPrice + 0.250).toFixed(3)} />
        </List>
      </Block>
      <Fab position="center-bottom" slot="fixed" text="Confirm" color="green" onClick={() => handleOrder()}>
          <Icon ios="f7:check" aurora="f7:check" md="material:done"></Icon>
        </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}
export default ConfirmOrder