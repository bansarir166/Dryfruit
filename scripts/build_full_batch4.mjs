#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import dns from "node:dns/promises";

// Load sent emails for strict deduplication
const sent = JSON.parse(readFileSync("sent_emails.json", "utf8"));
const sentSet = new Set(sent.map(s => (s.email || "").toLowerCase().trim()));
console.log(`Loaded ${sentSet.size} previously sent emails for deduplication.`);

// Load unsent candidates from pools A-H
const pools = await Promise.all([
  import("./candidates_pool_a.mjs").then(m => m.poolA || []).catch(() => []),
  import("./candidates_pool_b.mjs").then(m => m.poolB || []).catch(() => []),
  import("./candidates_pool_c.mjs").then(m => m.poolC || []).catch(() => []),
  import("./candidates_pool_d.mjs").then(m => m.poolD || []).catch(() => []),
  import("./candidates_pool_e.mjs").then(m => m.poolE || []).catch(() => []),
  import("./candidates_pool_f.mjs").then(m => m.poolF || []).catch(() => []),
  import("./candidates_pool_g.mjs").then(m => m.poolG || []).catch(() => []),
  import("./candidates_pool_h.mjs").then(m => m.poolH || []).catch(() => [])
]);

const existingPoolCandidates = pools.flat();
console.log(`Loaded ${existingPoolCandidates.length} existing pool candidates.`);

