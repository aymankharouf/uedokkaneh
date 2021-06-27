import { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Badge } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StateContext } from '../data/state-provider'
import moment from 'moment'
import 'moment/locale/ar'
import labels from '../data/labels'
import { storeSummary } from '../data/config'
import { productOfText } from '../data/actions'
import { PackPrice } from '../data/types'

type Props = {
  type: string
}
const StorePacks = (props: Props) => {
  const { state } = useContext(StateContext)
  const [storePacks, setStorePacks] = useState<PackPrice[]>([])
  useEffect(() => {
    setStorePacks(() => {
      const storePacks = state.packPrices.filter(p => p.storeId === state.customerInfo?.storeId)
      const extendedStorePacks = storePacks.map(p => {
        const packInfo = state.packs.find(pa => pa.id === p.packId)
        return {
          ...p,
          packInfo
        }
      })
      return extendedStorePacks.filter(p => (props.type === 'a')
                            || (props.type === 'o' && p.price > (p.packInfo?.price ?? 0)) 
                            || (props.type === 'n' && p.price === (p.packInfo?.price ?? 0) && p.storeId !== p.packInfo?.minStoreId)
                            || (props.type === 'l' && p.price === (p.packInfo?.price ?? 0) && p.storeId === p.packInfo?.minStoreId))
    })
  }, [state.packPrices, state.packs, state.customerInfo, props.type])
  let i = 0
  return(
    <Page>
      <Navbar title={storeSummary.find(s => s.id === props.type)?.name} backLink={labels.back} />
      <Block>
        <List mediaList>
          {storePacks.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : storePacks.map(p => 
              <ListItem
                link={`/pack-details/${p.packId}/type/o`}
                title={p.packInfo?.productName}
                subtitle={p.packInfo?.productAlias}
                text={p.packInfo?.productDescription}
                footer={moment(p.time).fromNow()}
                after={((p.packInfo?.price ?? 0) / 100).toFixed(2)}
                key={i++}
              >
                <img src={p.packInfo?.imageUrl} slot="media" className="img-list" alt={labels.noImage} />
                <div className="list-subtext1">{p.packInfo?.name}</div>
                <div className="list-subtext2">{productOfText(p.packInfo?.trademark ?? '', p.packInfo?.country ?? '')}</div>
                {p.price > (p.packInfo?.price ?? 0) && <div className="list-subtext3">{`${labels.myPrice}: ${(p.price / 100).toFixed(2)}`}</div>}
                {p.packInfo?.isOffer && <Badge slot="title" color='green'>{labels.offer}</Badge>}
              </ListItem>
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

export default StorePacks
