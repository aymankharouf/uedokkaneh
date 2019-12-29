import React, { useMemo } from 'react'
import { Icon } from 'framework7-react'


const RatingStars = props => {
  const stars = useMemo(() => {
    const rating_int = parseInt(props.rating)
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
      stars.push(<Icon key={i} material="star" color={color}></Icon>)
    }
    if (rating_fraction > 0) {
      stars.unshift(<Icon key={i} material="star_half" color={color}></Icon>)
      i++
    }
    while (i++ <= 5) {
      stars.unshift(<Icon key={i} material="star_border" color={color}></Icon>)
    }
    return stars
  }, [props.rating])
  return(
    <React.Fragment>
      {Number(props.count) > 0 ? '(' + props.count + ')' : ''}{stars}
    </React.Fragment>
  )
}

export default RatingStars