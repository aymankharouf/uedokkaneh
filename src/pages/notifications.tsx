import { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import moment from 'moment'
import 'moment/locale/ar'
import { readNotification, getMessage, showError } from '../data/actions'
import { iNotification } from '../data/interfaces'

const Notifications = () => {
  const { state } = useContext(StoreContext)
  const [error, setError] = useState('')
  const [notifications, setNotifications] = useState<iNotification[]>([])
  useEffect(() => {
      setNotifications(() => [...state.notifications].sort((n1, n2) => n2.time > n1.time ? -1 : 1))
  }, [state.notifications])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleOpen = (notification: iNotification) => {
    try{
      if (state.userInfo) {
        readNotification(notification, state.notifications)
        f7.views.current.router.navigate(`/notification-details/${notification.id}`)  
      }
    } catch(err) {
      setError(getMessage(f7.views.current.router.currentRoute.path, err))
    }
  }
  return (
    <Page>
      <Navbar title={labels.notifications} backLink={labels.back} />
      <Block>
        <List mediaList>
          {notifications.length === 0 ? 
            <ListItem title={labels.noData} />
          : notifications.map(n =>
              <ListItem
                link="#"
                title={n.title}
                subtitle={n.status === 'n' ? labels.notRead : labels.read}
                footer={moment(n.time).fromNow()}
                key={n.id}
                onClick={() => handleOpen(n)}
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

export default Notifications
