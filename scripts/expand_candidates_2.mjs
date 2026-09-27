#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import dns from "node:dns/promises";

// Load sent emails for deduplication
const sent = JSON.parse(readFileSync("sent_emails.json", "utf8"));
const sentSet = new Set(sent.map(s => (s.email || "").toLowerCase().trim()));

// Load already saved expansion candidates to avoid internal collision
let prevExpansion = [];
try {
  prevExpansion = JSON.parse(readFileSync("scratch_passed_expansion.json", "utf8"));
} catch {}
const prevSet = new Set(prevExpansion.map(c => c[1].toLowerCase().trim()));

const newBatch2 = [
  // --- US Specialty Fruit, Nut, Granola, Bar & Snack Innovators ---
  ["That's it. 100% Real Fruit Bars", "info@thatsitfruit.com", "USA", "Los Angeles, CA", "Lior Lewensztain (Founder & CEO)", "Crafting clean snack bars made solely of whole dried apples, mangoes, and blueberries; needs interactive flavor bundle store."],
  ["Barnana Organic Plantain & Banana", "info@barnana.com", "USA", "Los Angeles, CA", "Almir Surguipe (CEO)", "Upcycled organic dried plantain chips and chewy banana bites dipped in dark chocolate; needs modern responsive storefront."],
  ["Solely Clean Dried Fruit Jerky", "info@solely.com", "USA", "San Diego, CA", "Simon Cooper (CEO)", "Clean organic dried mango strips and dried pineapple rings without added sugar; needs dynamic snack subscription portal."],
  ["Rind Snacks Whole Fruit Crisps", "info@rindsnacks.com", "USA", "New York, NY", "Matt Weiss (Founder)", "Skin-on dried fruit snacks maximizing fiber and fighting food waste with dried kiwi and oranges; needs snack box customizer."],
  ["Peeled Snacks Organic Fruit & Pea", "info@peeledsnacks.com", "USA", "Cumberland, MD", "Noha Waibsnaider (Founder)", "Pioneering organic gently dried mango, apple chips, and baked pea snacks; needs interactive retail storefront."],
  ["Crispy Green Freeze-Dried Fruits", "info@crispygreen.com", "USA", "Fairfield, NJ", "Angela Liu (Founder & CEO)", "Pure freeze-dried apples, strawberries, and Asian pears for healthy families; needs corporate snack box portal."],
  ["Brothers All Natural Fruit Crisps", "info@brothersallnatural.com", "USA", "Rochester, NY", "Matt Betters (President)", "Freeze-dried strawberry, banana, and Fuji apple fruit crisps for school lunches; needs direct-to-consumer store."],
  ["Hippeas Organic Chickpea Snacks", "hello@hippeas.com", "USA", "Austin, TX", "Paul Lindley (Chairman)", "Organic baked chickpea puffs and tortilla chips seasoned with vegan white cheddar; needs interactive bundle builder."],
  ["Biena Snacks Roasted Chickpeas", "hello@bienasnacks.com", "USA", "Allston, MA", "Poorvi Patodia (Founder)", "Crunchy roasted chickpeas and keto chickpea puffs seasoned with sea salt; needs modern snack subscription shop."],
  ["The Good Bean Crispy Chickpeas", "info@thegoodbean.com", "USA", "Berkeley, CA", "Sarah Wallace (Founder)", "Whole roasted chickpeas, fava beans, and green peas tossed with dried cranberries; needs modern mobile storefront."],
  ["Dang Foods Thai Coconut & Rice", "hello@dangfoods.com", "USA", "Berkeley, CA", "Vincent Kitirattragarn (Founder)", "Toasted coconut chips, Thai sticky rice chips, and keto almond bars; needs dynamic DTC variety pack builder."],
  ["Bare Snacks Baked Fruit Chips", "info@baresnacks.com", "USA", "San Francisco, CA", "Bare Snacks Team (Directors)", "Baked crunchy apple chips, banana chips, and toasted coconut flakes; needs interactive gift hamper portal."],
  ["Purely Elizabeth Ancient Grain", "support@purelyelizabeth.com", "USA", "Boulder, CO", "Elizabeth Stein (Founder)", "Nutrient-dense ancient grain granola baked with coconut sugar, roasted cashews, and chia; needs subscription pantry shop."],
  ["Bobo's Oat Bars & Nut Bites", "info@eatbobos.com", "USA", "Boulder, CO", "Beryl Stafford (Founder)", "Wholesome baked oat bars, stuffed peanut butter bites, and fruit toaster pastries; needs build-a-box subscription store."],
  ["Simple Mills Almond Flour Baking", "info@simplemills.com", "USA", "Chicago, IL", "Katlin Smith (Founder)", "Almond flour artisan crackers, cookies, and baking mixes crafted with simple whole foods; needs modern pantry web shop."],
  ["Hu Kitchen Chocolate & Crackers", "support@hukitchen.com", "USA", "New York, NY", "Jordan Brown (Co-Founder)", "Paleo vegan dark chocolate bars stuffed with cashew butter and almond butter; needs luxury direct-to-consumer store."],
  ["LesserEvil Organic Popcorn & Puffs", "talktous@lesserevil.com", "USA", "Danbury, CT", "Charles Coristine (CEO)", "Organic air-popped popcorn tumbled in extra virgin coconut oil and pink Himalayan salt; needs playful snack shop."],
  ["Stonewall Kitchen Fine Specialty", "guestservices@stonewallkitchen.com", "USA", "York, ME", "John Stiker (CEO)", "Acclaimed New England specialty food producer crafting wild Maine blueberry jams and spiced nuts; needs luxury holiday gift crate tool."],
  ["Bonne Maman Fruit Preserves USA", "contact@bonnemaman.us", "USA", "New York, NY", "Bonne Maman Team (Directors)", "French fruit preserves, wild blueberry spreads, and holiday advent calendar gift boxes; needs seasonal gifting portal."],
  ["Sarabeth's Kitchen Preserves NYC", "customerservice@sarabeth.com", "USA", "New York, NY", "Sarabeth Levine (Founder)", "Award-winning legendary orange apricot marmalade, fruit spreads, and almond shortbread cookies; needs luxury breakfast gift shop."],
  ["Tate's Bake Shop Southampton", "customerservice@tatesbakeshop.com", "USA", "Southampton, NY", "Kathleen King (Founder)", "World-famous crispy thin chocolate chip walnut cookies and butter crunch cookies; needs corporate gift tin customizer."],
  ["Mary's Gone Crackers Organic", "info@marysgonecrackers.com", "USA", "Reno, NV", "Mary Waldner (Founder)", "Organic gluten-free seed crackers packed with brown rice, flax, sesame, and quinoa; needs modern subscription storefront."],
  ["Bob's Red Mill Natural Foods", "contact@bobsredmill.com", "USA", "Milwaukie, OR", "Bob Moore (Founder)", "Employee-owned stone-grinding whole grains, almond flour, raw nuts, and dried blueberries; needs interactive recipe & store portal."],
  ["King Arthur Baking Company", "customercare@kingarthurbaking.com", "USA", "Norwich, VT", "Karen Colberg (Co-CEO)", "America's oldest flour company offering premium baking ingredients, candied peel, and dried currants; needs digital baker shop."],
  ["California Olive Ranch Oils", "info@californiaoliveranch.com", "USA", "Chico, CA", "Michael Fox (CEO)", "Pioneering California cold-pressed extra virgin olive oils and roasted nut dressings; needs subscription pantry portal."],
  ["Cobram Estate California & Aus", "info@cobramestate.com.au", "Australia", "Lara, VIC", "Rob McGavin (Co-Founder)", "World-champion extra virgin olive oil producers pairing oils with dried fruit platters and nuts; needs luxury tasting kit boutique."],

  // --- UK, Scotland & Ireland Heritage Bakers & Confectioners ---
  ["Walkers Shortbread Aberlour", "customerservices@walkersshortbread.com", "UK", "Aberlour, Speyside", "Jim Walker (Managing Director)", "Royal Warrant Scottish Highland bakery crafting pure butter shortbread, fruit cakes, and walnut rounds; needs international luxury gift tin builder."],
  ["Border Biscuits Lanark", "info@border.co.uk", "UK", "Lanark, Scotland", "John Cunningham (Managing Director)", "Scottish family biscuit company baking dark chocolate ginger, golden oat crumbles, and almond shortbread; needs interactive holiday gift tin tool."],
  ["Island Bakery Organic Mull", "info@islandbakery.scot", "UK", "Tobermory, Isle of Mull", "Joe & Dawn Reade (Owners)", "Organic Scottish island bakery baking lemon melts, apple crumbles, and roasted pecan biscuits; needs digital boutique shop."],
  ["Tunnock's Legendary Bakery", "info@tunnock.co.uk", "UK", "Uddingston, Scotland", "Boyd Tunnock (Managing Director)", "Scottish institution crafting real milk chocolate caramel wafer biscuits and marshmallow tea cakes; needs celebratory souvenir shop."],
  ["Nairn's Scottish Oatcakes", "info@nairns-oatcakes.com", "UK", "Edinburgh, Scotland", "Martyn Webster (Managing Director)", "Historic Edinburgh baker crafting whole grain oatcakes, fruit & seed flatbreads, and oat biscuits; needs modern responsive storefront."],
  ["Wilkin & Sons Tiptree Preserves", "tiptree@tiptree.com", "UK", "Tiptree, Essex", "Scott Goodfellow (Joint Managing Director)", "Royal Warrant fruit growers and preserve makers famous for Little Scarlet strawberry and nut conserves; needs luxury festive hamper portal."],
  ["Tracklements Fine Condiments", "info@tracklements.co.uk", "UK", "Malmesbury, Wiltshire", "Guy Tullberg (Managing Director)", "Artisanal Wiltshire kitchen handcrafting spiced fruit chutneys, fig relishes, and walnut piccalilli; needs gourmet gift crate builder."],
  ["Hawkshead Relish Lake District", "info@hawksheadrelish.com", "UK", "Hawkshead, Cumbria", "Mark & Maria Whitehead (Founders)", "Award-winning Lake District artisan producer of damson chutneys, dried fruit preserves, and spiced jams; needs holiday gift box customizer."],
  ["Cottage Delight Staffordshire", "sales@cottagedelight.co.uk", "UK", "Leek, Staffordshire", "Cottage Delight Team (Directors)", "Handcrafted specialty foods curating festive dried fruit chutneys, shortbreads, and party nut selections; needs corporate gift hamper tool."],
  ["Rosebud Preserves North Yorkshire", "info@rosebudpreserves.co.uk", "UK", "Masham, North Yorkshire", "Elspeth Biltoft (Founder)", "Artisan preserves cooked in traditional open pans with wild orchard fruits and spices; needs luxury seasonal pre-order store."],
  ["Tyrrells English Hand-Cooked Crisps", "enquiries@tyrrellscrisps.co.uk", "UK", "Leominster, Herefordshire", "Tyrrells Team (Directors)", "Herefordshire farm crisps tumbled in sea salt, mature cheddar, and sweet roasted nut mixes; needs modern British snack storefront."],
  ["Pipers Crisps Lincolnshire", "orders@piperscrisps.com", "UK", "Brigg, Lincolnshire", "Pipers Management (Directors)", "Artisan British crisps seasoned with Anglesey sea salt and rosemary, perfect for pub nut pairing; needs hospitality ordering portal."],
  ["Burts Snacks Devon England", "info@burtssnacks.com", "UK", "Plymouth, Devon", "Dave McNulty (Managing Director)", "Handmade Devon artisan thick cut crisps and roasted savory nut mixes; needs modern responsive retail presence."],
  ["Two Farmers Hand-Cooked Crisps", "info@twofarmers.co.uk", "UK", "Peterstow, Herefordshire", "Mark Green & Sean Mason (Founders)", "Pioneering 100% compostable packet crisps made with Herefordshire potatoes and orchard apples; needs eco-snack subscription shop."],

  // --- India Artisan Coffee Roasters, Chocolatiers & Bakers ---
  ["Blue Tokai Coffee Roasters", "getcoffee@bluetokaicoffee.com", "India", "Gurgaon, Haryana", "Matt Chitharanjan (Co-Founder)", "Pioneering Indian specialty coffee roastery pairing estate coffees with roasted nut granolas and almond croissants; needs corporate coffee & nut gift builder."],
  ["Third Wave Coffee Roasters", "hello@thirdwavecoffeeroasters.com", "India", "Bengaluru, Karnataka", "Sushant Goel (Co-Founder)", "Fast-growing specialty coffee chain serving roasted almond cold brews and dry fruit pastries; needs online merchandise & bean portal."],
  ["Sleepy Owl Coffee Cold Brew", "hello@sleepyowl.co", "India", "New Delhi", "Ajai Thandi (Co-Founder)", "Pioneering cold brew coffee bags, hazelnut brews, and chocolate roasted nut treats; needs dynamic subscription storefront."],
  ["Vahdam India Teas & Spices", "help@vahdam.com", "India", "New Delhi", "Bala Sarda (Founder)", "Direct-from-source single-estate Darjeeling teas, saffron, and celebratory dry fruit gift boxes; needs international holiday gift hamper portal."],
  ["Teabox Fresh Indian Teas", "help@teabox.com", "India", "Siliguri, West Bengal", "Kaushal Dugar (Founder)", "Vacuum-sealed whole leaf Darjeeling and Assam teas paired with roasted cashew gift sets; needs luxury direct-to-consumer store."],
  ["SMOOR True Chocolates India", "info@smoor.in", "India", "Bengaluru, Karnataka", "Vimal Sharma (Founder)", "Luxury artisanal chocolatier crafting dark chocolate almond rocks, cashew pralines, and festive dry fruit boxes; needs bespoke corporate gift builder."],
  ["Theobroma Patisserie Mumbai", "contact@theobroma.in", "India", "Mumbai, Maharashtra", "Kainaz Messman (Founder)", "Legendary Parsi bakery famed for walnut brownies, chocolate almond cakes, and roasted nut tarts; needs modern online bakery ordering app."],
  ["Le15 Patisserie & Macarons", "contact@le15.com", "India", "Mumbai, Maharashtra", "Pooja Dhingra (Pastry Chef & Founder)", "India's macaron queen crafting hazelnut macarons, almond cookies, and gourmet hot chocolate; needs modern celebratory gift boutique."],
  ["Paul And Mike Craft Chocolates", "info@paulandmike.co", "India", "Kochi, Kerala", "Vikas Temani (Founder)", "International award-winning bean-to-bar chocolate maker pairing single-origin cacao with roasted pistachios and dried mango; needs luxury gift crate shop."],
  ["Subko Coffee Roasters Mumbai", "info@subko.coffee", "India", "Mumbai, Maharashtra", "Rahul Reddy (Founder)", "Specialty coffee roastery and craft bakehouse celebrating Indian provenance with walnut babkas and cardamom roasted nuts; needs luxury VIP boutique."],
  ["Araku Coffee Sustainable Estate", "support@arakucoffee.in", "India", "Bengaluru, Karnataka", "Manoj Kumar (CEO)", "Regenerative tribal-farmed organic specialty coffee paired with Andhra roasted cashews; needs international luxury storefront."],
  ["Choko La Fine Chocolates Delhi", "customercare@chokola.in", "India", "New Delhi", "Vasudha Munjal (Founder)", "Artisan chocolate atelier creating roasted almond florentines, hazelnut spreads, and chocolate bonbons; needs festive holiday gift builder."],
  ["Entisi Chocolatier Mumbai", "info@entisi.com", "India", "Mumbai, Maharashtra", "Nikki Thakker (Founder)", "Contemporary chocolate atelier crafting hazelnut dragees, roasted pistachio bars, and luxury gift boxes; needs interactive gift tin configurator."]
];

console.log(`Evaluating newBatch2: ${newBatch2.length} candidates...`);

const candidatesToTest = [];
for (const c of newBatch2) {
  const email = c[1].toLowerCase().trim();
  if (sentSet.has(email) || prevSet.has(email)) continue;
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

const passed2 = candidatesToTest.filter(c => validDomains.has(c[1].split("@")[1]));
console.log(`Passed MX in batch 2: ${passed2.length}`);

// Combine with prevExpansion
const combined = [...prevExpansion, ...passed2];
console.log(`Total accumulated verified in scratch: ${combined.length}`);
writeFileSync("scratch_passed_expansion.json", JSON.stringify(combined, null, 2), "utf8");
