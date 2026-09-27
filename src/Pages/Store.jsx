import React from 'react'
import { useState, useEffect } from 'react';
import CaseCard from "../Components/CaseCard.jsx";
import cases from "../data/Cards.json";
import PopupBuy from "../Popups/PopupBuy.jsx";
import NavBar from "../Components/NavBar.jsx";
import { ImCart } from "react-icons/im";
import "../App.css"

export default function Store({ balance, setBalance, inventory, setInventory }) {

    const [isBuyOpen, setIsBuyOpen] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);

    function openBuy(caseData) {
        setSelectedCase(caseData);
        setIsBuyOpen(true);
    }

    function closeBuy() {
        setIsBuyOpen(false);
        setSelectedCase(null);
    }

    return (<>

        <NavBar balance={balance} setBalance={setBalance} />

        <h2 className='page-name'><ImCart /> STORE</h2>

        <div className="cardsContainer">
            {cases.map((c) => (
                <CaseCard
                    key={c.id}
                    id={c.id}
                    casename={c.casename}
                    pic={c.pic}
                    desc={c.desc}
                    price={c.price}
                    onBuy={() => openBuy(c)}
                />
            ))}

            {isBuyOpen && selectedCase && (
                <PopupBuy
                    id={selectedCase.id}
                    casename={selectedCase.casename}
                    pic={selectedCase.pic}
                    desc={selectedCase.desc}
                    price={selectedCase.price}
                    type={selectedCase.type}
                    pools={selectedCase.pools}
                    onClose={closeBuy}
                    balance={balance}
                    setBalance={setBalance}
                    inventory={inventory}
                    setInventory={setInventory}
                />
            )}
        </div>
    </>)
}