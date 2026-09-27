#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import dns from "node:dns/promises";

// Load sent emails for deduplication
const sent = JSON.parse(readFileSync("sent_emails.json", "utf8"));
const sentSet = new Set(sent.map(s => (s.email || "").toLowerCase().trim()));

// Load existing scratch expansion
let scratch = [];
try {
  scratch = JSON.parse(readFileSync("scratch_passed_expansion.json", "utf8"));
} catch {}
const scratchSet = new Set(scratch.map(c => c[1].toLowerCase().trim()));

const newBatch4 = [
  // --- Historic European Bakeries, Confectioners & Patisseries ---
  ["Gail's Artisan Bakery London", "bread@gailsbread.co.uk", "UK", "London", "Tom Molnar (Co-Founder & CEO)", "Acclaimed London craft bakery baking pecan cinnamon buns, sourdough walnut loaves, and almond croissants; needs corporate catering portal."],
  ["Ole & Steen Danish Bakery UK", "care@oleandsteen.co.uk", "UK", "London", "Ole Kristoffersen (Co-Founder)", "All-day Danish bakery celebrated for cinnamon social slices, marzipan pastries, and dark rye seed breads; needs interactive pre-order app."],
  ["Paul UK French Artisan Bakeries", "contact@paul-uk.com", "UK", "London", "Mark Hilton (CEO)", "Traditional French family bakery baking walnut baguettes, almond tartlets, and macarons; needs celebratory gift box builder."],
  ["Cutter & Squidge Bakery London", "hello@cutterandsquidge.com", "UK", "London", "Annabel & Emily Lui (Founders)", "All-natural London bakery inventing biskies, hazelnut dream cakes, and gourmet afternoon tea hampers; needs interactive hamper tool."],
  ["Konditor Cake Makers London", "support@konditor.co.uk", "UK", "London", "Gerhard Jenne (Founder)", "Pioneering London cake bakery crafting legendary curly whirly cakes and pecan brownies; needs nationwide cake shipping shop."],
  ["The Hummingbird Bakery London", "orders@hummingbirdbakery.com", "UK", "London", "Tarek Malouf (Founder)", "American-style bakery famous for red velvet cupcakes, pecan pies, and celebration cakes; needs interactive custom celebration cake portal."],
  ["Crosstown Sourdough Doughnuts", "orders@crosstown.co.uk", "UK", "London", "Adam Wills & JP Then (Co-Founders)", "Pioneering scratch-made sourdough doughnuts filled with pistachio custard and dark chocolate almond ganache; needs corporate gifting shop."],
  ["Bread Ahead Bakery Borough Market", "admin@breadahead.com", "UK", "London", "Matthew Jones (Founder)", "Borough Market artisan bakery and baking school renowned for vanilla bean glazed almond doughnuts; needs digital course & bread shop."],
  ["Poilâne Sourdough Bakery Paris", "contact@poilane.com", "France", "Paris", "Apollonia Poilâne (CEO)", "World-renowned Paris wood-fired sourdough bakery baking walnut bread and punitions butter biscuits; needs international express shop."],
  ["Ladurée Paris Maison de Macarons", "contact@laduree.com", "France", "Paris", "Mélanie Carron (CEO)", "Historic luxury French tearoom crafting salted caramel macarons, pistachio dragees, and confection boxes; needs bespoke luxury gift boutique."],
  ["Angelina Paris Tearoom & Pastry", "contact@angelina-paris.fr", "France", "Paris", "Angelina Management (Directors)", "Legendary Belle Époque Parisian salon famous for African hot chocolate and Mont-Blanc chestnut vermicelli; needs luxury salon shop."],
  ["Pierre Hermé Paris Haute Pâtisserie", "contact@pierreherme.com", "France", "Paris", "Pierre Hermé (Pastry Chef)", "The Picasso of Pastry handcrafting Ispahan macarons with rose, raspberry & lychee, and hazelnut praline chocolates; needs VIP luxury salon."],
  ["Dalloyau Paris Gastronomie 1682", "contact@dalloyau.fr", "France", "Paris", "Dalloyau Team (Directors)", "Historic caterer to the Palace of Versailles and inventor of the Opera cake with almond sponge; needs royal celebration portal."],
  ["Fauchon Paris Luxury Gastronomy", "service-client@fauchon.com", "France", "Paris", "Jérôme Tacnet (CEO)", "Iconic Place de la Madeleine gourmet house curating candied marrons, roasted nut confitures, and fine teas; needs luxury gift crate tool."],
  ["Pasticceria Marchesi 1824 Milan", "info@pasticceriamarchesi.com", "Italy", "Milan", "Marchesi Team (Directors)", "One of Milan's oldest and most refined pastry shops crafting candied chestnut marrons, Panettone, and almond pralines; needs luxury salon boutique."],
  ["Pasticceria Cova Montenapoleone", "info@pasticceriacova.com", "Italy", "Milan", "Paola Faccioli (CEO)", "Historic 1817 Milanese institution famous for handcrafted Panettone studded with raisins and candied orange; needs holiday gift box portal."],
  ["Sant Ambroeus Milano & New York", "info@santambroeus.com", "Italy", "Milan", "Alireza Niroomand (Director)", "Celebrated Milanese pasticceria curating Gianduja chocolates, roasted marcona almonds, and Italian panettone; needs luxury boutique."],
  ["Gran Caffè Gambrinus Naples", "info@grancaffegambrinus.com", "Italy", "Naples", "Massimiliano Rosati (Owner)", "Historic literary café in Naples crafting Sfogliatella riccia, Neapolitan babà, and roasted hazelnut pastries; needs online souvenir shop."],
  ["Demel K. u. K. Hofzuckerbäckerei", "wien@demel.com", "Austria", "Vienna", "Demel Management (Directors)", "Former Imperial and Royal Court Confectionery bakery in Vienna famous for candied violets and walnut Dobostorte; needs luxury imperial gift shop."],
  ["Café Sacher Vienna Original", "hotel@sacher.com", "Austria", "Vienna", "Elisabeth Gürtler (Managing Director)", "Home of the world-famous Original Sacher-Torte layered with apricot jam and dark chocolate icing; needs international express delivery portal."],
  ["Café Central Vienna Historic", "cafecentral@palaisevents.at", "Austria", "Vienna", "Palais Events Management (Directors)", "Historic grand Viennese café where intellectuals met, crafting apfelstrudel with raisins and hazelnut tortes; needs celebration order portal."],
  ["Gerstner K. u. K. Hofzuckerbäcker", "info@gerstner.at", "Austria", "Vienna", "Gerstner Team (Directors)", "Over 170 years of imperial Viennese confectionery creating punch cakes, marzipan fruits, and chocolate truffles; needs digital palace boutique."],
  ["Café Landtmann Ringstraße Vienna", "cafe@landtmann.at", "Austria", "Vienna", "Querfeld Family (Owners)", "Iconic Ringstraße coffeehouse since 1873 serving Mozart torte with pistachios, almond Gugelhupf, and Melange; needs online cake delivery shop."],
  ["Konditorei Oberlaa Kurkonditorei", "zentrale@oberlaa-wien.at", "Austria", "Vienna", "Oberlaa Management (Directors)", "Vienna's premier confectionery producing handmade almond macarons, marzipan figurines, and chocolate pralines; needs interactive gift tin builder."],
  ["Aida Viennese Café & Pastry", "kundenservice@aida.at", "Austria", "Vienna", "Dominik Prousek (Managing Director)", "Classic pink Viennese retro pastry chain baking Kremsschnitte, walnut crescent rolls, and hazelnut cakes; needs online pastry ordering."],
  ["Bäckerei Heberer Tradition 1891", "info@baecker-heberer.de", "Germany", "Mühlheim am Main", "Georg Heberer (Managing Director)", "Fifth-generation family bakery crafting traditional whole seed sourdough loaves and almond stollen; needs modern retail web portal."],
  ["Junge Die Bäckerei Hanseatic", "info@jb.de", "Germany", "Lübeck", "Tobias Schulz (Managing Director)", "Hanseatic bakery since 1897 baking marzipan croissants, Franzbrötchen with cinnamon sugar, and walnut breads; needs digital bakery shop."],
  ["Kamps Bäckerei Handwerk NRW", "info@kamps.de", "Germany", "Schwalmtal", "Thomas Schulz (CEO)", "One of Germany's leading craft bakeries baking freshly prepared seed rolls, apple turnovers, and nut twists; needs modern mobile app."]
];