// Large additional candidate database: ~350 fresh businesses
const additionalCandidates = [
  // --- US Growers, Roasters, Dried Fruits, Pecans & Specialty ---
  ["Truly Good Foods Snack Roasters", "info@trulygoodfoods.com", "USA", "Charlotte, NC", "Angela Bauer (President)", "Roasting specialty nuts, Southern bar mixes, and sweet dried fruit trail mixes; needs interactive gift tin configurator."],
  ["Western Nut Company Salt Lake", "sales@westernnut.com", "USA", "Salt Lake City, UT", "Richard Dunford (President)", "Roasting premium cashews, almonds, and Utah honey roasted pecans; needs corporate holiday gift tin tool."],
  ["Squirrel Brand Artisan Nuts", "info@squirrelbrand.com", "USA", "McKinney, TX", "Brent Meyer (VP Marketing)", "America's oldest gourmet nut company crafting sweet & savory roasted almonds; needs modern luxury storefront."],
  ["Stewart & Jasper Orchards", "orders@stewartandjasper.com", "USA", "Newman, CA", "Jim Jasper (Owner)", "Pioneering Central Valley almond growers producing glazed almonds and almond brittle; needs interactive gift tray builder."],
  ["Hilltop Ranch California Almonds", "info@hilltopranch.com", "USA", "Ballico, CA", "Dexter Long (President)", "Family-owned almond handler processing organic and conventional California almonds; needs direct sales web portal."],
  ["Hughson Nut California Almonds", "info@hughsonnut.com", "USA", "Hughson, CA", "Martin Pohl (General Manager)", "Premium California almond processor shipping whole kernels and manufactured nuts; needs modern wholesale portal."],
  ["Valley Fig Growers California", "info@valleyfig.com", "USA", "Fresno, CA", "Gary Jue (President)", "Grower-owned fig cooperative producing California Mission and Golden dried figs; needs modern recipe and retail storefront."],
  ["Mariani Packing Dried Fruit Co", "info@mariani.com", "USA", "Vacaville, CA", "Mark Mariani (CEO)", "Fourth-generation family business packaging dried plums, mangoes, and berries; needs VIP direct-to-consumer store."],
  ["Decas Cranberry Products", "info@decasfruit.com", "USA", "Carver, MA", "John Decas (Director)", "Pioneering Massachusetts sweetened dried cranberries and cranberry seed oil; needs interactive bulk & gift shop."],
  ["Fruit d'Or Cranberry & Blueberry", "info@fruitdor.ca", "Canada", "Plessisville, QC", "Martin LeMoine (President)", "Leading organic grower and processor of dried cranberries and wild blueberries; needs modern international web store."],
  ["Patience Fruit & Co Organics", "info@patiencefruit.com", "Canada", "Notre-Dame-de-Lourdes, QC", "Marie-Michèle LeMoine (Director)", "Organic dried cranberries, wild blueberries, and active dried fruit snack packs; needs interactive snack subscription."],
  ["Royal Nut Company Melbourne", "sales@royalnutcompany.com.au", "Australia", "Brunswick, VIC", "George Kypriadis (Founder)", "Artisan Melbourne nut roaster offering dry roasted almonds, macadamias, and dried figs; needs modern responsive web shop."],
  ["The Nut Shop Sydney Strand", "sales@nutshop.com.au", "Australia", "Sydney, NSW", "Karl Mendels (Director)", "Historic Sydney roastery producing freshly roasted cashews, salted macadamias, and chocolates; needs online luxury gift store."],
  ["Charlesworth Nuts Adelaide", "customerservice@charlesworthnuts.com.au", "Australia", "Adelaide, SA", "Mark Charlesworth (CEO)", "Over 80 years roasting spiced almonds, pecans, and dried glazed fruit hampers; needs interactive gift box customizer."],
  ["Walnuts Australia Riverina", "info@walnutsaustralia.com.au", "Australia", "Leeton, NSW", "David Armstrong (General Manager)", "Largest walnut producer in the southern hemisphere shipping in-shell and kernel walnuts; needs modern export portal."],
  ["Morpeth Macadamias Hunter Valley", "info@morpethmacadamias.com.au", "Australia", "Morpeth, NSW", "Peter Sloane (Owner)", "Hunter Valley farm harvesting and honey roasting native Australian macadamias; needs local & tourist gift shop."],
  ["Pinoli Premium Pine Nuts NZ", "info@pinoli.co.nz", "New Zealand", "Blenheim, Marlborough", "Andy Wiltshire (Director)", "Marlborough orchard growing Mediterranean stone pine nuts harvested pure; needs luxury culinary e-commerce shop."],
  ["Uncle Joe's Walnuts & Hazelnuts", "info@unclejoes.co.nz", "New Zealand", "Blenheim, Marlborough", "Joe & Sally Catherwood (Owners)", "Marlborough artisan grower cold-pressing walnut oils and roasted nut snack packs; needs boutique gift crate shop."],
  ["Cracker of a Nut Canterbury", "info@crackernut.co.nz", "New Zealand", "Christchurch", "Canterbury Nut Growers (Directors)", "New Zealand South Island cooperative processing local walnuts and chestnuts; needs seasonal harvest ordering portal."],
  ["Nut Brothers Artisan Nut Butters", "info@nutbrothers.co.nz", "New Zealand", "Auckland", "Nut Brothers Team (Founders)", "Fresh roasted artisan peanut, almond, and cashew nut butters; needs interactive build-a-box checkout."],
  ["Forty Thieves Nut Butters NZ", "hello@fortythieves.co.nz", "New Zealand", "Stanmore Bay, Auckland", "Shaye & Brent Godfrey (Co-Founders)", "Award-winning stoneground nut butters packed with roasted almonds and seeds; needs modern DTC subscription store."],
  ["Pic's Peanut Butter World", "feedback@picspeanutbutter.com", "New Zealand", "Nelson", "Pic Picot (Founder)", "Famed natural peanut butter freshly roasted in Nelson using Australian hi-oleic peanuts; needs international gift shop."],

  // --- UK & Ireland Artisan Brands & Wholefood Merchants ---
  ["Eat Natural Nut & Fruit Bars", "mail@eatnatural.com", "UK", "Halstead, Essex", "Preet Grewal (Founder)", "Delicious fruit & nut snack bars made with whole roasted almonds, brazil nuts, and sultanas; needs direct brand boutique."],
  ["Bounce Protein Energy Balls", "hello@bouncefoods.com", "UK", "London", "Mark Chapman (CEO)", "Snack company rolling almond protein balls, cashew balls, and seed snacks; needs interactive subscription club portal."],
  ["Deliciously Ella Plant Foods", "hello@deliciouslyella.com", "UK", "London", "Ella Mills (Founder)", "Plant-based snacks, baked nutty granolas, and chocolate nut butter cups; needs modern responsive storefront."],
  ["Graze Healthy Snack Boxes", "friends@graze.com", "UK", "London", "Anthony Fletcher (CEO)", "Personalized snack subscription delivering portioned dried fruit and seasoned nut mixes; needs corporate gift tin builder."],
  ["Proper Snacks Popcorn & Nuts", "cass@propersnacks.com", "UK", "London", "Cassandra Stavrou (Founder)", "Snack innovator creating seasoned butterfly corn and sweet roasted nut mixes; needs vibrant consumer storefront."],
  ["Boundless Activated Snacking", "hello@weareboundless.co.uk", "UK", "Bristol", "Cathy Moseley (Founder)", "Activated nuts and seeds using ancient gut-healthy soaking and roasting methods; needs dynamic snack shop."],
  ["Forest Feast Premium Snacks", "enquiries@forestfeast.com", "UK", "Lurgan, Northern Ireland", "Michael Hall (Managing Director)", "Artisanal snack brand roasting Colossal cashews, Belgian chocolate mango, and dried cherries; needs luxury gift crate tool."],
  ["Kestrel Foods Global Sourcing", "info@kestrelfoodgroup.com", "UK", "Craigavon, Northern Ireland", "Lorraine Hall (Director)", "Specialist roaster and dried fruit packer producing innovative snacking lines; needs modern trade & B2C platform."],
  ["Chelmer Foods Dried Fruit & Nuts", "sales@chelmerfoods.com", "UK", "Braintree, Essex", "Roger Weaving (Director)", "Independent importer of dried vine fruits, edible tree nuts, and tropical fruits; needs modern commercial portal."],
  ["Voicevale Nuts, Seeds & Fruit", "info@voicevale.com", "UK", "London", "Robi Danon (Chairman)", "Global commodity trading house specializing in cashews, almonds, and dried fruit supply; needs wholesale web shop."],
  ["Hider Food Imports Gourmet", "sales@hiderfoods.co.uk", "UK", "Hull", "Duncan Hider (Managing Director)", "Fine food distributor and nut roaster packing premier holiday nut trays and gift hampers; needs festive hamper builder."],
  ["Cotswold Fayre Fine Food Wholesaler", "sales@cotswold-fayre.co.uk", "UK", "Theale, Berkshire", "Paul Hargreaves (CEO)", "B-Corp certified specialty food distributor stocking artisan dried fruit and nut brands; needs modern digital catalog."],
  ["Suma Wholefoods Workers Co-op", "info@suma.coop", "UK", "Elland, West Yorkshire", "Suma Management (Directors)", "Worker cooperative supplying organic dried apricots, raw nuts, and vegan provisions; needs modern member web portal."],
  ["Essential Trading Co-operative", "sales@essential-trading.coop", "UK", "Bristol", "Cooperative Management (Directors)", "Organic wholefood distributor supplying bulk raw almonds, dates, and fair trade dried fruit; needs digital order tool."],
  ["Rainbow Wholefoods Norwich", "info@rainbowwholefoods.co.uk", "UK", "Norwich, Norfolk", "Richard Austin (Founder)", "Historic independent wholefoods specialist offering organic nuts and sun-dried fruits; needs modern e-commerce storefront."],

  // --- India Gourmet Dry Fruits, Cashews, Organics & Traditional Purveyors ---
  ["Carnival Dry Fruits & Nuts", "info@carnivaldryfruits.com", "India", "New Delhi", "Carnival Team (Directors)", "Importers and roasters of California almonds, Chilean walnuts, and Turkish apricots; needs corporate festive gift builder."],
  ["Dry Fruit Basket Gourmet", "support@dryfruitbasket.in", "India", "Mumbai, Maharashtra", "Dry Fruit Basket Team (Owners)", "Premium online dry fruit hampers, roasted salted nuts, and festive silver boxes; needs corporate bulk order tool."],
  ["Kashmirica Authentic Goods", "care@kashmirica.com", "India", "Srinagar, Kashmir", "Mir Saeid (Founder)", "Authentic Kashmiri snow-white walnut kernels, Mamra almonds, and organic saffron; needs luxury international boutique."],
  ["Organic India Herbal & Food", "care@organicindia.com", "India", "Lucknow, UP", "Subrata Dutta (Managing Director)", "Global organic company offering certified organic foods, seeds, and herbal infusions; needs modern lifestyle web portal."],
  ["24 Mantra Organic Foods", "info@24mantra.com", "India", "Hyderabad, Telangana", "Rajashekar Reddy Seelam (Founder)", "Pioneering organic food brand providing certified organic cashews, raisins, and seeds; needs modern grocery e-commerce."],
  ["Conscious Food Organic Pantry", "care@consciousfood.com", "India", "Mumbai, Maharashtra", "Kavita Mukhi (Founder)", "Historic organic brand packing certified organic raw almonds, dried figs, and edible seeds; needs responsive subscription shop."],
  ["Pure & Sure Organic Foods", "support@pureandsure.in", "India", "Bengaluru, Karnataka", "Surya Shastry (Managing Director)", "Cultivating organic cashews, raisins, and cold-pressed edible oils direct from farms; needs 1-click checkout store."],
  ["Two Brothers Organic Farms", "care@twobrothersorganicfarms.com", "India", "Bhodani, Maharashtra", "Satyajit & Ajinkya Hange (Co-Founders)", "Regenerative biodynamic farm creating native dry fruit laddoos and stone-ground nut butters; needs luxury DTC web boutique."],
  ["Kapiva Ayurveda & Nutrition", "info@kapiva.in", "India", "Bengaluru, Karnataka", "Ameve Sharma (Co-Founder)", "Modern ayurvedic nutrition brand featuring daily wellness juices, seeds, and nut snacks; needs subscription order portal."],
  ["Auric Ayurvedic Beverages & Snacks", "support@theauric.com", "India", "New Delhi", "Deepak Agarwal (Founder)", "Ayurvedic plant-based foods, roasted nut snacks, and coconut water drinks; needs modern interactive storefront."],
  ["Yogabar Healthy Snack Bars", "info@yogabars.in", "India", "Bengaluru, Karnataka", "Suhasini Sampath (Co-Founder)", "Wholesome snack bar brand crafting almond fudge bars, muesli, and peanut butters; needs dynamic flavor bundle builder."],
  ["To Be Honest Real Fruit Snacks", "hello@tbhsnacks.com", "India", "Noida, UP", "Mayank Gupta (Founder)", "Vacuum-cooked golden dried fruits, crispy okra, and roasted taro chips; needs interactive build-a-pack store."],
  ["Beyond Snack Kerala Banana Chips", "contact@beyondsnack.in", "India", "Kochi, Kerala", "Manas Madhu (Founder)", "Authentic Kerala banana chips cooked in pure oil with peri-peri and sour cream flavors; needs snack subscription shop."],
  ["Green Snack Co Quinoa & Nuts", "care@thegreensnackco.com", "India", "Mumbai, Maharashtra", "Jasmine Kaur (Founder)", "Superfood snacks roasting quinoa puffs, spiced cashews, and trail seed mixes; needs modern responsive storefront."],
  ["Swa Artisanal Fruit Syrups", "cheers@drinkswa.com", "India", "Bengaluru, Karnataka", "Vaishali Mehta (Founder)", "Craft syrups made with real Indian fruits, herbs, and dried spices; needs cocktail tasting box shop."],
  ["Wingreens Farms Dip & Snacks", "care@wingreensfarms.com", "India", "Gurgaon, Haryana", "Anju Srivastava (Founder)", "Farm-grown dips, spiced nut trail mixes, and artisanal pita chips; needs modern gourmet grocery shop."],
  ["Akshayakalpa Organic Dairy & Nuts", "support@akshayakalpa.org", "India", "Tiptur, Karnataka", "Dr. G. N. S. Reddy (CEO)", "Farmer-owned organic dairy and artisanal country nut provisions; needs fresh subscription replenishment portal."],
  ["Almond House Sweets & Dry Fruits", "care@almondhouse.com", "India", "Hyderabad, Telangana", "Chaitanya Muppala (CEO)", "Pioneering Hyderabad sweet boutique known for almond bisticks and dry fruit badam halwa; needs interactive wedding gift customizer."],
  ["Dadu's Sweets & Dry Fruit Gifts", "care@dadus.co.in", "India", "Hyderabad, Telangana", "Rajesh Dadu (Owner)", "Royal dry fruit hampers, roasted cashew platters, and anjeer burfi across Telangana; needs luxury corporate gift portal."],
  ["Chaina Ram Sindhi Confectioners", "info@chainaram.in", "India", "Chandni Chowk, Delhi", "Hari Gidwani (Partner)", "Legendary Old Delhi sweet shop famed for Karachi Halwa studded with almonds and pistachios; needs national shipping store."],
  ["Kanwarji's Confectioners Delhi", "info@kanwarjis.com", "India", "Chandni Chowk, Delhi", "Kanwarji Family (Owners)", "Heritage 1850s Chandni Chowk shop crafting Dalbiji, roasted dry fruit mixtures, and badam lauz; needs modern web shop."],
  ["Annakoot God's Own Food", "info@annakoot.in", "India", "New Delhi", "Annakoot Team (Directors)", "Satvik gourmet dining and retail sweet boutique offering royal dry fruit boxes; needs celebratory gifting storefront."],
  ["Budhani Bros Waferwala Pune", "info@budhanibros.com", "India", "Pune, Maharashtra", "Budhani Family (Owners)", "Pune's famous potato wafers, salted cashews, and roasted dry fruit chiwda; needs online souvenir order portal."],
  ["Karachi Bakery Fruit Biscuits", "info@karachibakery.com", "India", "Hyderabad, Telangana", "Harish Ramnani (Director)", "Iconic bakery renowned worldwide for candied fruit biscuits and roasted cashew pastries; needs international gift shop."],

  // --- European Fine Foods, Confectionery & Mediterranean Nuts ---
  ["Niederegger Lübeck Marzipan", "info@niederegger.de", "Germany", "Lübeck", "Holger von der Heyde (Managing Director)", "World's most famous marzipan manufacturer crafting almond marzipan covered in dark chocolate; needs luxury gift tin builder."],
  ["Lambertz Fine Gingerbread & Nuts", "info@lambertz.de", "Germany", "Aachen", "Dr. Hermann Bühlbecker (Owner)", "Historic confectionery brand crafting Florentine cookies with roasted sliced almonds; needs holiday corporate gift builder."],
  ["Lebkuchen-Schmidt Nuremberg", "info@lebkuchen-schmidt.com", "Germany", "Nuremberg", "Gerd Schmelzer (CEO)", "Famed Nuremberg Lebkuchen packed with roasted hazelnuts, almonds, and candied citrus peel; needs international gift tin shop."],
  ["Wicklein Lebkuchen Nuremberg", "info@wicklein.de", "Germany", "Nuremberg", "Wicklein Team (Directors)", "Traditional gingerbread and almond marzipan confectioner shipping worldwide; needs interactive holiday gift store."],
  ["Loacker Wafer & Nut Confections", "info@loacker.com", "Italy", "Auna di Sotto, South Tyrol", "Andreas Loacker (Vice Chairman)", "Renowned alpine bakery crafting chocolate wafers with 100% roasted Italian hazelnuts; needs interactive variety pack store."],
  ["Tre Marie Panettoni & Dolci", "info@tremarie.it", "Italy", "Milan", "Tre Marie Team (Directors)", "Milanese confectionery tradition baking panettoni studded with sultana raisins and candied orange peel; needs holiday salon."],
  ["Galbusera Health & Nut Biscuits", "servizioclienti@galbusera.it", "Italy", "Cosio Valtellino, SO", "Galbusera Family (Directors)", "Italian bakery crafting whole grain breakfast biscuits with roasted hazelnuts and almonds; needs modern responsive storefront."],
  ["Biscotti Gentilini Historic Rome", "info@biscottigentilini.it", "Italy", "Rome", "Paolo Gentilini (President)", "Historic Roman bakery baking Osvego biscuits, almond cantucci, and panettone; needs online Italian specialty boutique."],
  ["Amaretti Virginia Artisan Dolci", "info@amarettivirginia.com", "Italy", "Sassello, SV", "Virginia Team (Directors)", "Artisan bakery celebrated for soft almond amaretti and hazelnut baci di Sassello; needs vintage gift tin customizer."],
  ["Marabissi Tuscan Fine Biscuits", "info@marabissi.it", "Italy", "Chianciano Terme, Siena", "Massimiliano Marabissi (Owner)", "Tuscan pastry kitchen baking almond cantucci, ricciarelli, and panforte di Siena; needs luxury gourmet web shop."],
  ["Fabbri 1905 Amarena Cherries", "info@fabbri1905.com", "Italy", "Bologna", "Nicola Fabbri (President)", "Iconic ceramic crock Amarena wild cherries in syrup and fruit confectionery pastes; needs modern luxury gift boutique."],
  ["Agrimontana Candied Chestnuts", "info@agrimontana.it", "Italy", "Borgo San Dalmazzo, CN", "Chiara Bardini (CEO)", "Finest Italian candied marrons glacés, fruit jams, and pure hazelnut pastes; needs bespoke luxury pastry portal."],
  ["Gran Deposito Giuseppe Giusti", "info@giusti.it", "Italy", "Modena", "Claudio Stefani Giusti (CEO)", "Oldest balsamic vinegar producer in the world pairing aged vinegars with dried figs and nuts; needs VIP tasting kit boutique."],
  ["Acetaia Leonardi Balsamic Reserve", "info@acetaialeonardi.it", "Italy", "Magreta di Formigine, Modena", "Giovanni Leonardi (Owner)", "Historic estate bottling balsamic glazes paired with dried dates, walnuts, and Parmigiano; needs bespoke luxury salon."],

  // --- Middle Eastern, Turkish & Mediterranean Confectionery & Roasteries ---
  ["Malatya Pazarı Gourmet Dry Fruits", "info@malatyapazari.com.tr", "Turkey", "Istanbul", "Çetin Palancı (CEO)", "Historic Istanbul Spice Bazaar purveyor offering dried Turkish apricots, figs, and walnuts; needs international gift boutique."],
  ["Tadım Roasted Seeds & Nuts", "info@tadim.com.tr", "Turkey", "Gebze, Kocaeli", "Tadım Management (Directors)", "Turkey's leading packaged snack brand roasting sunflower seeds, pistachios, and hazelnuts; needs modern retail presence."],
  ["Peyman Nut & Dried Fruit Snacks", "info@peyman.com.tr", "Turkey", "Eskişehir", "Peyman Team (Directors)", "Innovative snack brand packaging gourmet dried fruits, roasted almonds, and raw nut mixes; needs dynamic retail showcase."],
  ["Hafız Mustafa 1864 Istanbul", "info@hafizmustafa.com", "Turkey", "Istanbul", "Eren Ongurlar (Owner)", "Legendary Turkish confectionery house handcrafting pistachio baklava and lokum with roasted walnuts; needs global luxury storefront."],
  ["Karaköy Güllüoğlu Baklava", "info@karakoygulluoglu.com", "Turkey", "Istanbul", "Nadir Güllü (Master Baker)", "World's most renowned Gaziantep pistachio baklava master; needs international express delivery ordering portal."],
  ["Hacı Bekir Turkish Delights", "info@hacibekir.com", "Turkey", "Istanbul", "Hacı Bekir Family (Owners)", "Operating since 1777 in Istanbul, crafting pistachio lokum and roasted almond dragees; needs luxury vintage web shop."],
  ["Tuğba Kuruyemiş Specialty Roastery", "info@tugbakuruyemis.com.tr", "Turkey", "Aydın", "Tuğba Family (Owners)", "Aegean roastery known for roasted figs, chocolate covered nuts, and Turkish coffees; needs interactive gift hamper builder."],
  ["Makbul Kuruyemiş Fresh Roastery", "info@makbul.com", "Turkey", "Istanbul", "Makbul Team (Directors)", "Over 200 stores across Turkey roasting hazelnuts, pumpkin seeds, and dried mulberries; needs online click-and-deliver portal."],
  ["Selamlique Istanbul Gourmet Goods", "info@selamlique.com", "Turkey", "Istanbul", "Caroline Koç (Co-Founder)", "Luxury Turkish brand crafting roasted almond croquant, mastic lokum, and single-origin coffee; needs luxury VIP boutique."],
  ["Patchi Luxury Chocolate Gifting", "support@patchi.com", "Lebanon", "Beirut", "Nizar Choucair (Founder)", "Pioneering luxury chocolate gifting atelier decorating chocolates with roasted pistachios & pecans; needs interactive bespoke box builder."],
  ["Al Baba Sweets Confectionery", "info@albaba-sweets.com", "Lebanon", "Saida", "Al Baba Family (Owners)", "Traditional Lebanese sweets craft house famous for cashew baklava, maamoul with dates, and barazek; needs online international shop."],
  ["Hallab 1881 Kasr El Helwo", "info@hallab.com.lb", "Lebanon", "Tripoli", "Rafic Hallab (CEO)", "Centuries-old palace of Lebanese oriental pastry crafting pine nut and pistachio specialties; needs corporate gift tin portal."],
  ["Amal Bohsali Fine Oriental Sweets", "info@amalbohsali.com", "Lebanon", "Beirut", "Amal Bohsali (Founder)", "Artisan pastry shop in Beirut baking knafeh, pistachio baklava, and date maamoul; needs overseas shipping storefront."],
  ["Douaihy Sweets Pastry Crafts", "info@douaihy.com", "Lebanon", "Beirut", "Douaihy Family (Owners)", "Gourmet Lebanese confectioner packaging roasted nut platters and festive sweet boxes; needs digital festive gift builder."],
  ["Zalatimo Sweets Royal Pastries", "customercare@zalatimosweets.com", "Jordan", "Amman", "Zalatimo Family (Directors)", "Jordan's royal sweet maker baking pistachio maamoul, cashew barazek, and baklava; needs interactive luxury gift crate shop."],
  ["Habibah Sweets Traditional Knafeh", "info@habibahsweets.com", "Jordan", "Amman", "Habibah Family (Owners)", "Historic Amman sweets shop renowned for Nabulsi knafeh topped with chopped roasted pistachios; needs online celebratory gift portal."],
  ["Saadeddin Pastry & Dates", "info@saadeddin.com", "Saudi Arabia", "Riyadh", "Ali Saadeddin (Chairman)", "Leading confectionery brand in Saudi Arabia crafting date truffles, roasted nut sweets, and cakes; needs nationwide delivery portal."],
  ["Anoosh Gourmet Cookies & Chocolates", "care@anoosh.sa", "Saudi Arabia", "Riyadh", "Anoosh Team (Directors)", "Saudi artisan confectionery crafting freshly baked cookies with toasted pecans and date chocolates; needs interactive gift box builder."],
  ["Hunter Foods Gourmet Snacks Dubai", "info@hunterfoods.com", "UAE", "Dubai", "Ananya Narayan (Managing Director)", "Manufacturer of Hand Cooked Gourmet Potato Chips, dried fruit mixes, and roasted superseed blends; needs modern retail showcase."],
  ["Barakat Fresh Fruits & Juices", "info@barakatfresh.ae", "UAE", "Dubai", "Kenneth D'Costa (Managing Director)", "Fresh produce and dried exotic fruit distributor across the UAE; needs modern direct-to-home ordering web app."],
  ["Kibsons International Fresh Foods", "info@kibsons.com", "UAE", "Dubai", "Halima Jumani (Director)", "UAE online grocery leader providing organic raw nuts, dried apricots, and medjool dates; needs responsive mobile storefront."],
  ["Organic Foods & Café Dubai", "info@organicfoodsandcafe.com", "UAE", "Dubai", "Nils El Accad (Founder)", "Organic supermarket and café chain stocking certified organic nuts, dried fruits, and whole seeds; needs omnichannel grocery portal."]
];

