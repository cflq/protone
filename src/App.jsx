import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Store from "./Pages/Store.jsx";
import Inventory from "./Pages/Inventory.jsx";


function App() {

  const [balance, setBalance] = useState(() => {
    return Number(localStorage.getItem("balance")) || 0;
  });

  useEffect(() => {
    localStorage.setItem("balance", balance);
  }, [balance]);

  const [inventory, setInventory] = useState(() => {
    return JSON.parse(localStorage.getItem("inventory")) || [];
  });

  useEffect(() => {
    localStorage.setItem("inventory", JSON.stringify(inventory));
  }, [inventory]);

  return (<>
    <Routes>
      <Route path="/" element={<Store balance={balance} setBalance={setBalance} inventory={inventory} setInventory={setInventory} />} />
      <Route path="/inventory" element={<Inventory balance={balance} setBalance={setBalance} inventory={inventory} setInventory={setInventory} />} />
    </Routes>
  </>);
}

export default App;
