import React, { useMemo, useState } from "react";
import NavBar from "../Components/NavBar.jsx";
import { GiBackpack } from "react-icons/gi";
import Items from "../Components/Items.jsx";
import CaseRoll from "../Popups/CaseRoll.jsx";

import "../App.css";
import "../css/CaseCard.css";
import "../css/NavBar.css";
import "../css/Inventory.css";

import skins from "../data/Skins.json";
import knives from "../data/Knives.json";
import gloves from "../data/Gloves.json";

// ---------------- helpers ----------------
const round2 = (n) => Math.round(Number(n || 0) * 100) / 100;

function safeUUID() {
  return crypto?.randomUUID?.() ?? String(Date.now() + Math.random());
}

function rollWeaponFloat() {
  const r = Math.random();
  if (r < 0.03) return "FN"; // 3%
  if (r < 0.18) return "MW"; // 15%
  if (r < 0.53) return "FT"; // 35%
  if (r < 0.78) return "WW"; // 25%
  return "BS"; // 22%
}

function rollFloatFromKeys(keys, fallback = "FT") {
  if (!Array.isArray(keys) || keys.length === 0) return fallback;

  // if FN/MW exist, slightly bias better floats
  if (keys.includes("FN") && keys.includes("MW")) {
    return Math.random() < 0.65 ? "FN" : "MW";
  }

  return keys[Math.floor(Math.random() * keys.length)];
}

function rollDopplerPhase() {
  const r = Math.random();
  if (r < 0.7) {
    const phases = ["Phase 1", "Phase 2", "Phase 3", "Phase 4"];
    return phases[Math.floor(Math.random() * phases.length)];
  }
  const rr = Math.random();
  if (rr < 0.55) return "Ruby";
  if (rr < 0.85) return "Sapphire";
  return "Black Pearl";
}

function rollGammaDopplerPhase() {
  const r = Math.random();
  if (r < 0.8) {
    const phases = ["Phase 1", "Phase 2", "Phase 3", "Phase 4"];
    return phases[Math.floor(Math.random() * phases.length)];
  }
  return "Emerald";
}
// -------------- /helpers --------------

