import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'
import { productOfText } from '../data/actions'
import { Pack } from '../data/types'

type Props = {
  id: string,
  type: string
}
const Hints = (props: Props) => {
  const { state } = useContext(StateContext)
  const [pack] = useState(() => state.packs.find(p => p.id === props.id))
  const [packs, setPacks] = useState<Pack[]>([])
  useEffect(() => {
    setPacks(() => {
      let packs = state.packs.filter(p => 
        (props.type === 'p' && p.categoryId === pack?.categoryId && (p.sales > pack.sales || p.rating > pack.rating)) ||
        (props.type === 'o' && p.productId === pack?.productId && p.id !== pack.id && (p.isOffer || p.offerEnd)) ||
        (props.type === 'w' && p.productId === pack?.productId && p.weightedPrice < pack.weightedPrice)
      )
      return packs.sort((p1, p2) => p1.weightedPrice - p2.weightedPrice)  
    })
  }, [pack, state.packs, state.categories, props.type]) 
  return(
    <Page>
      <Navbar title={props.type === 'p' ? labels.otherProducts : (props.type === 'o' ? labels.otherOffers : labels.otherPacks)} backLink={labels.back} />
      <Block>
        <List mediaList>
          {packs.length === 0 ? 
            <ListItem title={labels.noData} />
          : packs.map(p => {
              const categoryInfo = state.categories.find(c => c.id === p.categoryId)
              return (
                <ListItem
                  link={`/pack-details/${p.id}/type/c`}
                  title={p.productName}
                  subtitle={p.productAlias}
                  text={p.name}
                  footer={`${labels.category}: ${categoryInfo?.name}`}
                  after={p.isOffer || p.offerEnd ? '' : (p.price / 100).toFixed(2)}
                  key={p.id}
                >
                  <img src={p.imageUrl} slot="media" className="img-list" alt={labels.noImage} />
                  <div className="list-subtext1">{p.productDescription}</div>
                  <div className="list-subtext2">{productOfText(p.trademark, p.country)}</div>
                  {p.isOffer || p.offerEnd ? <Badge slot="after" color="green">{(p.price / 100).toFixed(2)}</Badge> : ''}
                  {p.closeExpired && <Badge slot="text" color="red">{labels.closeExpired}</Badge>}
                </ListItem>
              )
            })
          }
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Hints