import React, { useEffect, useMemo, useState } from "react";
import "../css/CaseRoll.css";

import SKINS_DB from "../data/Skins.json";
import KNIVES_DB from "../data/Knives.json";
import GLOVES_DB from "../data/Gloves.json";

const ITEMS_DB = {
  ...SKINS_DB,
  ...KNIVES_DB,
  ...GLOVES_DB,
};

// ---------------- CONFIG ----------------

const DROP_CHANCES = {
  "Mil-spec": 0.79,
  "Restricted": 0.16,
  "Classified": 0.032,
  "Covert": 0.006,
};

const KNIFE_CHANCE = 0.002;

// ---------------- HELPERS ----------------

function weightedPickKey(weightMap) {
  const entries = Object.entries(weightMap).filter(([, w]) => w > 0);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [k, w] of entries) {
    r -= w;
    if (r <= 0) return k;
  }
  return entries[entries.length - 1][0];
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
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

// ✅ PHASE-AWARE TILE BUILDER
function makeTile(id, tier) {
  const data = ITEMS_DB[id];
  if (!data) {
    return { skinId: id, tier, name: id, pic: "" };
  }

  let pic = data.pic;
  let phase = null;

  if (data.type === "Knife" && data.phasePics && data.finish) {
    if (data.finish === "Doppler") phase = rollDopplerPhase();
    else if (data.finish === "Gamma Doppler") phase = rollGammaDopplerPhase();

    if (phase && data.phasePics?.[phase]) {
      pic = data.phasePics[phase];
    }
  }

  return {
    skinId: id,
    tier,
    name: data.name,
    pic,
    phase,
  };
}

// ---------------- COMPONENT ----------------

export default function CaseRoll({ caseData, onFinish, onStart }) {
  const VIEWPORT_WIDTH = 560;
  const ITEM_WIDTH = 120;
  const GAP = 12;
  const PADDING_LEFT = 16;

  const TOTAL = 60;
  const STOP_INDEX = 45;
  const DURATION = 5.2;

  const [tape, setTape] = useState([]);
  const [offset, setOffset] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [animate, setAnimate] = useState(false);

  const availableTiers = useMemo(() => {
    if (!caseData?.pools) return [];
    return Object.keys(caseData.pools).filter(
      (tier) =>
        tier !== "Rare Special Item" &&
        Array.isArray(caseData.pools[tier]) &&
        caseData.pools[tier].length > 0
    );
  }, [caseData]);

  const chances = useMemo(() => {
    const obj = {};
    for (const tier of availableTiers) {
      obj[tier] = DROP_CHANCES[tier] ?? 0.01;
    }
    return obj;
  }, [availableTiers]);

  const pickFiller = () => {
    const tier = weightedPickKey(chances);
    const id = randomFrom(caseData.pools[tier]);
    return makeTile(id, tier);
  };

  useEffect(() => {
    if (!caseData?.pools || availableTiers.length === 0) return;

    const canKnife =
      Array.isArray(caseData.pools["Rare Special Item"]) &&
      caseData.pools["Rare Special Item"].length > 0;

    const isKnifeWin = canKnife && Math.random() < KNIFE_CHANCE;

    const winningTile = isKnifeWin
      ? makeTile(randomFrom(caseData.pools["Rare Special Item"]), "Rare Special Item")
      : pickFiller();

    const newTape = Array.from({ length: TOTAL }, pickFiller);
    newTape[STOP_INDEX] = winningTile;

    setTape(newTape);

    const centerX = VIEWPORT_WIDTH / 2;
    const tileFull = ITEM_WIDTH + GAP;
    const tileCenterX =
      PADDING_LEFT + STOP_INDEX * tileFull + ITEM_WIDTH / 2;

    setOffset(Math.round(-(tileCenterX - centerX)));

    setSpinning(false);
    setAnimate(false);

    requestAnimationFrame(() => {
      setSpinning(true);
      onStart?.();
      requestAnimationFrame(() => setAnimate(true));
    });

    const timer = setTimeout(() => {
      setSpinning(false);
      onFinish?.(winningTile);
    }, DURATION * 1000 + 120);

    return () => clearTimeout(timer);
  }, [caseData?.id]);

  return (
    <div className="caseRoll" style={{ width: VIEWPORT_WIDTH }}>
      <div className="marker" />
      <div className="viewport">
        <div
          className={`tape ${spinning ? "spinning" : ""}`}
          style={{
            transform: `translateX(${animate ? offset : 0}px)`,
            transitionDuration: `${DURATION}s`,
          }}
        >
          {tape.map((it, idx) => (
            <div className={`tile tier-${tierClass(it.tier)}`} key={idx}>
              <img src={it.pic} alt={it.name} />
              <div className="name">{it.name}</div>
              <div className="tier">{it.tier}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function tierClass(tier) {
  switch (tier) {
    case "Mil-spec":
      return "milspec";
    case "Restricted":
      return "restricted";
    case "Classified":
      return "classified";
    case "Covert":
      return "covert";
    case "Rare Special Item":
      return "rare";
    default:
      return "other";
  }
}
