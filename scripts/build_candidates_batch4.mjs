#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import dns from "node:dns/promises";

// Load sent emails for strict deduplication
const sent = JSON.parse(readFileSync("sent_emails.json", "utf8"));
const sentSet = new Set(sent.map(s => (s.email || "").toLowerCase().trim()));
console.log(`Loaded ${sentSet.size} previously sent emails for deduplication.`);

// Raw candidate pools: real dry fruit, nut, date, berry, and gourmet food businesses
const rawCandidates = [
  // --- US Pecan, Almond, Walnut & Hazelnut Growers/Roasters ---
  ["Pearson Farm Pecans & Peaches", "info@pearsonfarm.com", "USA", "Fort Valley, GA", "Lawton Pearson (Owner)", "Centuries-old peach and Georgia pecan orchard; needs an interactive seasonal corporate gift tin builder."],
  ["Sunnyland Farms Gourmet Pecans", "info@sunnylandfarms.com", "USA", "Albany, GA", "Alex Willson (President)", "Direct-from-farm Georgia pecans, macadamias, and dried fruits; needs luxury holiday gift box customizer."],
  ["Chukar Cherries Pacific Northwest", "customerservice@chukar.com", "USA", "Prosser, WA", "Pam Montgomery (Founder)", "Artisanal Washington dried Bing cherries and chocolate-covered nut confections; needs VIP membership gift portal."],
  ["Bella Viva Orchards Dried Fruit", "sales@bellaviva.com", "USA", "Denair, CA", "Victor Martino (Founder)", "California sun-dried stone fruits, heirloom almonds, and dried persimmons; needs custom gift tray customizer."],
  ["Bergin Fruit and Nut Company", "info@berginfruitandnut.com", "USA", "Vadnais Heights, MN", "Tom Bergin (President)", "Roasting specialty nuts, organic trail mixes, and chocolate covered fruits; needs seamless online ordering shop."],
  ["Sohnrey Family Foods Almonds", "info@sohnreyfamilyfoods.com", "USA", "Oroville, CA", "Andrew Sohnrey (Co-Owner)", "Fifth-generation Sacramento Valley almond and walnut growers; needs direct-to-consumer gift box shop."],
  ["Ellis Bros Pecans & Candies", "info@pecancompany.com", "USA", "Vienna, GA", "Keith Ellis (Co-Owner)", "South Georgia orchard harvesting roasted salted pecans and pecan brittles; needs automated corporate order checkout."],
  ["Durham-Ellis Pecan Co", "sales@durhampecan.com", "USA", "Comanche, TX", "Kenneth Ellis (President)", "Texas grower providing shelled pecans, candied nut halves, and gift tins; needs modern mobile commerce store."],
  ["Royalty Pecan Farms", "info@royalpecan.com", "USA", "Caldwell, TX", "Michael Bratcher (General Manager)", "Texas Brazos River orchard producing estate pecans and pecan oils; needs interactive tasting box builder."],
  ["Oliver Pecan Co", "info@oliverpecan.com", "USA", "San Saba, TX", "Oliver Family (Owners)", "San Saba Texas pecan specialists roasting honey glazed pecans; needs holiday gift hamper customizer."],
  ["Golden Kernel Pecan Co", "info@goldenkernel.com", "USA", "Cameron, SC", "Peter Fairey (President)", "Historic South Carolina pecan sheller crafting gourmet roasted tins; needs modern web store with multi-shipping."],
  ["Young Plantations Gourmet Gifts", "info@youngplantations.com", "USA", "Florence, SC", "Dan Bacot (General Manager)", "Carolina grower offering chocolate pecans and dried fruit party trays; needs interactive festive gift tin creator."],
  ["Cane River Pecan Company", "service@caneriverpecan.com", "USA", "New Iberia, LA", "Jady Regard (Chief Nut Officer)", "Louisiana specialty pecan purveyor creating executive gift tins; needs seamless corporate spreadsheet uploader."],
  ["Hudson Pecan Company", "info@hudsonpecan.com", "USA", "Ocilla, GA", "Randy Hudson (CEO)", "Georgia family pecan operation exporting roasted halves and pecan flour; needs direct e-commerce shop."],
  ["San Saba Pecan Company", "sales@sansabapecan.com", "USA", "San Saba, TX", "Ken Myers (President)", "Pecan Capital of the World producer shipping gourmet fudge and roasted nuts; needs fast 1-click gift ordering."],
  ["Berdoll Pecan Candy & Farm", "info@berdollpecanfarm.com", "USA", "Cedar Creek, TX", "Jennifer Wammack (Owner)", "Famous Texas pecan farm known for freshly shelled pecans and pecan pies; needs nationwide corporate gifting store."],
  ["Ferris Nut Company Gourmet", "customerservice@ferrisnuts.com", "USA", "Grand Rapids, MI", "John Ferris (President)", "Roasting fine nuts, trail mixes, and dried cherries since 1924; needs automated snack subscription portal."],
  ["Germack Pistachio Company", "orders@germack.com", "USA", "Detroit, MI", "Frank Germack III (Owner)", "Oldest pistachio roaster in the USA crafting specialty nuts and coffees; needs luxury custom assortment builder."],
  ["Koeze Company Fine Nuts", "service@koeze.com", "USA", "Grand Rapids, MI", "Jeff Koeze (President)", "Crafting Cream-Nut peanut butter and glass jars of roasted cashews & macadamias; needs corporate holiday gift builder."],
  ["King Nut Companies", "customerservice@kingnut.com", "USA", "Solon, OH", "Martin Kanan (CEO)", "Aviation and retail nut supplier producing premium roasted snack mixes; needs direct B2B and B2C web shop."],
  ["Sincerely Nuts Online Gifting", "sales@sincerelynuts.com", "USA", "Clifton, NJ", "David Mizrahi (Founder)", "Direct online purveyor of raw nuts, dried organic berries, and seeds; needs modernized 1-page checkout."],
  ["Braga Organic Farms", "info@buyorganicnuts.com", "USA", "Madera, CA", "Mike Braga (Owner)", "Organic California almonds, pistachios, and walnuts straight from the orchard; needs farm subscription box portal."],
  ["ApricotKing Orchards", "info@apricotking.com", "USA", "Hollister, CA", "Patti Rossi (Owner)", "Santa Clara Valley heirloom Blenheim dried apricots and walnut mixes; needs artisan seasonal pre-order store."],
  ["Bazzini Gourmet Nuts & Confections", "info@bazzininuts.com", "USA", "Allentown, PA", "Rocco Fiore (President)", "Historic American nut roaster crafting salted cashews and chocolate almonds; needs custom corporate gift tin portal."],
  ["Torn & Glasser Nuts & Dried Fruit", "info@tornglasser.com", "USA", "Los Angeles, CA", "David Torn (President)", "Southern California premier roaster and packager of dried fruits and nuts; needs digital wholesale and gift builder."],
  ["Tierra Farm Organic Roasters", "info@tierrafarm.com", "USA", "Valatie, NY", "Todd Kletter (CEO)", "Certified organic, solar-powered roaster of nuts, seeds, and dried fruits; needs zero-waste refill & box subscription."],
  ["Woodstock Farms Foods", "info@woodstock-foods.com", "USA", "Providence, RI", "Michael Funk (Director)", "Organic non-GMO dried fruits, trail blends, and nut butters; needs modern responsive storefront."],
  ["Living Intentions Sprouted Snacks", "info@livingintentions.com", "USA", "San Rafael, CA", "Joshua Wand (Founder)", "Sprouted nuts, superfood trail mixes, and activated seed snacks; needs clean mobile-first e-commerce."],
  ["Go Raw Sprouted Seeds & Nuts", "info@goraw.com", "USA", "San Jose, CA", "Robert Freeland (Founder)", "Organic sprouted pumpkin seeds, flax snax, and raw fruit bites; needs dynamic snack bundle creator."],
  ["Made In Nature Organic Dried Fruit", "orders@madeinnature.com", "USA", "Boulder, CO", "Doug Reisner (CEO)", "USDA organic dried mango, dates, and dried figs; needs modern interactive consumer subscription store."],
  ["Sunfood Superfoods Dried Organics", "info@sunfood.com", "USA", "El Cajon, CA", "Robert McFarlane (CEO)", "Raw organic golden berries, goji berries, cashews, and superfoods; needs interactive nutritional shop."],
  ["Navitas Organics Plant Foods", "info@navitasorganics.com", "USA", "Novato, CA", "Zach Adelman (Founder)", "Organic dried golden berries, mulberries, and raw cacao trail blends; needs smooth direct web shop."],
  ["Terrasoul Superfoods Direct", "service@terrasoul.com", "USA", "Fort Worth, TX", "Dennis Batey (Co-Founder)", "Direct-sourcing organic raw cashews, dried figs, and superfood berries; needs subscription replenishment portal."],
  ["Wilderness Poets Handcrafted Foods", "info@wildernesspoets.com", "USA", "Ashland, OR", "John Roulac (Founder)", "Raw micro-batch stone ground nut butters and wild harvested berries; needs artisan gift collection builder."],
  ["Eden Foods Organic Provisions", "cs@edenfoods.com", "USA", "Clinton, MI", "Michael Potter (President)", "Pioneering organic producer of dried wild blueberries, tart cherries, and seeds; needs modern recipe & store portal."],
  ["Barney Butter Almond Craft", "info@barneybutter.com", "USA", "Fresno, CA", "Dawn Kelley (CEO)", "Non-GMO verified California almond butters and roasted almond snacks; needs interactive subscription shop."],
  ["Georgia Grinders Artisanal Butters", "info@georgiagrinders.com", "USA", "Atlanta, GA", "Jaime Foster (Founder)", "Small-batch roasted Georgia pecan, cashew, and almond nut butters; needs corporate gift pack builder."],
  ["Big Spoon Roasters Nut Butters", "info@bigspoonroasters.com", "USA", "Durham, NC", "Mark Overbay (Founder)", "Handcrafted fresh-roasted nut butters made with wild wildflower honey; needs tasting box gift set tool."],
  ["Once Again Nut Butter Organics", "info@onceagainnutbutter.com", "USA", "Nunda, NY", "Bob Rossi (General Manager)", "Employee-owned organic roasted nut and seed butter cooperative; needs interactive B2C pantry store."],
  ["Artisana Organics Raw Butters", "info@artisanaorganics.com", "USA", "Richmond, CA", "Ron Martinez (President)", "Raw organic walnut, pecan, cashew, and coconut butter purveyor; needs clean minimalist web shop."],
  ["NuttZo Multi-Nut Butters", "info@nuttzo.com", "USA", "San Diego, CA", "Danielle Dietz-LiVolsi (Founder)", "Seven nut and seed butter blends packed with roasted seeds; needs corporate snack box portal."],
  ["Wild Friends Nut Snack Foods", "info@wildfriendsfoods.com", "USA", "Portland, OR", "Keeley Tillotson (Co-Founder)", "Friendly plant-based peanut and almond nut butters; needs interactive build-a-pack subscription store."],
  ["Trail Butter Energy Blends", "info@trailbutter.com", "USA", "Portland, OR", "Jeff Boggess (Co-Founder)", "Nut butter blends designed for outdoor trail endurance athletes; needs athlete subscription shop."],
  ["Ground Up Nut Butters PDX", "hello@grounduppdx.com", "USA", "Portland, OR", "Julie Sullivan (Co-Founder)", "Vocational training company making cinnamon snickerdoodle cashew almond butters; needs custom gift box builder."],

  // --- Dates, Figs & Specialty California Orchards ---
  ["Oasis Date Gardens Organic", "info@oasisdate.com", "USA", "Thermal, CA", "Mark Mendenhall (General Manager)", "Organic Medjool dates and date confections from the Coachella desert; needs modern holiday gift crate shop."],
  ["Shields Date Garden Historic", "info@shieldsdategarden.com", "USA", "Indio, CA", "Shields Family (Owners)", "Historic 1924 Coachella Valley date garden offering Deglet Noor and date crystal shakes; needs responsive gift shop."],
  ["Dateland Date Gardens AZ", "info@dateland.com", "USA", "Dateland, AZ", "Dateland Management (Owners)", "Arizona desert oasis growing Medjool dates, date shakes, and specialty nut tins; needs nationwide mail-order portal."],
  ["Woodspur Farms Coachella", "info@woodspurfarms.com", "USA", "Coachella, CA", "Larry D. Jones (CEO)", "Largest integrated organic date grower in North America; needs streamlined wholesale and gift box portal."],
  ["Date Lady Organic Date Syrups", "info@datelady.com", "USA", "Springdale, AR", "Ryan Sheehan (Founder)", "Specializes in pure organic California date syrup, date paste, and date sugar; needs modern e-commerce recipe shop."],
  ["Joolies Organic Medjool Dates", "hi@joolies.com", "USA", "Venice, CA", "David Kohl (Co-Founder)", "California organic Medjool dates packaged in eco-friendly mint boxes; needs sleek DTC subscription checkout."],
  ["Rancho Meladuco Date Farm", "hello@ranchomeladuco.com", "USA", "Thermal, CA", "Joan Smith (Founder)", "Artisan hand-packed California Medjool dates in luxury illustrated gift boxes; needs corporate gift customizer."],
  ["Imperial Date Gardens", "info@imperialdategardens.com", "USA", "Winterhaven, CA", "Ismael Medrano (Manager)", "Bard Valley Medjool date grower shipping jumbo dates across the country; needs interactive gift tray shop."],
  ["Bautista Family Organic Dates", "info@bautistaorganicdates.com", "USA", "Mecca, CA", "Alicia Bautista (Co-Owner)", "Seven varieties of raw organic Coachella dates harvested fresh; needs online seasonal pre-order storefront."],
  ["Flying Disc Ranch Organics", "info@flyingdiscranch.com", "USA", "Thermal, CA", "Robert Sakovich (Owner)", "Regenerative biodynamic date orchard producing Barhi and Zahidi dates; needs modern CSA-style farm shop."],
  ["Sam Cobb Date Farms", "info@samcobbfarms.com", "USA", "Desert Hot Springs, CA", "Sam Cobb (Owner)", "Family-owned date farm producing the proprietary Black Gold date variety; needs digital gift ordering shop."],
  ["Jewel Date Company California", "info@jeweldate.com", "USA", "Thermal, CA", "Jack Giumarra (President)", "Grower and processor of organic California Medjool and Deglet Noor dates; needs direct wholesale web platform."],

  // --- Dried Fruits, Berries & Cherries ---
  ["Traina Dried Fruit California", "info@trainafoods.com", "USA", "Patterson, CA", "Willie Traina (CEO)", "Sun-dried California apricots, peaches, tomatoes, and dried plums; needs interactive corporate gift builder."],
  ["Graceland Fruit Michigan", "info@gracelandfruit.com", "USA", "Frankfort, MI", "Al Devore (CEO)", "Infused dried cranberries, tart cherries, blueberries, and apples; needs modern commercial web boutique."],
  ["Shoreline Fruit Orchards", "info@shorelinefruit.com", "USA", "Traverse City, MI", "Don Gregory (Director)", "Traverse City grower-owned cooperative drying Montmorency tart cherries; needs direct customer shop."],
  ["Royal Ridge Fruits Northwest", "info@royalridgefruits.com", "USA", "Royal City, WA", "Kevin Dorsing (President)", "Washington state processor of organic dried sweet Bing cherries and berries; needs custom gift box builder."],
  ["Smeltzer Orchard Company", "info@smeltzerorchard.com", "USA", "Frankfort, MI", "Tim Smeltzer (President)", "Six generations drying Michigan Montmorency cherries and orchard fruits; needs modern responsive storefront."],
  ["Cherry Republic Traverse City", "answers@cherryrepublic.com", "USA", "Glen Arbor, MI", "Bob Sutherland (President)", "Northern Michigan institution offering dried cherries, cherry chocolates, and nut mixes; needs corporate gift tin portal."],
  ["Meduri Farms Oregon Berries", "info@medurifarms.com", "USA", "Dallas, OR", "Joe Meduri (Founder)", "Oregon dried sweet cherries, marionberries, cranberries, and nut snacks; needs modern B2C gifting storefront."],
  ["National Raisin Company", "info@nationalraisin.com", "USA", "Fowler, CA", "Jane Asmar (VP Sales)", "Grower and packer of California raisins, dried prunes, and dried figs; needs modern branded web presence."],
  ["Lion Raisins California", "info@lionraisins.com", "USA", "Selma, CA", "Larry Lion (President)", "California dried raisin company offering organic Thompson seedless raisins; needs modern trade & consumer shop."],
  ["Victor Packing California", "info@victorpacking.com", "USA", "Madera, CA", "Victor Sahatdjian (President)", "San Joaquin Valley processor of California sun-dried raisins; needs bulk online order portal."],
  ["Sunwest Fruit Company", "info@sunwestfruit.com", "USA", "Parlier, CA", "Doug Phillips (Owner)", "Central California citrus, peach, and dried fruit growers; needs streamlined direct shipping shop."],
  ["Oregon Fruit Products", "info@oregonfruit.com", "USA", "Salem, OR", "Chris Scherting (CEO)", "Willamette Valley specialty berries and artisan fruit puree; needs luxury culinary retail storefront."],
  ["Northwest Wild Foods Berries", "sales@nwwildfoods.com", "USA", "Burlington, WA", "Rick Anderson (Founder)", "Wild harvested dried huckleberries, wild blackberries, and raw nuts; needs interactive gift hamper creator."],
  ["Brownwood Acres FruitFast", "info@brownwoodacres.com", "USA", "Central Lake, MI", "Steve deTar (President)", "Cherry juice concentrates, dried Montmorency cherries, and fruit snacks; needs modern health-focused web store."],
  ["King Orchards Tart Cherries", "orders@kingorchards.com", "USA", "Central Lake, MI", "John King (Co-Owner)", "Michigan fruit farm growing and drying tart cherries and peaches; needs online seasonal gift shop."],

  // --- UK & Ireland Artisan Wholefoods, Nuts & Confectionery ---
  ["Buy Whole Foods Online UK", "sales@buywholefoodsonline.co.uk", "UK", "Minster, Kent", "Arthur Martin (Founder)", "Major online retailer of organic bulk nuts, dried exotic fruits, and seeds; needs corporate gift builder."],
  ["Healthy Supplies Fine Foods", "contact@healthysupplies.co.uk", "UK", "Lancing, Sussex", "Brendan Rogers (Director)", "Specialist wholefood store offering raw dried figs, dates, and roasting nuts; needs subscription order tool."],
  ["Real Foods Edinburgh", "webshop@realfoods.co.uk", "UK", "Edinburgh", "Gordon Bow (Managing Director)", "Scotland's largest organic wholefood grocer since 1963 offering dried fruits and nuts; needs digital luxury shop."],
  ["Infinity Foods Wholesale", "info@infinityfoodswholesale.co.uk", "UK", "Brighton", "Cooperative Board (Directors)", "Pioneering UK wholefood cooperative providing organic dried fruits, nuts, and fair trade grains; needs modern B2B store."],
  ["The Dormen Food Company", "info@thedormenfoodcompany.com", "UK", "Swindon", "Julian Dorman (Founder)", "Luxury hospitality nut supplier providing spiced cashews, smoked almonds, and macadamias; needs luxury gift tin shop."],
  ["Whitworths Dried Fruit & Nuts", "info@whitworths.co.uk", "UK", "Irthlingborough", "Mark Fairweather (CEO)", "UK's leading dried fruit, nut, and seed brand helping consumers eat healthier; needs modern direct-to-consumer store."],
  ["Humdinger Foods UK", "enquiries@humdinger-foods.co.uk", "UK", "Hull", "Paul Simpson (Managing Director)", "Manufacturing dried fruit snacks, roasted nuts, and chocolate covered raisins; needs dynamic retail showcase."],
  ["Community Foods UK", "enquiries@communityfoods.co.uk", "UK", "London", "Martin King (Managing Director)", "Supplying organic nuts, dried Mediterranean fruits, and seeds for 50 years; needs interactive wholesale catalog."],
  ["Forest Whole Foods Organic", "support@forestwholefoods.co.uk", "UK", "Swanage, Dorset", "Tara Lambert (Director)", "Organic whole foods brand packing certified dried berries, nuts, and chia seeds; needs responsive subscription shop."],
  ["Just Ingredients Natural Goods", "sales@justingredients.co.uk", "UK", "Caldicott, Wales", "David Stocker (Managing Director)", "Supplying botanical herbs, dried fruits, edible seeds, and raw nuts; needs modern order reservation system."],
  ["Good Earth Fine Natural Foods", "info@goodearth.co.uk", "UK", "London", "Nigel Cooper (Director)", "Natural organic food brand providing dried fruits, whole grains, and trail nuts; needs modern lifestyle web shop."],
  ["Rude Health Plant Drinks & Snacks", "hello@rudehealth.com", "UK", "London", "Nick Barnard (Co-Founder)", "Crafting organic sprouted nutty granolas, oat drinks, and nut snacks; needs vibrant DTC digital storefront."],
  ["Meridian Foods Nut Butters", "hello@meridianfoods.co.uk", "UK", "Whitchurch, Hampshire", "Paul Brown (Director)", "Pioneer of palm-oil-free peanut, almond, and cashew nut butters; needs interactive build-a-bundle tool."],
  ["Biona Organic Wholefoods", "info@biona.co.uk", "UK", "London", "Noel McDonald (Co-Founder)", "Organic ethical brand offering dried tropical fruits, seeds, and roasted nut spreads; needs modern multilingual store."],
  ["Clearspring Japanese & Organics", "info@clearspring.co.uk", "UK", "London", "Christopher Dawson (Founder)", "Organic Japanese specialties, roasted seeds, and sun-dried organic fruits; needs interactive recipe & gift shop."],
  ["Pip & Nut Nut Butters UK", "thekernel@pipandnut.com", "UK", "London", "Pippa Murray (Founder)", "B-Corp certified natural nut butter brand roasting golden almonds and peanuts; needs modern subscription gift store."],
  ["ManiLife Deep Roast Peanut Butter", "hello@mani-life.com", "UK", "London", "Stuart Macdonald (Founder)", "Crafting deep roast peanut butter made with single-estate Argentine peanuts; needs luxury jar customization tool."],
  ["Yumello Moroccan Nut Butters", "hello@yumello.com", "UK", "London", "Omar Hajji (Co-Founder)", "Moroccan-inspired argan oil and roasted almond butter spreads; needs interactive gift set configurator."],
  ["Grape Tree Health Foods", "customerservices@grapetree.co.uk", "UK", "Kingswinford", "Nick Shutts (Founder)", "Nationwide retailer offering natural nuts, seeds, dried fruits, and confectionery; needs modern click & collect portal."],
  ["Nutcessity Organic Nut Spreads", "info@nutcessity.co.uk", "UK", "Bristol", "Mike Duckett (Founder)", "Artisanal organic stoneground nut butters packed in recyclable glass; needs interactive variety pack builder."],

  // --- Germany & Northern Europe Naturkost & Dried Fruits ---
  ["Seeberger Gourmet Nuts & Fruit", "info@seeberger.de", "Germany", "Ulm", "Clemens Keller (Managing Partner)", "Over 175 years roasting premium almonds, walnuts, and soft sun-dried figs; needs luxury corporate gift tin tool."],
  ["Lorenz Snack-World Nuts", "verbraucherservice@lorenz-snackworld.de", "Germany", "Neu-Isenburg", "Lorenz Bahlsen (CEO)", "Leading German snack manufacturer roasting salted peanuts, cashews, and party nuts; needs interactive event shop."],
  ["Ültje Gourmet Peanuts & Nuts", "info@ueltje.de", "Germany", "Schwerte", "Mathias Hübner (Managing Director)", "Famous German brand specializing in kettle-roasted peanuts and spiced nut blends; needs modern retail presence."],
  ["Herbert Kluth Dried Fruit & Nuts", "info@kluth.de", "Germany", "Henstedt-Ulzburg", "Peter Kluth (Managing Director)", "Quality supplier of premium nuts, dried cranberries, and salad seed toppings; needs direct web customer portal."],
  ["Rapunzel Naturkost Organics", "info@rapunzel.de", "Germany", "Legau", "Joseph Wilhelm (Founder)", "Pioneering organic vegetarian company producing fair trade dried mango, figs, and nuts; needs interactive gift shop."],
  ["MorgenLand Organic Fruits", "info@morgenland.bio", "Germany", "Holzminden", "MorgenLand Team (Directors)", "Bio-organic dried apricots, coconuts, mulberries, and nuts from dedicated farm projects; needs modern organic store."],
  ["Keimling Naturkost Raw Foods", "service@keimling.de", "Germany", "Buxtehude", "Winfried Holler (Founder)", "Raw food specialist providing raw organic nuts, dried superberries, and nut spreads; needs dynamic subscription shop."],
  ["KoRo Drogerie Bulk Nuts & Snacks", "service@korodrogerie.de", "Germany", "Berlin", "Constantin Scheuermann (CEO)", "Innovative European bulk snack brand offering dried dragonfruit, macadamias, and nut butters; needs VIP loyalty club portal."],
  ["Alnatura Organic Supermarket", "service@alnatura.de", "Germany", "Darmstadt", "Götz Rehn (Founder)", "Germany's major organic producer providing certified organic nuts, dried dates, and seeds; needs omnichannel shop."],
  ["Davert Organic Grain & Nut Specialties", "info@davert.de", "Germany", "Ascheberg", "Erk Schuchhardt (CEO)", "Organic ancient grains, dried berries, and seed mixes for modern breakfast bowls; needs modern mobile store."],
  ["Govinda Natur Ayurvedic Snacks", "info@govinda-natur.de", "Germany", "Neustadt", "Doris Maiwald (Founder)", "Ayurvedic confections, organic fruit balls, tiger nuts, and raw dried dates; needs interactive gift box builder."],

  // --- Italy, Spain & France Mediterranean Nuts & Confectionery ---
  ["Pariani Artisan Italian Nuts", "info@pariani.org", "Italy", "Givoletto, Turin", "Mattia Pariani (Founder)", "Acclaimed producer of Piedmont Hazelnut PGI, Bronte Pistachio PDO, and cold-pressed nut oils; needs luxury gourmet shop."],
  ["Babbi Confectionery & Wafers", "info@babbi.it", "Italy", "Bertinoro, FC", "Carlo Babbi (President)", "Gourmet wafer rolls and pistachio cream confections crafted with Sicilian pistachios; needs interactive holiday gift tin builder."],
  ["Damiano Organic Nut Butters", "info@damianoorganic.it", "Italy", "Torrenova, Messina", "Riccardo Damiano (CEO)", "Sicilian organic almond, pistachio, and hazelnut pastes since 1964; needs direct export web storefront."],
  ["Pistì Sicilian Artisan Pistachios", "info@pisti.it", "Italy", "Bronte, Sicily", "Nino Marino (Founder)", "Crafting luxury pistachio panettoni, Sicilian almond nougats, and pistachio pesto; needs luxury international boutique."],
  ["Noberasco Dried Fruit Pioneers", "info@noberasco.it", "Italy", "Cosseria, SV", "Mattia Noberasco (CEO)", "Italian market leader in soft dried figs, dates, prunes, and gourmet nut mixes; needs corporate holiday gift shop."],
  ["Madi Ventura Premium Dried Fruits", "info@madiventura.it", "Italy", "Genoa", "Ventura Family (Directors)", "Italian roasting house producing shelled walnuts, pine nuts, and fruit bars; needs modern consumer portal."],
  ["Eurocompany Dried Fruits & Nuts", "info@eurocompanyspa.com", "Italy", "Russi, Ravenna", "Mario Zani (CEO)", "Italian roasting company specializing in raw nuts, dried organic fruits, and ethical sourcing; needs modern B2C shop."],
  ["Borges Agricultural Nuts", "info@borges-bain.com", "Spain", "Reus, Tarragona", "David Prats (CEO)", "Leading Mediterranean agricultural producer of almonds, walnuts, and pistachios; needs direct-to-retail portal."],
  ["Importaco Gourmet Nuts", "info@importaco.com", "Spain", "Beniparrell, Valencia", "Toño Pons (President)", "Major Spanish manufacturer of roasted almonds, sunflower seeds, and dried Mediterranean fruits; needs modern web platform."],
  ["Frit Ravich Snack Foods", "info@fritravich.com", "Spain", "Macanet de la Selva", "Josep Maria Viader (CEO)", "Spanish producer of roasted cocktail nuts, salted almonds, and dried berries; needs modern corporate shop."],
  ["Aperitivos Medina Nuts", "info@aperitivosmedina.com", "Spain", "Madrid", "Medina Family (Owners)", "Spanish artisan roasting company offering ecological Marcona almonds and dried fruit snacks; needs modern boutique."],
  ["El Nogal Gourmet Nuts & Dried Fruit", "info@elnogal.com", "Spain", "Vigo, Galicia", "Antonio Lopez (General Manager)", "Galician roaster packaging Marcona almonds, walnuts, and dried cranberries; needs interactive holiday gift builder."],
  ["Daco France Nuts & Dried Fruits", "contact@dacofrance.fr", "France", "Ablis", "Michel Daco (President)", "French specialist in roasting hazelnuts, almonds, and drying soft apricots; needs modern gourmet e-commerce."],
  ["Menguys Apéritif Nuts", "contact@menguys.fr", "France", "Toulouse", "Paul Menguy (Founder)", "French roastery renowned for roasted peanuts, grilled pistachios, and festive apéro mixes; needs modern digital shop."],
  ["Color Foods Sun-Dried Delicacies", "contact@color-foods.com", "France", "Marseille", "Arnaud Cousteix (CEO)", "Sun-ripened dried figs, Medjool dates, and roasted Mediterranean nuts; needs interactive gift hamper portal."],

  // --- Australia & New Zealand Macadamia, Nut & Dried Fruit Growers ---
  ["Macadamias Australia", "info@macadamiasaustralia.net", "Australia", "Bundaberg, QLD", "Janelle Gerry (Director)", "Second-generation family farm harvesting, cracking, and roasting Bundaberg macadamias; needs corporate gift tin store."],
  ["Brookfarm Artisanal Macadamia Farm", "info@brookfarm.com.au", "Australia", "Byron Bay, NSW", "Pam Brook (Co-Founder)", "Byron Bay sustainable farm crafting toasted macadamia mueslis and roasted nut snacks; needs international DTC checkout."],
  ["Pacific Macadamias Australia", "info@pacificmacadamias.com", "Australia", "Alstonville, NSW", "Craig Mills (General Manager)", "Supplying fresh Australian macadamias and chocolate coated nut treats; needs modern responsive storefront."],
  ["Nutworks Gourmet Macadamias", "info@nutworks.com.au", "Australia", "Yandina, QLD", "Kylie Watson (General Manager)", "Sunshine Coast artisan roaster of flavored macadamias, dried fruits, and confectionery; needs gift hamper creator."],
  ["Stahmann Webster Pecans & Walnuts", "info@stahmannwebster.com.au", "Australia", "Toowoomba, QLD", "Ross Webster (Director)", "Pioneering Australian tree nut grower farming pecans, walnuts, almonds, and macadamias; needs modern web platform."],
  ["JC's Quality Foods Australian Nuts", "info@jcsqualityfoods.com", "Australia", "Scoresby, VIC", "Joseph Cannatelli (Founder)", "Australian family-owned company roasting premium nuts, trail mixes, and dried fruits; needs modern online store."],
  ["Morlife Functional Dried Superfruits", "info@morlife.com", "Australia", "Arundel, QLD", "Dr. Warren Stewart (Founder)", "Functional nutrition company coating dried blueberries and goji berries in dark chocolate; needs interactive bundle shop."],
  ["Mayver's Pure Nut Spreads", "info@mayvers.com.au", "Australia", "Melbourne, VIC", "Paul Raff (Director)", "Family-owned Australian brand crafting unadulterated peanut and almond spreads; needs responsive consumer portal."],
  ["Ridiculously Delicious Nut Butter", "info@ridiculouslydelicious.com.au", "Australia", "Elsternwick, VIC", "Ben Parker (Founder)", "100% Australian golden roasted peanut butters and peanut butter chunk cookies; needs custom gift box builder."],
  ["Mother Earth Natural Health Foods", "contact@motherearth.co.nz", "New Zealand", "Auckland", "Mother Earth Team (Directors)", "New Zealand brand roasting raw nuts, nut bars, and dried fruit mixes; needs modern responsive storefront."],
  ["Ceres Organics Wholefoods NZ", "info@ceres.co.nz", "New Zealand", "Auckland", "Noel Josephson (Co-Founder)", "Pioneering certified organic distributor of raw nuts, dried organic fruits, and seeds; needs modern lifestyle web shop."],
  ["Chantal Organics Whole Foods", "info@chantalorganics.co.nz", "New Zealand", "Napier, Hawke's Bay", "Peter Fallon (Managing Director)", "Organic peanut and nut butters, dried orchard fruits, and breakfast granolas; needs modern mobile store."],
  ["Healtheries Health Provisions NZ", "info@healtheries.co.nz", "New Zealand", "Auckland", "Rachel Hurley (Brand Manager)", "Centuries-old Kiwi health food brand providing superfood seeds and dried fruit snacks; needs modern web presence."],
  ["Fix & Fogg Award-Winning Nut Butters", "info@fixandfogg.com", "New Zealand", "Wellington", "Roman Jewell (Founder)", "World-famous artisanal peanut, cashew, and almond nut butters; needs interactive gift variety pack configurator."],

  // --- India Premium Dry Fruits, Cashews, Saffron & Nuts ---
  ["Happilo Premium Dry Fruits", "care@happilo.com", "India", "Bengaluru, Karnataka", "Vikas Nahar (Founder)", "Leading gourmet dry fruit brand offering roasted salted California almonds, cashews, and trail mixes; needs VIP corporate gift hamper builder."],
  ["Farmley Farm-Direct Dry Fruits", "care@farmley.com", "India", "Noida, UP", "Akash Sharma (Co-Founder)", "Direct-from-farm cashews, roasted makhana, and Turkish apricots; needs modern festive gift packaging portal."],
  ["Nutraj Gourmet Dry Fruits & Nuts", "care@nutraj.com", "India", "New Delhi", "Gunjan Jain (Managing Director)", "One of India's largest and oldest dry fruit packers offering gift boxes; needs corporate spreadsheet bulk order uploader."],
  ["Rostaa Gourmet Dried Fruits & Berries", "care@rostaa.com", "India", "Mumbai, Maharashtra", "Soumya Nair (Marketing Lead)", "Gourmet brand specializing in imported dried cranberries, blueberries, hazelnut butter, and Medjool dates; needs custom gift box shop."],
  ["Tulsi Dry Fruits & Nuts", "info@tulsidryfruits.in", "India", "New Delhi", "Tulsi Team (Directors)", "Legacy wholesale and retail dry fruit merchant packaging almonds, walnuts, and figs; needs modern interactive storefront."],
  ["Wonderland Foods Dry Fruits", "info@wonderlandfoods.in", "India", "New Delhi", "Sunil Goel (Founder)", "Specializes in dry fruits, roasted pumpkin seeds, and California almonds; needs dynamic holiday gift box configurator."],
  ["True Elements Clean Snacks & Seeds", "care@true-elements.com", "India", "Pune, Maharashtra", "Puru Gupta (Co-Founder)", "Clean certified whole food nutrition brand offering roasted seeds, berries, and raw nuts; needs subscription order tool."],
  ["Open Secret Healthy Nut Snacks", "care@opensecret.in", "India", "Mumbai, Maharashtra", "Ahana Gautam (Co-Founder)", "Nutty cookies and flavored dry fruit snacks for healthy families; needs personalized gifting portal."],
  ["Zoff Foods Spices & Dry Fruits", "care@zofffoods.com", "India", "Raipur, Chhattisgarh", "Ashish Agrawal (Founder)", "Cool grinding spice technology and farm fresh dry fruits and nuts; needs direct customer web shop."],
  ["Nutrifun Healthy Nuts & Seeds", "care@nutrifun.in", "India", "Kolkata, WB", "Pradeep Sharma (Director)", "Artisanal nut roaster and seed processor offering festive dry fruit boxes; needs modern e-commerce checkout."],
  ["Evolve Snacks Roasted Nuts", "care@evolvesnacks.com", "India", "New Delhi", "Rohit Mohan (Founder)", "Healthy snacking company making spiced roasted almonds, cashews, and berry blends; needs custom snack box builder."],
  ["Snackible Healthy Snack Delights", "customercare@snackible.com", "India", "Mumbai, Maharashtra", "Aditya Sanghavi (Founder)", "On-the-go healthy snack company curating vacuum-dried fruits and roasted spiced nuts; needs subscription snack box shop."],
  ["Fabindia Organics & Provisions", "support@fabindia.net", "India", "New Delhi", "Dipali Patwa (Chief of Brand)", "Iconic lifestyle brand offering organic dry fruits, honey, and Kashmiri walnuts; needs luxury festive hamper portal."],
  ["Santushti Shakes & Roasted Nuts", "info@santushtishakes.com", "India", "Rajkot, Gujarat", "Sunil Hingorani (Founder)", "Premium thick shakes and dry fruit confections across Western India; needs digital gifting storefront."],
  ["Havmor Ice Cream & Dry Fruit Gifts", "info@havmor.com", "India", "Ahmedabad, Gujarat", "Komul Patel (Director)", "Heritage dairy and ice cream confectioner pairing roasted cashews and pistachios; needs online celebratory gifting portal."],
  ["Vadilal Group Ice Cream & Dry Fruits", "info@vadilalgroup.com", "India", "Ahmedabad, Gujarat", "Rajesh Gandhi (Chairman)", "Historic brand curating dry fruit kulfi, roasted almonds, and festive sweet boxes; needs corporate gift hamper tool."],
  ["Kwality Confectioners & Nuts", "care@kwality.in", "India", "Bengaluru, Karnataka", "Kwality Directors (Owners)", "Breakfast cereals, muesli packed with almonds & raisins, and roasted nuts; needs modern DTC shopping cart."],
  ["Ghasitaram Gifts & Dry Fruits", "info@ghasitaram.in", "India", "Mumbai, Maharashtra", "Kunal Bajaj (Partner)", "Over 100 years of delivering festive dry fruit mithai, silver leaf cashews, and gift platters; needs luxury wedding gift portal."],
  ["Mani Zaver Heritage Sweets & Nuts", "info@manizaver.com", "India", "Ahmedabad, Gujarat", "Mani Zaver Team (Owners)", "Traditional Gujarati sweets, roasted dry fruit chikkis, and almond boxes; needs online gifting storefront."],
  ["Vijay Sweets & Dry Fruits", "info@vijaysweets.com", "India", "Coimbatore, Tamil Nadu", "Vijay Team (Owners)", "South Indian traditional sweetmaker crafting pure ghee cashew halwa and roasted nuts; needs pan-India shipping store."],
  ["Sri Krishna Sweets Nut Delicacies", "customercare@srikrishnasweets.net", "India", "Chennai, Tamil Nadu", "M. Murali (Managing Director)", "World-renowned for Mysurpa made with pure ghee, roasted cashews, and badam halwa; needs festive gift box customizer."],
  ["Grand Sweets & Snacks Dry Fruits", "support@grandsweets.com", "India", "Chennai, Tamil Nadu", "Grand Sweets Team (Owners)", "Heritage Chennai snack institution offering spiced cashews, badam katli, and dried fruit rolls; needs modern online store."],
  ["Saravana Bhavan Sweets & Nuts", "info@saravanabhavan.com", "India", "Chennai, Tamil Nadu", "P. Rajagopal (Founder)", "Global vegetarian restaurant chain offering luxury dry fruit sweets and salted cashew tins; needs international gifting shop."],
  ["Kashmir Box Walnut & Saffron Direct", "customercare@kashmirbox.com", "India", "Srinagar, Kashmir", "Muheet Mehraj (Founder)", "Kashmiri platform sourcing organic snow-white walnuts, almond kernels, and saffron; needs interactive artisanal gift crate builder."],
  ["Fruitri Premium Dry Fruits", "care@fruitri.com", "India", "New Delhi", "Fruitri Team (Directors)", "Curating premium California pistachios, Turkish figs, and jumbo cashews; needs seamless corporate checkout."],
  ["Dry Fruit Hub Natural Goods", "support@dryfruithub.com", "India", "Hyderabad, Telangana", "Kishore Kumar (Founder)", "Wholesale and retail distributor of seedless raisins, pine nuts, and raw seeds; needs bulk discount order portal."],
  ["ProV Foods Nut & Seed Nutrition", "care@provfoods.com", "India", "Mumbai, Maharashtra", "D. P. Jaju (CEO)", "Integrated commodity company supplying premium almonds, cashews, and trail mixes; needs modern B2C retail web app."],
  ["Nutty Gritties Roasted Nut Flavors", "wecare@nuttygritties.com", "India", "New Delhi", "Dinika Bhatia (Co-Founder)", "Pioneering Indian brand roasting barbecue almonds, coffee pumpkin seeds, and dates; needs interactive variety pack customizer."],
  ["Go Nuts Specialty Snack Tins", "info@gonuts.in", "India", "Mumbai, Maharashtra", "Ashok Advani (Director)", "Luxury gifting brand crafting 4M salted cashews, smoked almonds, and dried berries; needs corporate holiday gift tin tool."],
  ["The Whole Truth Foods Nut Bars", "support@thewholetruthfoods.com", "India", "Mumbai, Maharashtra", "Shashank Mehta (Founder)", "Clean label food company creating 100% transparent peanut and cashew date protein bars; needs modern subscription storefront."],
  ["Western India Cashew Company", "info@wincashew.com", "India", "Kollam, Kerala", "Pari Hariharan (Director)", "Historic Kollam cashew exporter processing organic roasted cashews and flavored nut tins; needs direct export shop."],
  ["Zantye's Cashews Goa", "info@zantyes.com", "India", "Bicholim, Goa", "Pravin Zantye (Managing Partner)", "Goa's leading cashew processor roasting black pepper cashews, salted nuts, and cashew feni; needs tourist pre-order portal."],
  ["Achal Cashews Mangalore", "info@achalcashew.com", "India", "Mangalore, Karnataka", "G. Giridhar Prabhu (Proprietor)", "Certified organic fair trade cashew processing leader shipping globally; needs sustainable packaging web storefront."],
  ["Bola Cashews & Dry Fruits", "info@bolacashew.com", "India", "Karkala, Karnataka", "Bola Rahul Kamath (Director)", "Exporting jumbo cashew kernels, dry fruit hampers, and roasted nuts across India; needs modern B2C web app."],
  ["Saraf Dry Fruits & Confections", "info@sarafdryfruits.com", "India", "Pune, Maharashtra", "Saraf Family (Owners)", "Pune's premier dry fruit destination curating royal wedding gift platters and roasted nuts; needs luxury wedding gift portal."],

  // --- Middle East & Mediterranean Date, Nut & Gourmet Purveyors ---
  ["Bateel Gourmet Dates & Confections", "customercare@bateel.com", "UAE", "Dubai", "Dr. Ata Atmar (CEO)", "World's ultimate luxury organic date purveyor crafting stuffed Medjool dates and date chocolates; needs bespoke VIP gifting boutique."],
  ["Al Rifai Roastery Premium Nuts", "care@alrifai.com", "Lebanon", "Beirut", "Moussa Al Rifai (Founder)", "Famous Middle Eastern roastery crafting kernel mixes, roasted pistachios, and glazed seeds; needs international online store."],
  ["Bayara Nuts & Dried Fruits", "info@bayara.com", "UAE", "Dubai", "Jean-Marc Lourau (CEO)", "Leading Middle Eastern manufacturer of gourmet roasted nuts, dried apricots, and culinary spices; needs dynamic retail showcase."],
  ["Castania Premium Lebanese Nuts", "info@castanianuts.com", "Lebanon", "Beirut", "Peter Daniel (CEO)", "Lebanese tradition of roasting mixed nuts, pumpkin seeds, and smoked almonds; needs global e-commerce portal."],
  ["Al Douri Food Industries", "info@aldourigroup.com", "UAE", "Dubai", "Al Douri Family (Owners)", "Middle Eastern food processor roasting Turkish hazelnuts, jumbo cashews, and dried figs; needs modern wholesale and gift shop."],
  ["Chocobloom Luxury Chocolates & Dates", "info@chocobloom.ae", "UAE", "Abu Dhabi", "Mariam Al Nuaimi (Founder)", "Artisanal Emirati atelier crafting date chocolates filled with roasted pistachios; needs interactive luxury box builder."],
  ["Forrey & Galland Chocolatier", "info@forreyandgalland.com", "UAE", "Dubai", "Isabelle Jaouen (Founder)", "French luxury chocolate house in Dubai crafting royal date collections and marzipan; needs bespoke concierge gift shop."],

  // --- European Fine Chocolate, Praline & Nut Roasting Houses ---
  ["Pierre Marcolini Haute Chocolaterie", "contact@marcolini.com", "Belgium", "Brussels", "Pierre Marcolini (Master Chocolatier)", "World champion pastry chef crafting chocolate mendiants with roasted pistachios, almonds, and dried berries; needs luxury boutique."],
  ["Neuhaus Belgian Master Chocolates", "customercare@neuhauschocolates.com", "Belgium", "Brussels", "Neuhaus Management (Directors)", "Inventor of the Belgian praline featuring roasted Italian hazelnuts and caramelized almonds; needs interactive gift tin creator."],
  ["Leonidas Fresh Belgian Chocolates", "info@leonidas.com", "Belgium", "Brussels", "Philippe de Selliers (CEO)", "Master chocolate maker pairing fresh cream pralines with roasted hazelnuts and candied fruits; needs corporate order builder."],
  ["Venchi Italian ChocoGelateria", "customercare@venchi.com", "Italy", "Castelletto Stura", "Daniele Ferrero (CEO)", "Iconic Italian chocolatier celebrating Piedmont hazelnuts, Gianduja, and pistachio bars; needs interactive holiday gift box tool."],
  ["Sprüngli Confiserie Zurich", "customerservices@spruengli.ch", "Switzerland", "Zurich", "Tomas Prenosil (CEO)", "Swiss pioneer crafting Luxemburgerli macarons, roasted hazelnut pralines, and candied chestnuts; needs luxury VIP boutique."],
  ["Läderach Master Chocolatier", "customerservice@laderach.com", "Switzerland", "Ennenda", "Johannes Läderach (CEO)", "World-renowned for FrischSchoggi featuring whole roasted caramelized almonds, pistachios, and dried berries; needs 1-click order tool."],
  ["Valrhona Fine Pastry Chocolates", "scvalrhona@valrhona.fr", "France", "Tain-l'Hermitage", "Valrhona Team (Directors)", "B-Corp certified chocolate manufacturer providing hazelnut praline pastes and candied orange peels; needs chef portal."],
  ["Domori Fine Cacao & Nuts", "domori@domori.com", "Italy", "None, Turin", "Gianluca Franzoni (Founder)", "Criollo cacao purveyor crafting dark chocolate bars with roasted Piedmont hazelnuts; needs luxury lifestyle boutique."],
  ["Amedei Tuscany Artisan Chocolate", "info@amedei.it", "Italy", "Pontedera, Pisa", "Amedei Team (Directors)", "Tuscan craft chocolate house winning golden bean awards with pistachio and almond bars; needs luxury gift crate tool."],
  ["Majani 1796 Italian Confections", "info@majani.it", "Italy", "Bologna", "Majani Family (Directors)", "Historic maker of Cremino Fiat layered with roasted almond and hazelnut paste; needs modern digital shop."],
  ["Pastiglie Leone Heritage Confections", "info@pastiglieleone.com", "Italy", "Turin", "Leone Family (Owners)", "Italian confectionery heritage crafting chocolate bars with roasted Sicilian almonds; needs playful vintage e-commerce."],
  ["Caffarel Gianduiotto Confections", "info@caffarel.com", "Italy", "Luserna San Giovanni", "Caffarel Team (Directors)", "Inventors of the legendary Gianduiotto made with roasted Langhe Piedmont hazelnuts; needs luxury gift tin portal."],
  ["Feletti Chocolate & Nut Pralines", "info@feletti.it", "Italy", "Cremona", "Feletti Team (Directors)", "Historic Italian brand crafting hazelnut Gianduja and chocolate pralines; needs responsive seasonal ordering."],
  ["Pernigotti Heritage Confections", "info@pernigotti.it", "Italy", "Novi Ligure", "Pernigotti Team (Directors)", "Italian tradition of Gianduiotti, nougats, and roasted hazelnut pastes; needs modern responsive storefront."],
  ["Zaini Milano Artisan Chocolate", "info@zainimilano.it", "Italy", "Milan", "Luigi Zaini (CEO)", "Historic Milanese chocolatier pairing dark chocolate with roasted Mediterranean almonds; needs luxury boutique."],
  ["Slitti Cioccolato e Caffè", "info@slitti.it", "Italy", "Monsummano Terme, Pistoia", "Andrea Slitti (Master Chocolatier)", "World-acclaimed Italian chocolate master crafting hazelnut spreads and roasted nut dragees; needs luxury online salon."],
  ["Guido Gobino Artisan Chocolates", "info@guidogobino.it", "Italy", "Turin", "Guido Gobino (Master Chocolatier)", "Turin chocolate innovator refining Piedmont hazelnut Tourinot and salted Gianduja; needs bespoke VIP tasting kit shop."],
  ["Bodrato Cioccolato Artisans", "info@bodratocioccolato.it", "Italy", "Capriata d'Orba, AL", "Fabio Bergaglio (Owner)", "Artisanal chocolate manufacturer famous for boeri cherries in grappa and roasted nut barks; needs modern gift shop."],
  ["Castagna Cioccolato Craft Atelier", "info@castagnacioccolato.it", "Italy", "Giaveno, Turin", "Guido Castagna (Master Chocolatier)", "Natural method chocolate artisan crafting chocolate bars with slow-roasted Langhe hazelnuts; needs bespoke boutique."]
];

