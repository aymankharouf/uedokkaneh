import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Route } from 'react-router-dom'
import StateProvider from './data/state-provider'


/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css'
import '@ionic/react/css/float-elements.css'
import '@ionic/react/css/text-alignment.css'
import '@ionic/react/css/text-transformation.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'

/* Theme variables */
import './css/variables.css'
import './css/app.css'

import Home from './pages/home'
import Categories from './pages/categories'
import Panel from './pages/panel'
import Login from './pages/login'
import Register from './pages/register'
import Packs from './pages/packs'
import PackDetails from './pages/pack-details'
import Basket from './pages/basket'
import ConfirmOrder from './pages/confirm-order'
import OrdersList from './pages/orders-list'
import OrderDetails from './pages/order-details'
import AddAlarm from './pages/add-alarm'
import PasswordRequest from './pages/password-request'
import InviteFriend from './pages/invite-friend'
import StoreSummary from './pages/store-summary'
import StorePacks from './pages/store-packs'
import ChangePassword from './pages/change-password'
import Hints from './pages/hints'
import Help from './pages/help'
import Notifications from './pages/notifications'
import PurchasedPacks from './pages/purchased-packs'
import Advert from './pages/advert'
import EditOrder from './pages/edit-order'
import Friends from './pages/friends'


const app = () => {
  const href = window.location.href
  if (href.length - href.replaceAll('/', '').length !== (href.endsWith('/') ? 3 : 2)) {
    window.location.href = window.location.hostname === 'localhost' ? href.substr(0, 21) : href.substr(0, 28)
  }
  return (
    <StateProvider>
      <IonApp dir="rtl">
        <IonReactRouter>
          <IonSplitPane contentId="main">
            <Panel />
            <IonRouterOutlet id="main" mode="ios">
              <Route path="/" exact={true} component={Home} />
              <Route path="/login" exact={true} component={Login} />
              <Route path="/password-request" exact={true} component={PasswordRequest} />
              <Route path="/change-password" exact={true} component={ChangePassword} />
              <Route path="/register" exact={true} component={Register} />
              <Route path="/invite-friend" exact={true} component={InviteFriend} />
              <Route path="/categories/:id" exact={true} component={Categories} />
              <Route path="/packs/:type/:id" exact={true} component={Packs} />
              <Route path="/pack-details/:id/:type" exact={true} component={PackDetails} />
              <Route path="/add-alarm/:packId/:alarmType" exact={true} component={AddAlarm} />
              <Route path="/basket" exact={true} component={Basket} />
              <Route path="/confirm-order" exact={true} component={ConfirmOrder} />
              <Route path="/orders-list" exact={true} component={OrdersList} />
              <Route path="/order-details/:id" exact={true} component={OrderDetails} />
              <Route path="/store-summary" exact={true} component={StoreSummary} />
              <Route path="/store-packs/:type" exact={true} component={StorePacks} />
              <Route path="/hints/:id/:type" exact={true} component={Hints} />
              <Route path="/help/:id" exact={true} component={Help} />
              <Route path="/notifications" exact={true} component={Notifications} />
              <Route path="/purchased-packs" exact={true} component={PurchasedPacks} />
              <Route path="/advert" exact={true} component={Advert} />
              <Route path="/edit-order/:id" exact={true} component={EditOrder} />
              <Route path="/friends" exact={true} component={Friends} />
            </IonRouterOutlet>
          </IonSplitPane>
        </IonReactRouter>
      </IonApp>
    </StateProvider>
  );
};

export default app;

