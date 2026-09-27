import React from 'react'
import '../css/CaseCard.css'
import '../data/Cards.json'
import "../index.css"

export default function CaseCard({casename, pic, desc, price,onBuy}) {

    return (
        
        <div className='card'>
            <img src={pic} className='caseImage'/>
            <div id='Title' className='caseName'>{casename}</div>
            <div id='secTitle' className='caseDesc'>{desc}</div>

            <div className='buttons'>
                <div onClick={onBuy} className='caseButt'>Buy ★ {price}$</div>
                <div className='caseButt caseCtt'>View Content</div>
            </div>

        </div>
    )
}
