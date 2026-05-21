import { Link } from "react-router-dom";
import "../App.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const SPIRITS = [
  {
    name: "Gin",
    origin: "England / Netherlands",
    profile: "Juniper-forward, botanical, citrus, herbal",
    classics: "Martini, Negroni, Tom Collins",
    note: "Gin's complexity comes from its botanical bill — each distillery's recipe is a closely guarded secret.",
  },
  {
    name: "Whisky",
    origin: "Scotland / Japan / USA",
    profile: "Oak, vanilla, smoke, caramel, dried fruit",
    classics: "Old Fashioned, Whisky Sour, Rob Roy",
    note: "Aged in oak barrels, whisky develops colour and depth over years. Peat smoke is a defining character of Islay Scotch.",
  },
  {
    name: "Mezcal",
    origin: "Oaxaca, Mexico",
    profile: "Smoky, earthy, tropical, mineral",
    classics: "Naked & Famous, Oaxacan Old Fashioned",
    note: "Unlike tequila, mezcal can be made from over 30 varieties of agave. The roasted piña process gives it its signature smokiness.",
  },
  {
    name: "Rum",
    origin: "Caribbean / Latin America",
    profile: "Molasses, tropical fruit, vanilla, spice",
    classics: "Mojito, Daiquiri, Mai Tai",
    note: "Rum ranges from unaged agricole to decades-old solera blends. The terroir of the sugarcane shapes its character profoundly.",
  },
  {
    name: "Sake",
    origin: "Japan",
    profile: "Rice, umami, floral, melon, saline",
    classics: "Sakura Martini, Sake Sour",
    note: "Brewed rather than distilled, sake's flavour is shaped by rice polishing ratio (SMV), yeast strain, and water source.",
  },
  {
    name: "Tequila",
    origin: "Jalisco, Mexico",
    profile: "Agave, citrus, pepper, earth, green herb",
    classics: "Margarita, Paloma, Tequila Sunrise",
    note: "Blanco is unaged and expressive; reposado brings oak softness; añejo is complex and sipping-worthy.",
  },
];

const TECHNIQUES = [
  {
    title: "Shake",
    when: "Cocktails with citrus, egg white, cream, or dairy",
    result: "Chilled, diluted, aerated, slightly cloudy",
    tip: "Shake hard for 10–15 seconds. The ice fractures and aerates the drink. Use a dry shake first for egg white cocktails.",
  },
  {
    title: "Stir",
    when: "Spirit-forward cocktails — Martini, Negroni, Manhattan",
    result: "Silky, clear, perfectly diluted",
    tip: "Stir for 30–45 seconds over ice. The goal is dilution without aeration — stirring preserves the drink's clarity and texture.",
  },
  {
    title: "Build",
    when: "Simple highballs, spritzes, and long drinks",
    result: "Layered or lightly mixed",
    tip: "Pour spirits first, then mixer. Add ice last for highballs to preserve carbonation. No extra dilution needed.",
  },
  {
    title: "Throw",
    when: "Sherry cobblers, Red Snapper, vintage pours",
    result: "Aerated, textured, lightly frothy",
    tip: "Pour the cocktail back and forth between tins from height. An advanced technique that aerates without the ice-fracturing of shaking.",
  },
];

const FLAVOUR_PAIRS = [
  { base: "Citrus", pairs: ["Ginger", "Honey", "Salt", "Elderflower", "Mint"], avoid: "Cream" },
  { base: "Smoke", pairs: ["Chocolate", "Honey", "Chilli", "Stone fruit", "Miso"], avoid: "Delicate florals" },
  { base: "Floral", pairs: ["Citrus", "Cucumber", "Light spirits", "Lychee"], avoid: "Heavy smoke or spice" },
  { base: "Savory / Umami", pairs: ["Olive brine", "Dashi", "Tomato", "Dry vermouth"], avoid: "High sweetness" },
  { base: "Tropical", pairs: ["Coconut", "Lime", "Rum", "Ginger", "Passionfruit"], avoid: "Bitter botanicals" },
];

const Laboratory = () => {
  return (
    <div className="alchemy-page">
      <Navbar />

      {/* ── Hero ── */}
      <div className="lab-hero">
        <p className="eyebrow">The Laboratory</p>
        <h1 className="lab-hero-title">A field guide to flavour, spirit, and craft.</h1>
        <p className="lab-hero-sub">
          Behind every formulation is a set of principles — understanding spirits, technique,
          and flavour architecture turns a good drink into a precise one.
        </p>
      </div>

      {/* ── Spirits Guide ── */}
      <section className="lab-section">
        <div className="lab-section-head">
          <p className="eyebrow">Spirits Guide</p>
          <h2>Know your base.</h2>
          <p className="lab-section-sub">
            Every cocktail starts with a spirit. These are the six we reach for most.
          </p>
        </div>

        <div className="spirits-grid">
          {SPIRITS.map((s) => (
            <div className="spirit-card" key={s.name}>
              <div className="spirit-card-top">
                <h3 className="spirit-name">{s.name}</h3>
                <span className="spirit-origin">{s.origin}</span>
              </div>
              <p className="spirit-profile">{s.profile}</p>
              <div className="spirit-divider" />
              <p className="spirit-classics">
                <span className="spirit-field-label">Classics</span> {s.classics}
              </p>
              <p className="spirit-note">{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Technique ── */}
      <section className="lab-section">
        <div className="lab-section-head">
          <p className="eyebrow">Technique</p>
          <h2>How you mix matters.</h2>
          <p className="lab-section-sub">
            The mixing method changes temperature, texture, dilution, and appearance.
            Choose the right technique before you reach for ice.
          </p>
        </div>

        <div className="technique-grid">
          {TECHNIQUES.map((t) => (
            <div className="technique-card" key={t.title}>
              <h3 className="technique-title">{t.title}</h3>
              <div className="technique-row">
                <span className="technique-label">When</span>
                <span className="technique-value">{t.when}</span>
              </div>
              <div className="technique-row">
                <span className="technique-label">Result</span>
                <span className="technique-value">{t.result}</span>
              </div>
              <p className="technique-tip">{t.tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Flavour Pairing ── */}
      <section className="lab-section">
        <div className="lab-section-head">
          <p className="eyebrow">Flavour Architecture</p>
          <h2>What works together.</h2>
          <p className="lab-section-sub">
            Flavour pairing in cocktails follows the same logic as food — contrast,
            complement, and the occasional surprise.
          </p>
        </div>

        <div className="pairing-table">
          <div className="pairing-table-head">
            <span>Base note</span>
            <span>Pairs well with</span>
            <span>Avoid</span>
          </div>
          {FLAVOUR_PAIRS.map((row) => (
            <div className="pairing-row" key={row.base}>
              <span className="pairing-base">{row.base}</span>
              <span className="pairing-pairs">{row.pairs.join(" · ")}</span>
              <span className="pairing-avoid">{row.avoid}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lab-cta-section">
        <p className="eyebrow">Ready to experiment?</p>
        <h2>Build your formula.</h2>
        <p>Browse the collection and put these principles into practice.</p>
        <Link to="/products" className="checkout-button lab-cta-btn">
          Shop the collection
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default Laboratory;
