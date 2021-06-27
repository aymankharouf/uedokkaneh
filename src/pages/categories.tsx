import { useContext, useState, useEffect } from 'react'
import { f7, Button, Block, Page, Navbar, Toolbar } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import BottomToolbar from './bottom-toolbar'
import labels from '../data/labels'
import { randomColors } from '../data/config'
import { Category } from '../data/types'

type Props = {
  id: string
} 

const Categories = (props: Props) => {
  const { state } = useContext(StateContext)
  const [categories, setCategories] = useState<Category[]>([])
  useEffect(() => {
    setCategories(() => {
      const categories = state.categories.filter(c => c.parentId === props.id)
      return categories.sort((c1, c2) => c1.ordering - c2.ordering)
    })
  }, [state.categories, state.packs, props.id])
  useEffect(() => {
    if (state.packs.length === 0) {
      f7.dialog.preloader('')
    } else {
      f7.dialog.close()
    }
  }, [state.packs])

  let i = 0
  return(
    <Page>
      <Navbar title={state.categories.find(c => c.id === props.id)?.name} backLink={labels.back} />
      <Block>
        <Button 
            text={labels.allProducts}
            large 
            fill 
            className="sections" 
            color={randomColors[i++ % 10].name} 
            href={`/packs/${props.id}/type/a`} 
          />
        {categories.map(c => {
          return (
            <Button 
              text={c.name}
              large 
              fill 
              className="sections" 
              color={randomColors[i++ % 10].name} 
              href={c.isLeaf ? `/packs/${c.id}/type/n` : `/categories/${c.id}`} 
              key={c.id}
            />
          )
        })}
      </Block>
      <Toolbar bottom>
        <BottomToolbar isHome="1"/>
      </Toolbar>
    </Page>
  )
}


export default Categories
