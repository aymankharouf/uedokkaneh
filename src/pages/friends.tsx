import { useContext, useState, useEffect } from 'react'
import { f7, Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon, Button } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { deleteFriend, getMessage, showError, showMessage } from '../data/actions'
import { friendStatus } from '../data/config'
import { Friend } from '../data/types'

const Friends = () => {
  const { state } = useContext(StateContext)
  const [error, setError] = useState('')
  const [friends, setFriends] = useState<Friend[]>([])
  useEffect(() => {
    setFriends(() => {
      const friends = state.userInfo?.friends?.slice() || []
      return friends.sort((f1, f2) => f1.name > f2.name ? 1 : -1)
    })
  }, [state.userInfo])
  useEffect(() => {
    if (error) {
      showError(error)
      setError('')
    }
  }, [error])
  const handleDelete = (mobile: string) => {
    f7.dialog.confirm(labels.confirmationText, labels.confirmationTitle, () => {
      try{
        if (state.userInfo) {
          deleteFriend(state.userInfo, mobile)
          showMessage(labels.deleteSuccess)  
        }
      } catch(err) {
        setError(getMessage(f7.views.current.router.currentRoute.path, err))
      }
    })  
  }
  let i = 0
  return (
    <Page>
      <Navbar title={labels.friends} backLink={labels.back} />
      <Block>
        <List mediaList>
          {friends.length === 0 ? 
            <ListItem title={labels.noData} />
          : friends.map(f =>
              <ListItem
                title={f.name}
                subtitle={f.mobile}
                footer={friendStatus.find(s => s.id === f.status)?.name}
                key={i++}
              >
                <Button text={labels.delete} slot="after" onClick={() => handleDelete(f.mobile)} />
              </ListItem>
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/invite-friend/">
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Friends
