import React, { useContext, useState, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link, Badge, Popover } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';

const Packs = props => {
  const { state } = useContext(StoreContext)
  const packs = useMemo(() => {
    let packs = state.packs.filter(p => props.id ? state.products.find(pr => pr.id === p.productId).category === props.id : true)
    packs = packs.filter(p => p.price > 0)
    return packs.sort((p1, p2) => p1.price - p2.price)
  }, [state.packs, state.products, props.id]) 
  const [categoryPacks, setCategoryPacks] = useState(packs)
  const category = state.categories.find(category => category.id === props.id)
  const [orderBy, setOrderBy] = useState('p')
  const orderByList = useMemo(() => state.orderByList.filter(o => o.id !== orderBy)
  , [state.orderByList, orderBy]) 
  const handleOrdering = orderByValue => {
    setOrderBy(orderByValue)
    switch(orderByValue){
      case 'p':
        setCategoryPacks([...categoryPacks].sort((p1, p2) => p1.price - p2.price))
        break
      case 's':
        setCategoryPacks([...categoryPacks].sort((p1, p2) => p2.sales - p1.sales))
        break
      case 'r':
        setCategoryPacks([...categoryPacks].sort((p1, p2) => p2.rating - p1.rating))
        break
      case 'o':
        setCategoryPacks([...categoryPacks].sort((p1, p2) => p2.isOffer - p1.isOffer))
        break
      case 'v':
        setCategoryPacks([...categoryPacks].sort((p1, p2) => p1.value - p2.value))
        break
      case 't':
        setCategoryPacks([...categoryPacks].sort((p1, p2) => state.products.find(p => p.id === p1.productId).name > state.products.find(p => p.id === p2.productId).name ? 1 : -1))
        break
      default:
    }
  }
  return(
    <Page>
      <Navbar title={category ? category.name : state.labels.allProducts} backLink={state.labels.back}>
        <NavRight>
          <Link searchbarEnable=".searchbar" iconMaterial="search"></Link>
        </NavRight>
        <Searchbar
          className="searchbar"
          searchContainer=".search-list"
          searchIn=".item-title, .item-subtitle"
          clearButton
          expandable
          placeholder={state.labels.search}
        />
      </Navbar>
      <Popover className="popover-menu">
        <List>
        {orderByList.map(o => 
          <ListItem 
            link="#" 
            popoverClose 
            key={o.id} 
            title={o.name} 
            onClick={() => handleOrdering(o.id)}
          />
        )}
        </List>
      </Popover>
      <Block>
        <List className="searchbar-not-found">
          <ListItem title={state.labels.not_found} />
        </List>
        <List mediaList className="search-list searchbar-found">
          <ListItem 
            link="#"
            popoverOpen=".popover-menu"
            title={state.labels.orderBy} 
            after={state.orderByList.find(o => o.id === orderBy).name}
          />
          {categoryPacks && categoryPacks.map(p => {
            const productInfo = state.products.find(pr => pr.id === p.productId)
            return (
              <ListItem
                link={`/pack/${p.id}`}
                title={productInfo.name}
                after={(p.price / 1000).toFixed(3)}
                subtitle={p.name}
                text={`${state.labels.productOf} ${state.countries.find(c => c.id === productInfo.country).name}`}
                key={p.id}
              >
                <img slot="media" src={productInfo.imageUrl} className="lazy lazy-fadeIn avatar" alt={productInfo.name} />
                {productInfo.isNew ? <Badge slot="title" color="red">{state.labels.new}</Badge> : ''}
                {p.isOffer ? <Badge slot="title" color='green'>{state.labels.offer}</Badge> : ''}
                {state.customer.type === 'o' && p.stores.find(s => s.storeId === state.customer.storeId) ? <Badge slot="footer" color='green'> {state.labels.myPrice} {(p.stores.find(s => s.storeId === state.customer.storeId).price / 1000).toFixed(3)} </Badge> : ''}
              </ListItem>
            )
          })}
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Packs