export default function Inventory({ balance, setBalance, inventory, setInventory }) {
  const [selectedItem, setSelectedItem] = useState(null);

  const [showRoll, setShowRoll] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  const canOpen = balance >= 2.49;
  const isCase = selectedItem?.type === "Case";

  // ✅ Build DB once
  const ITEMS_DB = useMemo(() => ({ ...skins, ...knives, ...gloves }), []);

  const renderedItems = inventory.map((item) => (
    <div
      key={item.id}
      onClick={() => {
        if (showRoll || showConfirm) return;
        setSelectedItem(item);
      }}
    >
      <Items
        casename={item.casename ?? item.name}
        desc={item.desc}
        pic={item.pic}
        price={item.price}
        type={item.type}
      />
    </div>
  ));

  function handleSell() {
    if (!selectedItem) return;
    if (showRoll || showConfirm) return;

    const price = Number(selectedItem.price) || 0;
    setBalance((prev) => round2(prev + price));

    setInventory((prev) => prev.filter((x) => x.id !== selectedItem.id));
    setSelectedItem(null);
  }

  return (
    <>
      <NavBar balance={balance} setBalance={setBalance} />

      <h2 className="page-name">
        <GiBackpack /> INVENTORY
      </h2>

      <div className="inv-display">
        <div className="inv">
          <div className="inv-content">
            {inventory.length === 0 ? <p>No items yet.</p> : renderedItems}
          </div>
        </div>

        <div className="inv-displayed-item">
          {selectedItem ? (
            <>
              <img className="selectedItem-pic" src={selectedItem.pic} alt="" />
              <h3>{selectedItem.casename ?? selectedItem.name}</h3>

              <p>
                ${Number(selectedItem.price ?? 0).toFixed(2)}
                {selectedItem.float ? (
                  <span style={{ opacity: 0.7 }}> ({selectedItem.float})</span>
                ) : null}
                {selectedItem.phase ? (
                  <span style={{ opacity: 0.7 }}> • {selectedItem.phase}</span>
                ) : null}
              </p>

              <p id="secTitle">{selectedItem.desc}</p>

              <div className="displayed-item-buttons">
                <button
                  className={isCase ? "isCase" : "isNotCase"}
                  disabled={!isCase}
                  onClick={() => isCase && setShowConfirm(true)}
                >
                  Open
                </button>

                <button onClick={handleSell} className="sellBtn" disabled={showRoll || showConfirm}>
                  Sell
                </button>
              </div>
            </>
          ) : (
            <p>Select an item</p>
          )}
        </div>
      </div>

      {/* CONFIRM MODAL */}
      {showConfirm && selectedItem && (
        <div className="rollOverlay">
          <div className="confirmModal">
            <h3>Open Case</h3>

            <img
              src={selectedItem.pic}
              alt={selectedItem.casename ?? selectedItem.name}
              className="confirmCasePic"
            />

            <p>
              Are you sure you want to open
              <br />
              <b>{selectedItem.casename ?? selectedItem.name}</b>?
            </p>

            <div className="confirmActions">
              <button className="cancelBtn" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>

              <button
                className="openBtn"
                disabled={!canOpen}
                onClick={() => {
                  if (!canOpen) return;

                  // ✅ consume case + charge immediately
                  const caseId = selectedItem.id;
                  setInventory((prev) => prev.filter((x) => x.id !== caseId));
                  setBalance((prev) => round2(prev - 2.49));

                  setShowConfirm(false);
                  setIsRolling(false);
                  setShowRoll(true);
                }}
              >
                Open Case ($2.49)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROLL MODAL */}
      {showRoll && selectedItem && (
        <div className="rollOverlay">
          <div className="rollModal">
            <CaseRoll
              caseData={selectedItem}
              onStart={() => setIsRolling(true)}
              onFinish={(win) => {
                setIsRolling(false);

                const skinId = String(win.skinId ?? "").trim();
                const data = ITEMS_DB?.[skinId];

                // fallback if missing from DB
                if (!data) {
                  console.warn("❌ Missing item in DB for id:", skinId);
                  setInventory((prev) => [
                    ...prev,
                    {
                      id: safeUUID(),
                      skinId,
                      name: win.name,
                      desc: win.tier,
                      pic: win.pic,
                      price: 0,
                      float: null,
                      phase: null,
                      type: "Skin",
                      rarity: win.tier,
                    },
                  ]);
                  setShowRoll(false);
                  setSelectedItem(null);
                  return;
                }

                // ✅ normalize types from your JSON:
                // knives: "Knife"
                // gloves: "Glove" (your file)
                // skins: "Skin"/weapon/etc
                const itemType = String(data.type ?? "").trim();

                // ---------------- KNIFE WITH PHASES ----------------
                if (itemType === "Knife" && data.phases) {
                  const finish = data.finish ?? "Knife Finish";

                  let phase = null;
                  if (finish === "Doppler") phase = rollDopplerPhase();
                  else if (finish === "Gamma Doppler") phase = rollGammaDopplerPhase();
                  else phase = Object.keys(data.phases)[0];

                  const phaseObj = data.phases?.[phase] ?? {};
                  const floatKeys = Object.keys(phaseObj);
                  const floatCond = rollFloatFromKeys(floatKeys, "WW");
                  const price = Number(phaseObj?.[floatCond] ?? 0);

                  const pic = data.phasePics?.[phase] ?? data.pic;

                  setInventory((prev) => [
                    ...prev,
                    {
                      id: safeUUID(),
                      skinId,
                      name: data.name,
                      desc: `${finish} • ${phase}`,
                      pic,
                      price,
                      float: floatCond,
                      phase,
                      type: "Knife",
                      rarity: data.rarity ?? "Rare Special Item",
                    },
                  ]);

                  setShowRoll(false);
                  setSelectedItem(null);
                  return;
                }

                // ---------------- KNIFE WITHOUT PHASES ----------------
                if (itemType === "Knife" && data.floats) {
                  const keys = Object.keys(data.floats ?? {});
                  const floatCond = rollFloatFromKeys(keys, "WW");
                  const price = Number(data.floats?.[floatCond] ?? 0);

                  setInventory((prev) => [
                    ...prev,
                    {
                      id: safeUUID(),
                      skinId,
                      name: data.name,
                      desc: data.finish ?? data.collection ?? "Knife",
                      pic: data.pic,
                      price,
                      float: floatCond,
                      phase: null,
                      type: "Knife",
                      rarity: data.rarity ?? "Rare Special Item",
                    },
                  ]);

                  setShowRoll(false);
                  setSelectedItem(null);
                  return;
                }

                // ---------------- ✅ GLOVES (YOUR STRUCTURE) ----------------
                // Your gloves have: type:"Glove", finish:"Driver Gloves", floats:{FN...}
                if ((itemType === "Glove" || itemType === "Gloves") && data.floats) {
                  const keys = Object.keys(data.floats ?? {});
                  const floatCond = rollFloatFromKeys(keys, "FT");
                  const price = Number(data.floats?.[floatCond] ?? 0);

                  setInventory((prev) => [
                    ...prev,
                    {
                      id: safeUUID(),
                      skinId,
                      name: data.name,
                      desc: data.finish ?? data.collection ?? "Glove",
                      pic: data.pic,
                      price,
                      float: floatCond,
                      phase: null,
                      type: "Glove",
                      rarity: data.rarity ?? "Rare Special Item",
                    },
                  ]);

                  setShowRoll(false);
                  setSelectedItem(null);
                  return;
                }

                // ---------------- WEAPON/SKIN WITH FLOATS ----------------
                if (data.floats) {
                  const floatCond = rollWeaponFloat();
                  const price = Number(data.floats?.[floatCond] ?? 0);

                  setInventory((prev) => [
                    ...prev,
                    {
                      id: safeUUID(),
                      skinId,
                      name: data.name,
                      desc: data.collection ? `${data.collection}` : (data.rarity ?? win.tier),
                      pic: data.pic,
                      price,
                      float: floatCond,
                      phase: null,
                      type: data.type ?? "Skin",
                      rarity: data.rarity ?? win.tier,
                    },
                  ]);

                  setShowRoll(false);
                  setSelectedItem(null);
                  return;
                }

                // ---------------- ANYTHING ELSE ----------------
                setInventory((prev) => [
                  ...prev,
                  {
                    id: safeUUID(),
                    skinId,
                    name: data.name ?? win.name,
                    desc: data.collection ?? data.finish ?? win.tier,
                    pic: data.pic ?? win.pic,
                    price: Number(data.price ?? 0),
                    float: null,
                    phase: null,
                    type: data.type ?? "Skin",
                    rarity: data.rarity ?? win.tier,
                  },
                ]);

                setShowRoll(false);
                setSelectedItem(null);
              }}
            />

            {!isRolling && (
              <div className="closeRoll" onClick={() => setShowRoll(false)}>
                Close
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
