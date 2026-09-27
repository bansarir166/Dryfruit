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

const newBatch3 = [
  // --- US & Canada Premier Specialty Roasters, Artisan Bakeries & Confectioners ---
  ["Stumptown Coffee Roasters", "info@stumptowncoffee.com", "USA", "Portland, OR", "Laura Szeliga (President)", "Portland specialty roasting pioneer pairing single origin coffees with dark chocolate covered almonds; needs corporate gift tin portal."],
  ["Intelligentsia Coffee & Teas", "customersupport@intelligentsiacoffee.com", "USA", "Chicago, IL", "James McLaughlin (CEO)", "Direct trade specialty roaster offering limited-edition reserve coffees and chocolate fruit bars; needs VIP subscription shop."],
  ["Counter Culture Coffee Direct", "info@counterculturecoffee.com", "USA", "Durham, NC", "Brett Smith (President)", "Sustainable coffee roaster celebrating direct trade relationships and holiday coffee & nut pairings; needs interactive tasting box builder."],
  ["Caribou Coffee Company", "customercare@cariboucoffee.com", "USA", "Minneapolis, MN", "John Butcher (President & CEO)", "Iconic northern coffee brand pairing handcrafted beverages with toasted almond pastries and berry bites; needs holiday gift shop."],
  ["La Colombe Coffee Roasters", "help@lacolombe.com", "USA", "Philadelphia, PA", "Todd Carmichael (Co-Founder)", "Pioneering draft latte creator and specialty roaster pairing espresso with roasted nut biscotti; needs dynamic DTC storefront."],
  ["Philz Coffee San Francisco", "info@philzcoffee.com", "USA", "San Francisco, CA", "Jacob Jaber (Co-Founder & CEO)", "Beloved Bay Area coffee creator famous for handcrafted blends paired with almond baklava and nut treats; needs mobile pre-order app."],
  ["Ritual Coffee Roasters SF", "info@ritualcoffee.com", "USA", "San Francisco, CA", "Eileen Rinaldi (Founder & CEO)", "Pioneering San Francisco woman-owned roastery celebrating relationship coffee and seasonal chocolate fruit bars; needs modern boutique."],
  ["Sightglass Coffee San Francisco", "orders@sightglasscoffee.com", "USA", "San Francisco, CA", "Justin & Jerad Morrison (Co-Founders)", "Independent craft roastery and tasting room pairing micro-lot coffees with roasted walnut pastries; needs luxury retail portal."],
  ["Verve Coffee Roasters Santa Cruz", "customerservice@vervecoffee.com", "USA", "Santa Cruz, CA", "Colby Barr (Co-Founder)", "Farmlevel specialty coffee roaster featuring single origin coffees and artisan nut butters; needs interactive subscription club."],
  ["Equator Coffees San Rafael", "info@equatorcoffees.com", "USA", "San Rafael, CA", "Helen Russell (Co-Founder)", "B-Corp certified craft roaster pairing fair trade coffees with artisan chocolate covered nuts; needs corporate gift crate tool."],
  ["Four Barrel Coffee San Francisco", "info@fourbarrelcoffee.com", "USA", "San Francisco, CA", "Tal Mor (Director)", "Pioneering Mission District third-wave roastery sourcing clean coffees and crafting espresso pairings; needs responsive web shop."],
  ["Coava Coffee Roasters Portland", "info@coavacoffee.com", "USA", "Portland, OR", "Matt Higgins (Founder)", "Single origin coffee and craft tea roastery known for meticulous sourcing and roasted nut treats; needs wholesale & gift portal."],
  ["Water Avenue Coffee Portland", "info@wateravenuecoffee.com", "USA", "Portland, OR", "Bruce & Matt Milletto (Founders)", "Handcrafted Pacific Northwest roasted coffees paired with local hazelnuts and dried fruit granola; needs modern retail presence."],
  ["Heart Coffee Roasters Portland", "info@heartroasters.com", "USA", "Portland, OR", "Wille & Rebekah Yli-Luoma (Owners)", "Nordic-style light roast coffee roaster celebrating crisp fruit notes and artisan chocolate dragees; needs luxury online salon."],
  ["Onyx Coffee Lab Arkansas", "info@onyxcoffeelab.com", "USA", "Rogers, AR", "Jon & Andrea Allen (Co-Founders)", "World barista champion roastery crafting ultra-premium coffees and limited-edition holiday gift boxes; needs interactive gift tin builder."],
  ["Madcap Coffee Company", "info@madcapcoffee.com", "USA", "Grand Rapids, MI", "Trevor Corlett (Co-Founder)", "Michigan specialty coffee pioneer offering single-farm lots paired with roasted almond chocolate bars; needs direct-to-consumer store."],
  ["Spyhouse Coffee Roasters", "info@spyhousecoffee.com", "USA", "Minneapolis, MN", "Christian Johnson (Founder)", "Twin Cities artisan coffee roaster and bakery offering seasonal coffees and roasted spiced pecans; needs corporate holiday gift shop."],
  ["Dogwood Coffee Company", "info@dogwoodcoffee.com", "USA", "Minneapolis, MN", "Dan Anderson (Co-Founder)", "Specialty coffee roaster celebrating quality, craft, and seasonal fruit & nut coffee pairing boxes; needs interactive gift customizer."],
  ["Wonderstate Coffee Wisconsin", "info@wonderstate.com", "USA", "Viroqua, WI", "Caleb Nicholes (Co-Founder)", "100% solar-powered roastery sourcing direct-trade organic coffees and dried fruit snacks; needs modern eco-friendly store."],
  ["Anodyne Coffee Roasting Co", "info@anodynecoffee.com", "USA", "Milwaukee, WI", "Matthew McClutchy (Founder)", "Small-batch roaster in Milwaukee roasting certified organic coffees and pairing with holiday nut tins; needs modern web presence."],
  ["Metric Coffee Chicago", "info@metriccoffee.com", "USA", "Chicago, IL", "Darko Arandjelovic (Co-Founder)", "Chicago independent roastery sourcing transparently and serving local nut pastries; needs modern subscription storefront."],
  ["Dark Matter Coffee Chicago", "info@darkmattercoffee.com", "USA", "Chicago, IL", "Jesse Diaz (Founder)", "Creative Chicago coffee roasters famous for barrel-aged coffees and Mexican chocolate spices; needs interactive merchandise shop."],
  ["Colectivo Coffee Milwaukee", "info@colectivocoffee.com", "USA", "Milwaukee, WI", "Lincoln Fowler (Co-Founder)", "Session coffees roasted fresh on custom roasters paired with Troubadour bakery walnut scones; needs online order delivery portal."],
  ["Ruby Coffee Roasters Nelsonville", "info@rubycoffeeroasters.com", "USA", "Nelsonville, WI", "Jared Linzmeier (Founder)", "Rural Wisconsin specialty coffee roaster focusing on sweet, clean coffees and dried fruit tasting kits; needs boutique web shop."],
  ["PT's Coffee Roasting Co", "info@ptscoffee.com", "USA", "Topeka, KS", "Jeff Taylor (Co-Founder)", "Direct trade pioneer roasting award-winning coffees paired with artisanal chocolate nut barks; needs corporate gift tin configurator."],
  ["Messenger Coffee Kansas City", "info@messengercoffee.co", "USA", "Kansas City, MO", "Nick Robertson (Director)", "Artisan roastery and Ibis bakery crafting naturally leavened walnut breads and specialty coffees; needs modern bakery portal."],
  ["Kaldi's Coffee Roasting Co", "info@kaldiscoffee.com", "USA", "St. Louis, MO", "Tricia Zimmer Ferguson (President)", "Specialty coffee roaster operating community cafes and pairing coffee with roasted nut granolas; needs corporate gifting shop."],
  ["Frothy Monkey Coffee & Roasting", "info@frothymonkey.com", "USA", "Nashville, TN", "Ryan Pruitt (Managing Partner)", "Nashville hospitality group roasting specialty coffee and baking pecan pies and nut cookies; needs online retail storefront."],
  ["Barista Parlor Nashville", "info@baristaparlor.com", "USA", "Nashville, TN", "Andy Mumma (Founder)", "Design-forward specialty coffee purveyor crafting house-made chocolate nut bars and seasonal beans; needs bespoke lifestyle salon."],
  ["Crema Coffee Roasters Nashville", "hello@cremacoffeeroasters.com", "USA", "Nashville, TN", "Rachel & Ben Lehman (Owners)", "Zero-waste coffee roaster pairing seasonal coffees with local roasted pecan treats; needs clean sustainable web shop."],
  ["East Pole Coffee Co Atlanta", "info@eastpole.coffee", "USA", "Atlanta, GA", "Jared Tompkins (Co-Founder)", "Atlanta specialty coffee roaster crafting single origin coffees paired with Georgia pecan treats; needs direct consumer boutique."],
  ["Panther Coffee Miami", "info@panthercoffee.com", "USA", "Miami, FL", "Joel & Leticia Pollock (Founders)", "Miami specialty coffee icon roasting on vintage equipment and pairing with artisan fruit pastries; needs online specialty shop."],
  ["Greater Goods Coffee Co Austin", "info@greatergoodsroasting.com", "USA", "Austin, TX", "Khanh Nguyen (Founder)", "Roaster of the Year crafting exceptional coffees and supporting local Texas food charities; needs modern gift crate builder."],
  ["Cuvee Coffee Austin", "info@cuveecoffee.com", "USA", "Austin, TX", "Mike McKim (Founder)", "Craft coffee pioneer introducing nitro cold brew and Texas roasted pecan blend coffees; needs dynamic subscription storefront."],
  ["Houndstooth Coffee Texas", "info@houndstoothcoffee.com", "USA", "Austin, TX", "Sean Henry (Founder)", "Texas specialty coffee purveyor curating artisan coffees and locally made dark chocolate nut treats; needs modern cafe store."],
  ["Merit Coffee Roasting Co", "info@meritcoffee.com", "USA", "San Antonio, TX", "Bill Ellis (Founder)", "Direct-sourcing specialty coffee roaster with cafes across Texas offering nut snack pairings; needs modern mobile app."],
  ["Sweet Bloom Coffee Roasters", "info@sweetbloomcoffee.com", "USA", "Lakewood, CO", "Andy Sprenger (Founder)", "World coffee competition champion roasting exquisite micro-lots paired with single-origin chocolates; needs VIP tasting portal."],
  ["Corvus Coffee Roasters Denver", "info@corvuscoffee.com", "USA", "Denver, CO", "Phil Goodlaxson (Founder)", "Relationship-focused craft roastery and bakery crafting sourdough walnut loaves and specialty coffees; needs artisan gift crate tool."],
  ["Huckleberry Roasters Denver", "info@huckleberryroasters.com", "USA", "Denver, CO", "Koan Goedman (Co-Founder)", "Denver specialty coffee roaster celebrating good coffee and good people with roasted nut snacks; needs modern responsive storefront."],
  ["Novo Coffee Denver", "info@novocoffee.com", "USA", "Denver, CO", "Jake Brodsky (Co-Founder)", "Family-owned Denver specialty coffee roaster roasting relationship coffees since 2002; needs modern wholesale & gift shop."],
  ["Caffe Vita Coffee Roasting Co", "info@caffevita.com", "USA", "Seattle, WA", "Deming Maclise (Owner)", "Pioneering Seattle independent roastery roasting farm-direct coffees and chocolate almond treats; needs modern digital shop."],
  ["Espresso Vivace Seattle", "info@espressovivace.com", "USA", "Seattle, WA", "David Schomer (Founder)", "Legendary Seattle espresso pioneer dedicated to the art of Northern Italian style espresso roasting; needs online bean ordering."],
  ["Olympia Coffee Roasting Co", "info@olympiacoffee.com", "USA", "Olympia, WA", "Oliver Stormshak (Co-Owner)", "Fair For All certified Pacific Northwest roaster pairing micro-lots with local Washington berries; needs interactive subscription shop."],
  ["Camber Coffee Bellingham", "hello@cambercoffee.com", "USA", "Bellingham, WA", "David Yake (Co-Founder)", "Award-winning specialty roaster celebrating sweetness and balance in coffees and roasted nut pairings; needs luxury online salon."],
  ["Tony's Coffee Bellingham", "info@tonyscoffee.com", "USA", "Bellingham, WA", "Todd Elliott (President)", "Roasting fine coffees in the Pacific Northwest since 1971, crafting certified organic roasted nut blends; needs direct web store."],
  ["Anchorhead Coffee Seattle", "info@anchorheadcoffee.com", "USA", "Seattle, WA", "Jake & Mike Powell (Co-Founders)", "Artisanal Seattle roastery and bakery famous for quilliams, cinnamon rolls with pecans, and cold brews; needs digital bakery shop."],
  ["Storyville Coffee Pike Place", "info@storyville.com", "USA", "Seattle, WA", "Jamie Munson (President)", "Private specialty coffee company at Pike Place Market baking artisan walnut cinnamon rolls; needs luxury gift hamper portal."],

  // --- Canada Premier Specialty Roasters, Artisans & Fine Foods ---
  ["Kicking Horse Coffee Invermere", "info@kickinghorsecoffee.com", "Canada", "Invermere, BC", "Elana Rosenfeld (Co-Founder)", "Canada's #1 organic fair trade coffee roaster roasting deep in the Canadian Rocky Mountains; needs modern DTC shopping store."],
  ["49th Parallel Coffee Roasters", "info@49thcoffee.com", "Canada", "Vancouver, BC", "Vince & Michael Piccolo (Founders)", "Direct-trade Vancouver specialty roaster paired with Lucky's handcrafted glazed doughnuts; needs interactive subscription portal."],
  ["Pilot Coffee Roasters Toronto", "info@pilotcoffeeroasters.com", "Canada", "Toronto, ON", "Andy & Amy Wilkin (Founders)", "Full-service specialty coffee roastery celebrating direct trade and seasonal chocolate fruit bars; needs corporate gift tin builder."],
  ["Detour Coffee Roasters Hamilton", "info@detourcoffee.com", "Canada", "Dundas, ON", "Kaelin McCowan (Founder)", "Artisan Ontario coffee roaster celebrating seasonal harvests paired with handcrafted nut granolas; needs modern mobile store."],
  ["Balzac's Coffee Roasters Ontario", "info@balzacs.com", "Canada", "Stoney Creek, ON", "Diana Olsen (Founder)", "Boutique Canadian cafe and roasting company inspired by French Parisian cafes; needs holiday gift box customizer."],
  ["Bridgehead Coffee Ottawa", "inquiries@bridgehead.ca", "Canada", "Ottawa, ON", "Ian Clark (Director)", "Fair trade and organic coffee roaster in Canada's capital pairing coffee with artisan dried fruit pastries; needs online ordering portal."],
  ["JJ Bean Coffee Roasters Vancouver", "info@jjbeancoffee.com", "Canada", "Vancouver, BC", "John Neate Jr. (Founder)", "Four generations of coffee roasting in Vancouver pairing single origins with fresh baked nut muffins; needs direct web storefront."],
  ["Timbertrain Coffee Roasters", "info@timbertraincoffeeroasters.com", "Canada", "Vancouver, BC", "Peter & Jeff (Founders)", "Artisanal Vancouver roaster crafting specialty micro-lots paired with chocolate hazelnut pastries; needs modern digital shop."],
  ["Elysian Coffee Vancouver", "info@elysiancoffee.com", "Canada", "Vancouver, BC", "Alistair Durie (Founder)", "Vancouver specialty coffee roaster sourcing coffees from dedicated producers and baking fresh treats; needs modern cafe store."],
  ["Monogram Coffee Calgary", "hello@monogramcoffee.com", "Canada", "Calgary, AB", "Ben Put (Co-Founder)", "Canadian national barista champions roasting exceptional coffees and curating chocolate nut treats; needs luxury VIP boutique."],
  ["Rosso Coffee Roasters Calgary", "info@rossocoffeeroasters.com", "Canada", "Calgary, AB", "David & Jessie Rosso (Founders)", "Calgary specialty coffee roaster sourcing directly from producer families and offering holiday nut tins; needs gift box builder."],
  ["Phil & Sebastian Coffee Roasters", "info@philsebastian.com", "Canada", "Calgary, AB", "Phil Robertson & Sebastian Sztabzyb (Founders)", "Pioneering Canadian roastery focusing on meticulous sourcing and pairing with Hoopla baked treats; needs subscription club."],
  ["Analog Coffee Calgary", "info@analogcoffee.ca", "Canada", "Calgary, AB", "Russ Prefontaine (Co-Founder)", "Calgary craft coffee roasters serving meticulously prepared coffees and pairing with dry fruit pastries; needs modern online store."],
  ["De Mello Coffee Toronto", "info@hellodemello.com", "Canada", "Toronto, ON", "Felix Cha (Co-Founder)", "Vibrant Toronto specialty coffee roaster and bakery crafting colorful coffee tins and almond brioches; needs playful DTC storefront."],
  ["Dineen Coffee Co Toronto", "info@dineencoffee.com", "Canada", "Toronto, ON", "Dineen Team (Owners)", "Heritage boutique cafe in downtown Toronto serving roasted coffees and artisan chocolate nut biscotti; needs luxury gift crate tool."],
  ["Propeller Coffee Co Toronto", "info@propellercoffee.com", "Canada", "Toronto, ON", "Losel Tethong (President)", "Micro-batch specialty coffee roaster winning Roaster of the Year and offering corporate gift sets; needs modern e-commerce portal."],
  ["Ethical Bean Coffee Vancouver", "info@ethicalbean.com", "Canada", "Vancouver, BC", "Aaron DeCosimo (Director)", "100% fairtrade and organic certified coffee roaster with traceable bean journey and dried snack treats; needs direct web store."],
  ["Salt Spring Coffee BC", "info@saltspringcoffee.com", "Canada", "Richmond, BC", "Mickey McLeod (Co-Founder)", "Pioneering organic and fair-to-farmer coffee roaster in British Columbia pairing with dried fruit trail snacks; needs modern shop."],
  ["Discovery Coffee Victoria", "info@discoverycoffee.com", "Canada", "Victoria, BC", "Logan Gray (Owner)", "Victoria Vancouver Island roastery serving fresh roasted single origins and Yonni's handmade doughnuts; needs local ordering app."],
  ["Fernwood Coffee Company", "info@fernwoodcoffee.com", "Canada", "Victoria, BC", "Terra & Ben Myers (Owners)", "Artisanal roastery in Victoria crafting award-winning coffees and pairing with hazelnut chocolate bars; needs modern web boutique."]
];

console.log(`Evaluating newBatch3: ${newBatch3.length} candidates...`);

const candidatesToTest = [];
for (const c of newBatch3) {
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

const passed3 = candidatesToTest.filter(c => validDomains.has(c[1].split("@")[1]));
console.log(`Passed MX in batch 3: ${passed3.length}`);

// Combine with scratch
const combined = [...scratch, ...passed3];
console.log(`Total accumulated verified in scratch: ${combined.length}`);
writeFileSync("scratch_passed_expansion.json", JSON.stringify(combined, null, 2), "utf8");
