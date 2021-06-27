import { useContext, useState, useEffect } from 'react'
import { f7, Page, Navbar, List, ListItem } from 'framework7-react'
import { StoreContext } from '../data/store'
import { logout } from '../data/actions'
import labels from '../data/labels'
import { iNotification } from '../data/interfaces'

const Panel = () => {
  const { state, dispatch } = useContext(StoreContext)
  const [notifications, setNotifications] = useState<iNotification[]>([])
  useEffect(() => {
    setNotifications(() => state.notifications.filter(n => n.status === 'n') || [])
  }, [state.notifications])
  const handleLogout = () => {
    logout()
    dispatch({type: 'LOGOUT'})
    f7.views.main.router.navigate('/home/', {reloadAll: true})
    f7.panel.close('right') 
    dispatch({type: 'CLEAR_BASKET'})
  }
  return(
    <Page>
      <Navbar title={labels.mainPanelTitle} />
      <List>
        {state.user ? <ListItem link="#" title={labels.logout} onClick={() => handleLogout()} />
        : <ListItem link="/panel-login/" title={labels.login} />}
        {state.user && <ListItem link="/change-password/" title={labels.changePassword} />}
        {state.user && <ListItem link="/notifications/" title={labels.notifications} badge={notifications.length} badgeColor="red" view="#main-view" panelClose />}
        {state.user && <ListItem link="/packs/0/type/f" title={labels.favorites} view="#main-view" panelClose />}
        {state.user && <ListItem link="/orders-list/" title={labels.myOrders} view="#main-view" panelClose />}
        {state.user && <ListItem link="/purchased-packs/" title={labels.purchasedPacks} view="#main-view" panelClose />}
        {state.user && <ListItem link="/friends/" title={labels.friends} view="#main-view" panelClose />}
        {state.user && state.user.displayName && <ListItem link="/store-summary/" title={labels.myPacks} view="#main-view" panelClose />}
        {!state.user && <ListItem link="/register/o" title={labels.registerStoreOwner} />}
      </List>
    </Page>
  )
}
export default Panel
