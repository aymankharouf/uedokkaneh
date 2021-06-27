import { useContext, useState, useEffect } from 'react'
import { f7, Page, Navbar, NavLeft, NavTitle, Link, Toolbar, NavTitleLarge, Block, Button } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import MainCategories from './main-categories'
import { StateContext } from '../data/state-provider'
import { Advert, Notification } from '../data/types'

const Home = () => {
  const { state } = useContext(StateContext)
  const [advert, setAdvert] = useState<Advert | undefined>(undefined)
  const [notifications, setNotifications] = useState<Notification[]>([])
  useEffect(() => {
    setAdvert(() => state.adverts.find(a => a.isActive))
  }, [state.adverts])
  useEffect(() => {
    setNotifications(() => state.notifications.filter(n => n.status === 'n') || [])
  }, [state.notifications])
  useEffect(() => {
    if (state.categories.length === 0) {
      f7.dialog.preloader('')
    } else {
      f7.dialog.close()
    }
  }, [state.categories])

  return (
    <Page>
      <Navbar large>
        <NavLeft>
          <Link iconMaterial="menu" panelOpen="right" iconBadge={notifications.length} badgeColor="red" />
        </NavLeft>
        <NavTitle sliding>
          <img src="/dokaneh_logo.png" alt="logo" className="logo" />
          <span className='banner'>{labels.banner}</span>
        </NavTitle>
        <NavTitleLarge>
          <img src="/dokaneh_logo.png" alt="logo" className="logo" />
          <span className='banner'>{labels.banner}</span>
        </NavTitleLarge>
      </Navbar>
      <Block>
      {advert ? <Button href="/advert/" large outline text={advert.title} className="sections" /> : ''}
      <MainCategories/>
      </Block>
      <Toolbar bottom>
        <BottomToolbar isHome="1"/>
      </Toolbar>
    </Page>
  )
}

export default Home
