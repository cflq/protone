import React, { useState, useEffect} from 'react'
import '../css/PopupBuy.css'
import '../data/Cards.json'

export default function BuyInput({totalPrice, handleChange, quantity}) {

  return (<>
    <div className='buyInput'>

      <div className='inputDiv'>
        <label id='secTitle' htmlFor="quantity">How many do you want to buy (max 99):</label>
        <input
          type="number"
          id='quantity'
          name="quantity"
          min={1}
          max={99}
          value={quantity}
          onChange={handleChange}
        />

      </div>

      <label id="secTitle" htmlFor="quantity">

        Price: <span className="priceValue">
          ${totalPrice.toFixed(2)}
        </span>

      </label>

    </div>
  </>)
}
