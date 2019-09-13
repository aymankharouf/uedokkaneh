import React, { useContext } from 'react'
import { Block, Page, Navbar, Card, CardContent, CardHeader, Link, Fab, Toolbar, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import Rating from './Rating'
import RateProduct from './RateProduct'
import { StoreContext } from '../data/Store';

const PackDetails = props => {
  const { state, user, dispatch } = useContext(StoreContext)
  const pack = state.packs.find(rec => rec.id === props.id)
  const product = state.products.find(rec => rec.id === pack.productId)
  const handleAddPack = () => {
    dispatch({type: 'ADD_TO_BASKET', pack})
    props.f7router.back()
  }

  const rating_links = !user || state.rating.find(rating => rating.productId === props.id) ? null : <RateProduct product={product} />

  return (
    <Page>
      <Navbar title={product.name} backLink="Back" />
      <Block>
        <Card className="demo-card-header-pic">
          <CardHeader className='card-title'>
            <p className="less-price">
              <span className="price">
                {(pack.price / 1000).toFixed(3)}
              </span> <br />
              <Link iconIos="f7:bell" iconMd="material:notifications_none" text={state.labels.lessPrice} color="red" onClick={() => props.f7router.navigate(`/lessPrice/${props.id}`)}/>
            </p>
            <p className="rating"><Rating rating={product.rating} /> </p>
          </CardHeader>
          <CardContent>
            <img src={product.imageUrl} width="100%" height="250" alt=""/>
            <p>{pack.name}</p>
            <p>{`${state.labels.productOf} ${state.countries.find(rec => rec.id === product.country).name}`}</p>
          </CardContent>
        </Card>
      </Block>
      <Fab position="center-bottom" slot="fixed" text={state.labels.addToBasket} color="green" onClick={() => handleAddPack()}>
        <Icon ios="f7:add" aurora="f7:add" md="material:add"></Icon>
      </Fab>
      {rating_links}
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>

    </Page>
  )
}

export default PackDetails