console.log(`Evaluating newBatch4: ${newBatch4.length} candidates...`);

const candidatesToTest = [];
for (const c of newBatch4) {
  const email = c[1].toLowerCase().trim();
  if (sentSet.has(email) || scratchSet.has(email)) continue;
  candidatesToTest.push(c);
}

console.log(`Candidates to test DNS MX: ${candidatesToTest.length}`);

const uniqueDomains = [...new Set(candidatesToTest.map(c => c[1].split("@")[1]))];
const validDomains = new Set();
const concurrency = 25;

for (let i = 0; i < uniqueDomains.length; i += concurrency) {
  const chunk = uniqueDomains.slice(i, i + concurrency);
  await Promise.all(chunk.map(async (domain) => {
    try {
      const records = await Promise.race([
        dns.resolveMx(domain),
        new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 2500))
      ]);
      if (Array.isArray(records) && records.some(r => r.exchange && r.exchange !== "." && !r.exchange.endsWith(".invalid"))) {
        validDomains.add(domain);
      }
    } catch {}
  }));
}

const passed4 = candidatesToTest.filter(c => validDomains.has(c[1].split("@")[1]));
console.log(`Passed MX in batch 4: ${passed4.length}`);

// Combine with scratch
const combined = [...scratch, ...passed4];
console.log(`Total accumulated verified in scratch: ${combined.length}`);
writeFileSync("scratch_passed_expansion.json", JSON.stringify(combined, null, 2), "utf8");
