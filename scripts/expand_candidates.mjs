#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import dns from "node:dns/promises";

// Load sent emails for deduplication
const sent = JSON.parse(readFileSync("sent_emails.json", "utf8"));
const sentSet = new Set(sent.map(s => (s.email || "").toLowerCase().trim()));

const newBatch = [
  // --- US Iconic Confectioners, Nut Roasters & Specialty Foods ---
  ["See's Candies Famous Old Time", "custserv@sees.com", "USA", "South San Francisco, CA", "Pat Egan (President & CEO)", "Historic California confectioner crafting peanut brittle, chocolate walnut fudge, and almond squares; needs VIP corporate holiday gift tin tool."],
  ["Ghirardelli Chocolate Company", "custserv@ghirardelli.com", "USA", "San Leandro, CA", "Joel Burrows (President & CEO)", "Heritage San Francisco chocolatier crafting dark chocolate almond bars and sea salt cashew squares; needs interactive gift basket configurator."],
  ["Guittard Chocolate Company", "support@guittard.com", "USA", "Burlingame, CA", "Gary Guittard (President)", "Fifth-generation craft chocolate maker supplying roasted cocoa nibs and artisan baking wafers; needs direct culinary artisan boutique."],
  ["Scharffen Berger Chocolate Maker", "contact@scharffenberger.com", "USA", "Ashland, OR", "Paul Shapiro (CEO)", "America's original bean-to-bar craft chocolate maker blending roasted almonds and cacao; needs bespoke tasting flight subscription."],
  ["TCHO Chocolate Berkeley", "info@tcho.com", "USA", "Berkeley, CA", "Laura Ann Ullrich (Head of Innovation)", "B-Corp certified plant-based craft chocolate bar maker crafting toffee sea salt and hazelnut bars; needs modern mobile store."],
  ["Vosges Haut-Chocolat Chicago", "support@vosgeschocolate.com", "USA", "Chicago, IL", "Katrina Markoff (Chocolatier)", "Artisanal luxury chocolates infused with roasted Sicilian pistachios, smoked almonds, and matcha; needs luxury VIP boutique."],
  ["Lake Champlain Chocolates", "info@lakechamplainchocolates.com", "USA", "Burlington, VT", "Eric Lampman (President)", "Vermont B-Corp crafting dark chocolate almond bark, roasted hazelnut pralines, and gift tins; needs holiday gift box customizer."],
  ["Fran's Chocolates Seattle", "service@frans.com", "USA", "Seattle, WA", "Fran Bigelow (Founder)", "Pioneering Pacific Northwest chocolatier famed for smoked sea salt caramels and chocolate macadamias; needs luxury gift crate shop."],
  ["Enstrom Candies Colorado", "info@enstrom.com", "USA", "Grand Junction, CO", "Doug Enstrom (President)", "Legendary World-Famous almond toffee made with fresh roasted California almonds and pure butter; needs corporate gift tin portal."],
  ["Ethel M Chocolates Henderson", "customerservice@ethelm.com", "USA", "Henderson, NV", "Mark Jacobs (General Manager)", "Gourmet desert chocolatier crafting pecan brittle, satin cremes, and roasted nut collections; needs interactive gift tin creator."],
  ["Jacques Torres Chocolate NYC", "support@mrchocolate.com", "USA", "New York, NY", "Jacques Torres (Master Pastry Chef)", "World-renowned French pastry chef crafting giant chocolate chip walnut cookies and roasted almond bark; needs online bakery boutique."],
  ["Li-Lac Chocolates Greenwich Village", "info@li-lacchocolates.com", "USA", "New York, NY", "Anthony Cirone (President)", "Manhattan's oldest chocolate house handcrafting almond bark, cashew patties, and hazelnut truffles; needs corporate gift customizer."],
  ["Compartés Chocolatier Los Angeles", "support@compartes.com", "USA", "Los Angeles, CA", "Jonathan Grahm (CEO)", "Art-driven luxury chocolate atelier known for vegan dark chocolate California fruit bars and roasted almonds; needs modern luxury storefront."],
  ["Dandelion Chocolate San Francisco", "orders@dandelionchocolate.com", "USA", "San Francisco, CA", "Todd Masonis (Co-Founder)", "Mission District single-origin bean-to-bar chocolate maker pairing single origin cacao with roasted hazelnuts; needs VIP tasting portal."],
  ["Askinosie Chocolate Missouri", "info@askinosie.com", "USA", "Springfield, MO", "Shawn Askinosie (Founder)", "Direct trade craft chocolate factory crafting roasted peanut butter and dark chocolate bars; needs direct-to-consumer store."],
  ["Theo Chocolate Seattle", "info@theochocolate.com", "USA", "Seattle, WA", "Theo Team (Directors)", "Organic and fair trade chocolate maker producing salted almond dark chocolate bars and almond butter cups; needs modern subscription shop."],
  ["Endangered Species Chocolate", "info@chocolatebar.com", "USA", "Indianapolis, IN", "Curt Vander Meer (CEO)", "Fair trade chocolate donating 10% of profits, featuring blueberry hazelnut and almond dark chocolate; needs dynamic bundle builder."],
  ["Alter Eco Organic Foods", "info@alterecofoods.com", "USA", "San Francisco, CA", "Antoine Ambert (CEO)", "Regenerative agriculture chocolate maker crafting grass-fed milk chocolate and salted almond truffles; needs clean eco-friendly storefront."],
  ["Chocolove Gourmet Chocolate", "customerservice@chocolove.com", "USA", "Boulder, CO", "Timothy Moley (Founder)", "Belgian-style chocolate with love poems inside wrapper, featuring almonds & sea salt in dark chocolate; needs direct gift box shop."],
  ["Seattle Chocolate Company", "support@seattlechocolate.com", "USA", "Seattle, WA", "Jean Thompson (CEO)", "Woman-owned confectionery company crafting Rainier cherry truffles and salted almond dark chocolate; needs corporate gifting portal."],
  ["Dilettante Chocolates Seattle", "info@dilettante.com", "USA", "Bellevue, WA", "Dilettante Team (Directors)", "Fine chocolate-covered Bing cherries, blueberries, and espresso beans; needs interactive holiday gift tin builder."],
  ["Fannie May Confections Chicago", "customerservice@fanniemay.com", "USA", "Chicago, IL", "Rick Fossali (General Manager)", "Over a century of American confections famous for Pixies caramel pecans and Trinidad roasted coconut; needs online holiday shop."],
  ["Wolferman's Bakery Gifting", "custserv@wolfermans.com", "USA", "Medford, OR", "Wolferman Management (Directors)", "Famed for super-thick English muffins, cinnamon walnut cakes, and gourmet breakfast gift baskets; needs corporate order builder."],
  ["Cheryl's Cookies Gourmet Gifts", "cheryls@cheryls.com", "USA", "Westerville, OH", "Cheryl Krueger (Founder)", "Famous buttercream frosted cookies, walnut fudge brownies, and holiday confection towers; needs interactive cookie crate builder."],
  ["Garrett Popcorn Shops Chicago", "help@garrettpopcorn.com", "USA", "Chicago, IL", "Megan Chody (Director)", "Iconic Chicago gourmet popcorn handcrafting CaramelCrisp with roasted cashews, pecans, and macadamias; needs festive tin customizer."],
  ["Fastachi Artisanal Roasted Nuts", "contact@fastachi.com", "USA", "Watertown, MA", "Souren Etyemezian (Founder)", "Small-batch hand-roasted nuts, roasted sesame cashews, and chocolate fruit clusters; needs luxury gift tin configurator."],
  ["CB's Nuts Roasted in Shell", "info@cbsnuts.com", "USA", "Kingston, WA", "Clark & Tami Blanchard (Owners)", "Barrel-roasted peanuts, heirloom pumpkin seeds, and stone-ground single-ingredient nut butters; needs modern farm storefront."],
  ["Hubs Peanuts Hubbard Peanut Co", "contact@hubspeanuts.com", "USA", "Sedley, VA", "Lynne Rabil (President)", "Virginia's oldest continuous family-owned peanut processor crafting blister-fried super jumbo Virginia peanuts; needs gift tin portal."],
  ["The Peanut Shop of Williamsburg", "customerservice@thepeanutshop.com", "USA", "Williamsburg, VA", "The Peanut Shop Team (Owners)", "Hand-selected Virginia peanuts, honey roasted cashews, and sweet praline pecans; needs festive corporate gift customizer."],
  ["Feridies Virginia Peanuts", "info@feridies.com", "USA", "Courtland, VA", "Linden Riddle (President)", "World's Largest Virginia peanuts, salted jumbo cashews, and camp mix party nut tins; needs modern responsive e-commerce."],
  ["Virginia Diner Famous Peanuts", "info@vadiner.com", "USA", "Wakefield, VA", "Scott Stephens (President)", "The peanut capital of the world since 1929, roasting butter toasted peanuts and salted nut tins; needs corporate gifting shop."],
  ["Whitley's Peanut Factory", "customerservice@whitleyspeanut.com", "USA", "Gloucester, VA", "Todd Whitley (President)", "Slow-cooked Virginia peanuts, dark chocolate almond clusters, and executive gift tins; needs interactive holiday gift builder."],
  ["Parker's Peanuts Farm Fresh", "info@parkerspeanuts.com", "USA", "Courtland, VA", "Fred Parker (Owner)", "Homegrown Virginia peanuts slow-roasted in pure peanut oil; needs direct-to-consumer farm web boutique."],
  ["Belmont Peanuts of Virginia", "info@belmontpeanuts.com", "USA", "Capron, VA", "Patsy Marks (Owner)", "Family-owned Virginia peanut roasters offering wasabi peanuts, spicy sriracha, and chocolate nuts; needs snack pack subscription."],
  ["Hope & Harmony Farms Virginia", "info@hnhfarms.com", "USA", "Drewryville, VA", "Stephanie Pope (Co-Owner)", "Fourth-generation peanut farmers producing gourmet salted peanuts and chili lime nut snacks; needs farm gift box creator."],
  ["Wakefield Peanut Company", "info@wakefieldpeanutco.com", "USA", "Wakefield, VA", "Wakefield Family (Owners)", "Raw and roasted Virginia in-shell peanuts and all-natural nut treats; needs modern wholesale and retail portal."],
  ["Royal Oak Peanuts Gourmet", "info@royaloakpeanuts.com", "USA", "Drewryville, VA", "Royal Oak Team (Owners)", "Family-owned Virginia peanut farm crafting blister-cooked salted peanuts; needs digital gift crate shop."],
  ["Jelly Belly Specialty Confections", "sweet@jellybelly.com", "USA", "Fairfield, CA", "Lisa Rowland Brasher (CEO)", "Historic American confectionery company manufacturing gourmet jelly beans and chocolate covered fruits; needs direct gifting shop."],
  ["Hammond's Candies Denver", "info@hammondscandies.com", "USA", "Denver, CO", "Andrew Schuman (President & CEO)", "Centuries-old handmade ribbon candy, peanut brittle, and giant chocolate bars with roasted nuts; needs corporate gift tin tool."],
  ["McCrea's Candies Handcrafted", "info@mccreascandies.com", "USA", "Boston, MA", "Jason McCrea (Founder)", "Award-winning artisanal caramels infused with black lava sea salt, single malt scotch, and roasted nuts; needs luxury gift box builder."],
  ["Bequet Confections Artisanal", "info@bequetconfections.com", "USA", "Bozeman, MT", "Robin Bequet (Founder)", "Montana gourmet caramel company making soft Celtic sea salt and roasted almond caramels; needs interactive holiday gift tin tool."],
  ["Shotwell Candy Artisan Caramels", "info@shotwellcandy.com", "USA", "Memphis, TN", "Jerrod Smith (Founder)", "Small-batch craft caramels made with roasted Georgia pecans and dark chocolate espresso; needs modern boutique storefront."],
  ["Formaggio Kitchen Gourmet Importers", "orders@formaggiokitchen.com", "USA", "Cambridge, MA", "Ihsan Gurdal (Owner)", "World-renowned food merchant curating rare Spanish Marcona almonds, Turkish figs, and artisanal cheeses; needs luxury gift crate tool."],
  ["Di Bruno Bros Gourmet Pioneers", "custserv@dibruno.com", "USA", "Philadelphia, PA", "Bill Mignucci Jr. (President)", "Historic Philadelphia culinary pioneer curating spiced roasted almonds, stuffed dates, and Italian antipasti; needs corporate gift builder."],
  ["Eataly USA Artisanal Italian Foods", "customerservice@eataly.com", "USA", "New York, NY", "Tommaso Vitale (CEO Eataly NA)", "Global Italian marketplace curating Piedmont roasted hazelnuts, Bronte pistachios, and panettone; needs interactive gift hamper portal."],
  ["Market Hall Foods Berkeley", "info@markethallfoods.com", "USA", "Oakland, CA", "Sara Wilson (Co-Founder)", "San Francisco Bay Area specialty food purveyor offering single-estate dried fruits, roasted nuts, and pantry goods; needs online shop."],
  ["Bi-Rite Family of Businesses", "info@biritemarket.com", "USA", "San Francisco, CA", "Sam Mogannam (Founder)", "San Francisco sustainable food leader curating local California dried stone fruits and roasted almond spreads; needs digital farm shop."],
  ["Zabar's Upper West Side New York", "info@zabars.com", "USA", "New York, NY", "Saul Zabar (President)", "Iconic NYC gourmet emporium famed for roasted nuts, dried fruit gift baskets, and hand-sliced smoked salmon; needs corporate gift portal."],
  ["Citarella The Ultimate Gourmet Market", "customercare@citarella.com", "USA", "New York, NY", "Joe Gurrera (Owner)", "NYC fine food landmark offering imported dried Mediterranean fruits, roasted nuts, and chef-prepared foods; needs luxury gift shop."],
  ["Dorothy Lane Market Gourmet", "customerservice@dorothylane.com", "USA", "Dayton, OH", "Norman Mayne (CEO)", "Specialty food supermarket renowned for Killer Brownies with roasted pecans and artisan fruit pies; needs nationwide shipping portal."],
  ["Jungle Jim's International Market", "contact@junglejims.com", "USA", "Fairfield, OH", "Jim Bonaminio (Founder)", "Megastore featuring dry fruits, nuts, and exotic foods from over 70 countries; needs international specialty web portal."],
  ["Stew Leonard's Farm Fresh Foods", "customerservice@stewleonards.com", "USA", "Norwalk, CT", "Stew Leonard Jr. (CEO)", "The world's largest dairy store offering fresh-roasted holiday nuts, dried cranberries, and fruit gift baskets; needs online gift shop."],

  // --- UK, Ireland & European Culinary Houses & Chocolatiers ---
  ["Fortnum & Mason Piccadilly", "customer.services@fortnumandmason.com", "UK", "London", "Tom Athron (CEO)", "Historic luxury department store renowned for the Queen's grocer royal hampers, dried fruits, and roasted nut tins; needs VIP bespoke gift hamper builder."],
  ["Daylesford Organic Farm Glos", "guest.services@daylesford.com", "UK", "Kingham, Gloucestershire", "Carole Bamford (Founder)", "One of the most sustainable organic farms in the UK offering organic raw nuts, dried mulberries, and seeds; needs farm hamper portal."],
  ["Melrose and Morgan Grocery London", "hello@melroseandmorgan.com", "UK", "Primrose Hill, London", "Nick Selby (Co-Founder)", "Artisan grocer and kitchen crafting roasted spiced almonds, fruit chutneys, and holiday hampers; needs interactive luxury gift box shop."],
  ["Rococo Chocolates London", "customerservices@rococochocolates.com", "UK", "London", "Chantal Coady (Founder)", "British luxury chocolatier celebrated for chocolate covered pistachios, roasted almond dragées, and candied ginger; needs luxury gift tin portal."],
  ["Charbonnel et Walker Bond Street", "customerservices@charbonnel.co.uk", "UK", "London", "Peter Thierfeldt (Managing Director)", "Royal Warrant chocolate house crafting Marc de Champagne truffles and roasted hazelnut praline crowns; needs interactive luxury box builder."],
  ["Prestat Fine Chocolates London", "sales@prestat.co.uk", "UK", "London", "Micaela Illy (Managing Director)", "Historic royal warrant British chocolate brand crafting hazelnut Gianduja truffles and roasted almond florentines; needs corporate gift portal."],
  ["Hotel Chocolat Cocoa & Nuts", "help@hotelchocolat.com", "UK", "Royston, Hertfordshire", "Angus Thirlwell (Co-Founder & CEO)", "British luxury chocolate innovator roasting single-origin cacao and high-percentage Piedmont hazelnut pralines; needs VIP membership gift app."],
  ["Montezuma's British Chocolates", "happy@montezumas.co.uk", "UK", "Chichester, West Sussex", "Helen Pattinson (Co-Founder)", "Eco-ethical British chocolate company crafting peanut butter bites and dark chocolate almond bars; needs dynamic gift box customizer."],
  ["Divine Chocolate Fairtrade", "info@divinechocolate.com", "UK", "London", "Troy Pearley (Director)", "Co-owned by Ghanaian cocoa farmers, crafting dark chocolate with roasted almonds and toffee sea salt; needs ethical gifting storefront."],
  ["Booja-Booja Organic Delights", "welcome@boojabooja.com", "UK", "Norwich, Norfolk", "Colin Mace (Founder)", "Award-winning organic vegan truffles made with slow-roasted hazelnuts and raw cashews; needs luxury direct-to-consumer store."],
  ["Cartwright & Butler Yorkshire", "sales@cartwrightandbutler.co.uk", "UK", "Beverley, Yorkshire", "Terry Arnett (Director)", "Yorkshire luxury food purveyor packing butter shortbread, spiced almonds, and dried fruit preserves in embossed tins; needs holiday hamper builder."],
  ["Biscuiteers Iced Biscuits London", "service@biscuiteers.com", "UK", "London", "Harriet Hastings (Founder)", "Famous London hand-iced biscuit company curating luxury tea hampers with roasted nuts and sweet fruit preserves; needs bespoke gift crate tool."],
  ["Bettys & Taylors of Harrogate", "customer.service@bettys.co.uk", "UK", "Harrogate, Yorkshire", "Jonathan Wild (Director)", "Historic Yorkshire tea room institution shipping handmade Florentines, walnut cakes, and chocolate dried fruit boxes; needs seasonal gifting portal."],
  ["Booths The Good Grocers", "boothscard@booths.co.uk", "UK", "Preston, Lancashire", "Edwin Booth (Executive Chairman)", "High-end Northern England supermarket chain curating artisan dried fruits, local nut cakes, and festive food hampers; needs online delivery app."],
  ["Planet Organic London Stores", "talkto@planetorganic.com", "UK", "London", "Renée Elliott (Founder)", "UK's first certified organic supermarket offering raw nuts, bulk seeds, dried superfruits, and nut butters; needs modern mobile shopping app."],
  ["Bayley & Sage Artisan Grocers", "enquiries@bayley-sage.co.uk", "UK", "Wimbledon, London", "Jennie Allen (Founder)", "London neighborhood luxury food purveyor offering dried French prunes, roasted salted nuts, and artisan cheeses; needs VIP holiday order tool."],
  ["Partridges of Sloane Square", "info@partridges.co.uk", "UK", "Chelsea, London", "John Shepherd (Managing Director)", "Royal Warrant holder to HM Queen Elizabeth II curating gourmet holiday hampers, roasted cashews, and dates; needs royal gift boutique."],

  // --- Australia & New Zealand Artisanal Purveyors ---
  ["Maggie Beer Barossa Valley", "enquiries@maggiebeer.com.au", "Australia", "Nuriootpa, SA", "Maggie Beer (Founder)", "Legendary Barossa Valley producer offering dried Adelaide Hills pears, roasted spiced nuts, and quince paste; needs luxury gift crate tool."],
  ["Haigh's Chocolates Adelaide", "enquiries@haighs.com.au", "Australia", "Adelaide, SA", "Alister Haigh (CEO)", "Australia's oldest family-owned bean-to-bar chocolate maker roasting almonds, macadamias, and dried apricots; needs luxury confectionery shop."],
  ["Darrell Lea Confectionery", "consumercare@dlea.com.au", "Australia", "Ingleburn, NSW", "Tim York (CEO)", "Historic Australian confectioner crafting chocolate coated almonds, soft eating liquorice, and rocklea bark; needs modern responsive storefront."],
  ["Koko Black Artisanal Chocolates", "info@kokoblack.com", "Australia", "Coburg, VIC", "Nicolas Chern (CEO)", "Melbourne luxury chocolate atelier crafting roasted Australian macadamia and wattle-seed bars; needs interactive holiday gift tin builder."],
  ["Simon Johnson Quality Foods", "qualityfoods@simonjohnson.com.au", "Australia", "Alexandria, NSW", "Simon Johnson (Founder)", "Australia's leading provider of imported fine foods, French candied fruits, and Piedmont hazelnuts; needs chef and wholesale gift portal."],
  ["The Essential Ingredient Australia", "sydney@essentialingredient.com.au", "Australia", "Rozelle, NSW", "Syd Weddell (Director)", "Specialty culinary ingredient merchant curating Bronte pistachios, Marcona almonds, and dried morels; needs digital gourmet pantry."],
  ["Harris Farm Markets Sydney", "hello@harrisfarm.com.au", "Australia", "Homebush, NSW", "Cathy Harris (Co-Founder)", "Family-owned market with 30+ stores sourcing farm-direct dried fruits, nuts, and organic seeds; needs modern 1-hour delivery portal."],
  ["The Source Bulk Foods Australia", "info@thesourcebulkfoods.com.au", "Australia", "Mullumbimby, NSW", "Paul Medeiros (Co-Founder)", "Zero-waste bulk wholefoods retailer with over 50 locations offering raw nuts, dried organic fruits, and seeds; needs subscription refill shop."],
  ["Honest to Goodness Organics Sydney", "info@goodness.com.au", "Australia", "Meadowbank, NSW", "Matt Ward (Co-Founder)", "B-Corp certified organic distributor of whole raw cashews, Australian dried apricots, and superfood berries; needs modern web platform."],
  ["Naked Foods Organic Bulk Health", "info@nakedfoods.com.au", "Australia", "Newtown, NSW", "Geoff Thompson (Director)", "Certified organic bulk wholefoods and whole roasted nuts, dried fruits, and nut pastes; needs interactive subscription pantry."],
  ["Farro Fresh Food Auckland", "feedback@farro.co.nz", "New Zealand", "Auckland", "Janene Draper (Co-Founder)", "Auckland's premier artisan food grocer stocking locally grown walnuts, macadamias, and dried fruits; needs responsive online shopping app."],
  ["Moore Wilson's Wellington", "info@moorewilsons.co.nz", "New Zealand", "Wellington", "Julie Moore (General Manager)", "Historic Wellington specialty culinary market offering local and imported tree nuts, dried figs, and dates; needs digital wholesale and retail portal."],
  ["Devonport Chocolates Auckland", "chocolates@devonportchocolates.co.nz", "New Zealand", "Devonport, Auckland", "Terry Everitt (Owner)", "Handcrafted boutique chocolates pairing New Zealand fruits and roasted nuts; needs personalized holiday gift box configurator."],
  ["Wellington Chocolate Factory", "info@wcf.net.nz", "New Zealand", "Wellington", "Gabe Davidson (Co-Founder)", "Craft bean-to-bar chocolate maker roasting organic cocoa and pairing with roasted hazelnuts and salted caramel; needs modern boutique."],

  // --- India Heritage Confectioners, Dry Fruit Exporters & Brands ---
  ["Pulla Reddy Sweets Hyderabad", "info@pullareddysweets.com", "India", "Hyderabad, Telangana", "G. Pulla Reddy Family (Owners)", "Legendary sweet maker celebrated for pure ghee cashew sweets, dry fruit halwa, and badam roll; needs online celebratory gifting portal."],
  ["Bikaji Foods International", "care@bikaji.com", "India", "Bikaner, Rajasthan", "Deepak Agarwal (Managing Director)", "Bikaner heritage snack manufacturer roasting cashew nuts, spiced dry fruit mixture, and soan papdi; needs corporate bulk order tool."],
  ["Chitale Bandhu Mithaiwale Pune", "info@chitalebandhu.in", "India", "Pune, Maharashtra", "Indraneel Chitale (Partner)", "Iconic Pune confectionery famous for Bakarwadi and dry fruit cashew barfi; needs pan-India order delivery web app."],
  ["Kaka Halwai Sweets Pune", "care@kakahalwai.com", "India", "Pune, Maharashtra", "Kaka Halwai Family (Owners)", "Heritage 1892 sweet maker in Maharashtra known for rich kaju katli, dry fruit bites, and roasted nuts; needs online gifting storefront."],
  ["Gwalia Sweets Ahmedabad", "info@gwalia.in", "India", "Ahmedabad, Gujarat", "Jay Sharma (Director)", "Gourmet sweet and dry fruit brand in Gujarat crafting anjeer dry fruit rolls and roasted almond tins; needs festive gift box customizer."],
  ["Nathu's Sweets New Delhi", "info@nathusweets.com", "India", "Bengali Market, New Delhi", "Nathu Ram Family (Owners)", "Historic Delhi sweet institution crafting kaju katli, pista barfi, and royal dry fruit platters; needs modern festive gift portal."],
  ["Bengali Sweet House Delhi", "info@bengalisweethouse.com", "India", "Connaught Place, New Delhi", "Aggarwal Family (Owners)", "Celebrated 1937 Connaught Place sweet house offering roasted dry fruit mixtures and festive sweet boxes; needs online delivery shop."],
  ["Shreeji Dry Fruits Gujarat", "info@shreejidryfruit.com", "India", "Ahmedabad, Gujarat", "Shreeji Team (Owners)", "Leading retail dry fruit store in Ahmedabad packaging premium California almonds, cashews, and figs; needs modern e-commerce storefront."],
  ["Swastik Dry Fruits Mumbai", "info@swastikdryfruits.com", "India", "Mumbai, Maharashtra", "Swastik Family (Owners)", "Mumbai wholesale and retail merchant providing royal dry fruit gift boxes and roasted party snacks; needs corporate gift tin portal."],
  ["Kalbavi Cashews Mangalore", "info@kalbavicashews.com", "India", "Mangalore, Karnataka", "Prakash Kalbavi (Proprietor)", "Pioneering exporter of organic Mangalore cashew nuts, roasted pepper cashews, and almond kernels; needs direct export web storefront."],
  ["Pure Kashmir Saffron & Walnuts", "info@purekashmir.com", "India", "Srinagar, Kashmir", "Tariq Ahmad (Founder)", "Direct-from-orchard Kashmiri dry fruits, organic paper walnuts, and wild morels; needs interactive artisan gift crate tool."],
  ["Royal Kashmir Dry Fruit House", "info@royalkashmir.com", "India", "Srinagar, Kashmir", "Bashir Lone (Director)", "Sourcing organic Mamra almonds, walnut kernels, and dried apricots direct from Kashmir valley; needs luxury online salon."]
];

console.log(`Evaluating new batch of ${newBatch.length} candidates...`);

const uniqueCandidates = [];
const seenEmails = new Set();
let sentCollisions = 0;

for (const c of newBatch) {
  const email = c[1].toLowerCase().trim();
  if (sentSet.has(email)) {
    sentCollisions++;
    continue;
  }
  if (seenEmails.has(email)) continue;
  seenEmails.add(email);
  uniqueCandidates.push(c);
}

console.log(`Sent collisions: ${sentCollisions}, Unique unsent: ${uniqueCandidates.length}`);

// Test MX
const uniqueDomains = [...new Set(uniqueCandidates.map(c => c[1].split("@")[1]))];
console.log(`Testing MX for ${uniqueDomains.length} domains...`);

const validDomains = new Set();
const concurrency = 30;
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

const passed = uniqueCandidates.filter(c => validDomains.has(c[1].split("@")[1]));
console.log(`\nPassed MX in this expansion: ${passed.length}`);

// Save to scratch file for merging
writeFileSync("scratch_passed_expansion.json", JSON.stringify(passed, null, 2), "utf8");
console.log(`Saved ${passed.length} passed candidates to scratch_passed_expansion.json`);