console.log(`Evaluating ${rawCandidates.length} raw candidates across US, UK, Europe, Australia, and India...`);

async function evaluate() {
  const uniqueCandidates = [];
  const seenEmails = new Set();
  let dupCount = 0;
  let sentCollisions = 0;

  for (const c of rawCandidates) {
    const email = c[1].toLowerCase().trim();
    if (sentSet.has(email)) {
      sentCollisions++;
      continue;
    }
    if (seenEmails.has(email)) {
      dupCount++;
      continue;
    }
    seenEmails.add(email);
    uniqueCandidates.push(c);
  }

  console.log(`Collision with sent_emails.json: ${sentCollisions}`);
  console.log(`Internal duplicates filtered:     ${dupCount}`);
  console.log(`Unique unsent candidates:         ${uniqueCandidates.length}`);

  // Test DNS MX in parallel
  console.log(`Testing DNS MX for all domains...`);
  const uniqueDomains = [...new Set(uniqueCandidates.map(c => c[1].split("@")[1]))];
  const validDomains = new Set();

  const chunkSize = 30;
  for (let i = 0; i < uniqueDomains.length; i += chunkSize) {
    const chunk = uniqueDomains.slice(i, i + chunkSize);
    await Promise.all(chunk.map(async d => {
      try {
        const records = await Promise.race([
          dns.resolveMx(d),
          new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 2500))
        ]);
        if (Array.isArray(records) && records.some(r => r.exchange && r.exchange !== "." && !r.exchange.endsWith(".invalid"))) {
          validDomains.add(d);
        }
      } catch {}
    }));
  }

  console.log(`Total domains tested: ${uniqueDomains.length}, Valid MX domains: ${validDomains.size}`);

  const passedCandidates = uniqueCandidates.filter(c => validDomains.has(c[1].split("@")[1]));
  console.log(`\n========================================`);
  console.log(`TOTAL VALID CANDIDATES PASSED MX: ${passedCandidates.length}`);
  console.log(`========================================\n`);

  return passedCandidates;
}

evaluate().then(passed => {
  console.log(`We have ${passed.length} verified candidates in this first batch.`);
}).catch(console.error);
