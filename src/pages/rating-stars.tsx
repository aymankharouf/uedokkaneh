import { useState } from 'react'
import { Icon } from 'framework7-react'

type Props = {
  rating: number,
  count: number
}
const RatingStars = (props: Props) => {
  const [stars] = useState(() => {
    const rating_int = props.rating
    const rating_fraction = Number(props.rating) - rating_int
    let color
    switch(rating_int){
      case 1:
      case 2:
        color = 'red'
        break
      case 4:
      case 5:
        color = 'green'
        break
      default:
        color = 'yellow'
    }
    let stars = []
    let i = 0
    while (++i <= rating_int) {
      stars.push(<Icon key={i} size="1.2rem" material="star" color={color}></Icon>)
    }
    if (rating_fraction > 0) {
      stars.unshift(<Icon key={i} size="1.2rem" material="star_half" color={color}></Icon>)
      i++
    }
    while (i++ <= 5) {
      stars.unshift(<Icon key={i} size="1.2rem" material="star_border" color={color}></Icon>)
    }
    return stars
  })
  return(
    <>
      {props.count > 0 ? '(' + props.count + ')' : ''}{stars}
    </>
  )
}

export default RatingStars