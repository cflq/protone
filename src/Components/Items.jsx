import React from 'react'
import "../css/Inventory.css"

export default function Items({ casename, price, pic, desc }) {

  return (
    <div className='inv-item'>
      <img src={pic} className='itemImage' />
      <p className='item-name'>{casename} (${price})</p>
    </div>
  )
}
