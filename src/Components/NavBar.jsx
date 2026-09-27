import React, { useState } from 'react'
import "../css/NavBar.css"
import Logo from "/P2.png"
import { FaWallet } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';


const DAY_MS = 1000 * 60 * 60 * 24;

export default function NavBar({balance, setBalance}) {

    const navigate = useNavigate();

    function claimDaily() {
        const now = Date.now();
        const lastClaim = Number(localStorage.getItem("lastDaily")) || 0;


        if (now - lastClaim < DAY_MS) {
            alert("Daily already claimed. Come back later!");
            return;
        }

        const newBalance = balance + 1000;

        setBalance(newBalance);

        localStorage.setItem("balance", newBalance);
        localStorage.setItem("lastDaily", now);
    }

    return (
        <div className="navbar">

            <div className='logo'>
                <img className='logo-img' src={Logo} alt="Logo" />
            </div>

            <div className='navlists'>
                <li onClick={() => navigate("/")} className="navlist">Store</li>
                <li onClick={() => navigate("/Inventory")} className="navlist">Inventory</li>
                <li onClick={claimDaily} className='navlist'>Daily</li>
            </div>

            <div className='balance'>
                <div className='balance-logo'>
                    <FaWallet />
                </div>
                ${balance.toFixed(2)}
            </div>
            
        </div>
    )
}
