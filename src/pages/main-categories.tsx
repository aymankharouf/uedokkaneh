import { useContext, useState, useEffect } from 'react'
import { Button } from 'framework7-react'
import { StateContext } from '../data/state-provider'
import { randomColors } from '../data/config'
import labels from '../data/labels'
import { Category } from '../data/types'

const MainCategories = () => {
  const { state } = useContext(StateContext)
  const [categories, setCategories] = useState<Category[]>([])
  useEffect(() => {
    setCategories(() => {
      const categories = state.categories.filter(c => c.parentId === '0')
      return categories.sort((c1, c2) => c1.ordering - c2.ordering)  
    })
  }, [state.categories])
  let i = 0
  return (
    <>
      <Button
        text={labels.allProducts}
        href={`/search/`} 
        large 
        fill 
        className="sections" 
        color={randomColors[i++ % 10].name} 
      />
      {categories.map(c => {
        return (
          <Button
            text={c.name}
            href={`/categories/${c.id}`} 
            large 
            fill 
            className="sections" 
            color={randomColors[i++ % 10].name} 
            key={c.id}
          />
        )
      })}
    </>
  )

}
export default MainCategories
