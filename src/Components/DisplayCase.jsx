import React from 'react'
import '../css/PopupBuy.css'
import '../data/Cards.json'

export default function DisplayCase({casename, pic}) {
    return (
        <div className='buyInfo'>

            <div id='brdr' className='casebuyDiv'>
                <img className='casebuyPic' src={pic}/>
            </div>

            <div className='casebuyInfo'>
                <div id='Title' className='casebuyName'>{casename}</div>
                <div id='secTitle' className='casebuyDesc'>Base Grade Container</div>
                <br/>
                <div id='secTitle' className='casebuyDesc2'>This item is a commodity, where all the individual items are effectively identical. Individual listings aren't accessible; you can instead issue orders to buy at a specific price, with the cheapest listing getting automatically matched to the highest buy order.</div>
            </div>

        </div>
    )
}
