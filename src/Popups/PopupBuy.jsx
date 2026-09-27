import React, { useState } from 'react'
import '../css/CaseRoll.css'
import DiplayCase from '../Components/DisplayCase.jsx'
import BuyInput from '../Components/BuyInput.jsx'
import '../data/Cards.json'
import { useNavigate } from "react-router-dom";


export default function PopupBuy({ casename, pic, price, desc, type, pools, onClose, balance, setBalance, setInventory }) {

  const [quantity, setQuantity] = useState(1);
  const totalPrice = price * quantity;

  function handleChange(e) {
    let value = Number(e.target.value);

    if (Number.isNaN(value)) value = 1;
    if (value < 1) value = 1;
    if (value > 99) value = 99;

    setQuantity(value);
  }

  function fundsMsg() {
    if (balance < totalPrice) {
      return "ADD FUNDS";
    }

    else {
      return "BUY";
    }
  }

  const navigate = useNavigate();

  const canBuy = balance >= totalPrice;

  function handleBuy() {
    if (!canBuy) return;

    setBalance(prev => prev - totalPrice);

    setInventory(prev => {
      const newItems = [];

      for (let i = 0; i < quantity; i++) {
        newItems.push({
          id: crypto.randomUUID(),
          name: casename,
          desc: desc,
          pic: pic,
          type: type,
          price: price,
          pools: pools,
        });
      }

      return [...prev, ...newItems];
    });

    onClose();

    navigate("/inventory");
  }


  return (
    <div className='pbuyback'>
      <div className='pbuy'>
        <button className='closebtn' onClick={onClose}>&times;</button>

        <div id='Title' className='pTitle'>Buy - {casename}</div>

        <div className='upperPart'>

          <DiplayCase casename={casename} pic={pic} />

          <BuyInput
            totalPrice={totalPrice}
            handleChange={handleChange}
            quantity={quantity}
          />

        </div>

        <div id='brdr' className='lowerPart'>
          Your Balance : ${balance.toFixed(2)}<br /><br />

          After purchase, this item:<br />
          &bull; will be available in your inventory<br />
          &bull; cannot be sold on market for one day
          <div onClick={handleBuy} className='buybtn'>{fundsMsg()}</div>
        </div>
      </div>
    </div>
  )
}
