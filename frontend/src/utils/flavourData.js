export const flavourMeta = {
  "Cucumber Salad Single":  { level: 40, sweet: 20, sour: 65, note: "Savory & bright" },
  "Pineappu Beach Single":  { level: 55, sweet: 75, sour: 60, note: "Sweet & sour" },
  "Smoky Chile & Honey":    { level: 72, sweet: 60, sour: 52, note: "Smoky, spicy, honeyed" },
  "Carrot Cake":            { level: 58, sweet: 72, sour: 48, note: "Creamy, spiced, dessert-like" },
  "Tomato Cobbler":         { level: 38, sweet: 50, sour: 68, note: "Savory, fresh, bright" },
  "Kicu In The Sidecar":    { level: 55, sweet: 56, sour: 58, note: "Floral, citrus, rounded" },
  "Shiozakura Collins":     { level: 50, sweet: 46, sour: 64, note: "Refreshing, saline, sparkling" },
  "Shima Fizzy Kit":        { level: 45, sweet: 35, sour: 55, note: "Sparkling & saline" },
  "Mojito Starter Kit":     { level: 35, sweet: 60, sour: 55, note: "Fresh, minty, bright" },
  "Classic Margarita Kit":  { level: 55, sweet: 30, sour: 72, note: "Sharp, citrus, salt-rimmed" },
};

export function hasFlavour(category) {
  return category === "Cocktails" || category === "Kits";
}

export function getProductSizeLabel(category) {
  if (category === "Glassware")  return "Signature set";
  if (category === "Bar Tools")  return "Professional grade";
  if (category === "Kits")       return "Cocktail kit";
  return "100ml flask";
}