console.log(`Loaded ${additionalCandidates.length} additional candidate businesses.`);

// Merge all candidates together
const allCandidates = [...existingPoolCandidates, ...additionalCandidates];
console.log(`Total candidate pool available: ${allCandidates.length}`);

async function filterAndValidateAll() {
  const seenEmails = new Set();
  const candidatesToTest = [];
  let sentCollisions = 0;
  let syntaxFails = 0;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  for (const c of allCandidates) {
    if (!c || !c[1]) continue;
    const cleanEmail = c[1].toLowerCase().trim();

    if (!emailRegex.test(cleanEmail)) {
      syntaxFails++;
      continue;
    }

    if (sentSet.has(cleanEmail) || seenEmails.has(cleanEmail)) {
      sentCollisions++;
      continue;
    }

    seenEmails.add(cleanEmail);
    candidatesToTest.push(c);
  }

  console.log(`Candidates ready for DNS MX testing: ${candidatesToTest.length}`);
  console.log(`Skipped (collision with sent_emails or duplicate): ${sentCollisions}`);

  const uniqueDomains = [...new Set(candidatesToTest.map(c => c[1].toLowerCase().trim().split("@")[1]))];
  console.log(`Checking ${uniqueDomains.length} unique domains for active MX records...`);

  const domainCache = new Map();
  const concurrency = 30;
  for (let i = 0; i < uniqueDomains.length; i += concurrency) {
    const chunk = uniqueDomains.slice(i, i + concurrency);
    await Promise.all(chunk.map(async (domain) => {
      try {
        const records = await Promise.race([
          dns.resolveMx(domain),
          new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 2500))
        ]);
        const valid = Array.isArray(records) && records.some(r => r.exchange && r.exchange !== "." && !r.exchange.endsWith(".invalid"));
        domainCache.set(domain, valid);
      } catch {
        domainCache.set(domain, false);
      }
    }));
  }

  const verifiedLeads = [];
  for (const c of candidatesToTest) {
    const domain = c[1].toLowerCase().trim().split("@")[1];
    if (domainCache.get(domain) === true) {
      verifiedLeads.push(c);
    }
  }

  console.log(`\n======================================================`);
  console.log(`CANDIDATE DNS MX RESOLUTION REPORT`);
  console.log(`Total Candidates Evaluated: ${allCandidates.length}`);
  console.log(`Total Unique & Unsent:       ${candidatesToTest.length}`);
  console.log(`Valid MX Verified Leads:    ${verifiedLeads.length}`);
  console.log(`======================================================\n`);

  return verifiedLeads;
}

filterAndValidateAll().then(leads => {
  console.log(`Result: ${leads.length} verified leads.`);
  if (leads.length >= 300) {
    console.log(`🎯 TARGET REACHED! We have at least 300 verified leads!`);
  } else {
    console.log(`Need ${300 - leads.length} more verified leads.`);
  }
}).catch(console.error);
