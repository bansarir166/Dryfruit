import json
import subprocess
import sys

# Load all 301 sent emails
with open("/Users/sahil/Desktop/Dryfruit/sent_emails.json") as f:
    sent_list = json.load(f)
sent_emails = set(x.get("email", "").strip().lower() for x in sent_list)

# Load Batch 3 emails
with open("/Users/sahil/Desktop/Dryfruit/LEADS_BATCH_3.csv") as f:
    batch3_emails = set(line.split(",")[-4].split("|")[-1].strip().lower() for line in f if "@" in line)

all_seen = sent_emails.union(batch3_emails)
print(f"Total existing sent/batch3 emails: {len(all_seen)}")

def check_mx(domain):
    try:
        out = subprocess.check_output(["dig", "+short", "MX", domain], timeout=4).decode()
        records = [line.strip() for line in out.splitlines() if line.strip()]
        valid_recs = [r for r in records if not r.endswith(".invalid.") and r != "0 ."]
        return len(valid_recs) > 0, valid_recs
    except Exception as e:
        return False, str(e)

# Candidate pool across all 6 regions
candidates = [
    # USA & Canada (80 candidates)
    ("Blue Diamond Growers", "support@bluediamond.com", "USA", "Sacramento, CA", "Mark Jansen (CEO)", "your world-renowned California almonds and gourmet snack tins deserve a luxury direct-to-consumer digital gift boutique."),
    ("Sunsweet Growers", "info@sunsweet.com", "USA", "Yuba City, CA", "Brad Schuler (CEO)", "as the global leader in dried prunes and specialty fruits, a modern interactive gift box builder would unlock higher retail margins."),
    ("Setton Farms", "info@settonfarms.com", "USA", "Terra Bella, CA", "Lee Cohen (General Manager)", "your premium California pistachios and pistachio chews deserve an ultra-luxurious, editorial e-commerce presentation."),
    ("Tierra Farm", "info@tierrafarm.com", "USA", "Valatie, NY", "Dan Kelly (CEO)", "your certified organic roasted nuts and dried fruits would see higher basket values with automated corporate gifting tins."),
    ("Sahale Snacks", "info@sahalesnacks.com", "USA", "Seattle, WA", "Josh Schroeter (Co-Founder)", "your glazed nut mixes and fruit snack blends would convert at higher order values with our turnkey custom gift set configurator."),
    ("Diamond of California", "info@diamondnuts.com", "USA", "Stockton, CA", "Craig Tokusato (CMO)", "your 110-year California heritage in culinary walnuts and pecans would thrive with a modern direct-to-consumer store."),
    ("Fisher Nuts (John B. Sanfilippo)", "info@fishernuts.com", "USA", "Elgin, IL", "Jeffrey Sanfilippo (CEO)", "your fresh-roasted nuts and orchard pecan favorites would convert higher with an express one-click mobile cart."),
    ("Planters Nut & Chocolate Co.", "customercare@planters.com", "USA", "Austin, MN", "Jim Snee (Chairman)", "the legendary Mr. Peanut brand could capture high-margin holiday gifting orders with custom customizable nut tin composers."),
    ("Western Nut Company", "sales@westernnut.com", "USA", "Salt Lake City, UT", "Steve Western (President)", "your freshly roasted cashews, almonds, and Utah gift tins deserve a modern, responsive digital storefront."),
    ("Fiddyment Farms", "info@fiddymentfarms.com", "USA", "Roseville, CA", "Diane Fiddyment (Owner)", "roasting California pistachios since 1958, your farm would see higher average order values with our custom gift tin builder."),
    ("Santa Barbara Pistachio Co.", "info@pistachios.com", "USA", "New Cuyama, CA", "Gail Zannon (Founder)", "your organically grown, sun-ripened California pistachios deserve an ultra-luxurious digital boutique."),
    ("Keeney Pecan Company", "orders@keeneypecans.com", "USA", "Rochelle, TX", "Mark Keeney (Owner)", "your Texas orchard pecans and festive nut samplers would convert higher with an automated build-a-box checkout."),
    ("Millican Pecan Company", "contact@pecancompany.com", "USA", "San Saba, TX", "Winston Millican (Owner)", "operating since 1888 in the Pecan Capital of the World, your family heritage deserves a modern luxury Next.js web store."),
    ("Durham Pecan Co", "sales@durhampecan.com", "USA", "Comanche, TX", "David Durham (President)", "your premium Texas pecan halves and roasted pieces would excel with our turnkey corporate gifting hamper engine."),
    ("Cane River Pecan Company", "info@caneriverpecan.com", "USA", "New Iberia, LA", "Jady Regard (President)", "your Louisiana gourmet pecan tins and chocolate nuts would thrive with an interactive holiday gift configurator."),
    ("Golden Peanut and Tree Nuts", "info@goldenpeanut.com", "USA", "Alpharetta, GA", "Arthur Peery (President)", "your premium peanut and pecan ingredients would benefit from our turnkey B2B ordering and consumer gift packaging modules."),
    ("Ellis Bros. Pecans", "info@werenuts.com", "USA", "Vienna, GA", "Keith Ellis (Partner)", "your I-75 Georgia pecan store draws road-trippers nationwide; our turnkey store would turn visitors into repeat annual subscribers."),
    ("Atwell Pecans", "info@atwellpecans.com", "USA", "Wrens, GA", "Bud Atwell (President)", "your family-owned Georgia pecan shelling operation would capture higher margins with direct-to-consumer gift boxes."),
    ("Hudson Pecan Company", "info@hudsonpecan.com", "USA", "Ocilla, GA", "Randy Hudson (CEO)", "your high-volume Georgia pecan orchards would benefit from our turnkey direct-to-consumer e-commerce cart."),
    ("South Georgia Pecan Company", "info@georgiapecan.com", "USA", "Valdosta, GA", "Jim Worn (President)", "shelling pecans since 1913, your Georgia pecans deserve a modern, high-converting digital storefront."),
    ("Whaley Pecan Company", "info@whaleypecan.com", "USA", "Troy, AL", "Frank Whaley (President)", "your Alabama roasted pecans and seasonal nut gift samplers would convert higher with modern express payments."),
    ("Young Plantations", "info@youngplantations.com", "USA", "Florence, SC", "David Young (President)", "your famous Carolina pecan pralines and spiced nuts deserve an ultra-luxurious online gift tin experience."),
    ("Mascot Pecan Shelling Co.", "info@mascotpecan.com", "USA", "Glennville, GA", "Kenny Tarver (President)", "your handmade pecan clusters and Georgia roasted nuts would see higher cart sizes with custom gift tin packaging."),
    ("Royal Ridge Fruits", "info@royalridgefruits.com", "USA", "Royal City, WA", "Kevin Dorsing (Managing Director)", "your Washington dried Montmorency tart cherries and blueberries deserve a premium digital boutique."),
    ("Meduri Farms", "info@medurifarms.com", "USA", "Dallas, OR", "Joe Meduri (Founder)", "your infused dried cranberries and vineyard berries would convert higher with our turnkey luxury storefront."),
    ("Graceland Fruit", "info@gracelandfruit.com", "USA", "Frankfort, MI", "Al DeVore (CEO)", "as a world pioneer in infused dried cranberries and cherries, your DTC store would benefit from modern subscription tools."),
    ("Shoreline Fruit", "info@shorelinefruit.com", "USA", "Traverse City, MI", "Ken Wixson (Director)", "your Michigan Montmorency tart cherries and dried berries would drive higher margins with custom snack gift boxes."),
    ("Smeltzer Orchard Company", "info@smeltzerorchards.com", "USA", "Frankfort, MI", "Tim Smeltzer (President)", "processing Michigan fruit since 1905, your dried cherries and blueberries deserve a modern consumer shop."),
    ("Cherry Central Cooperative", "info@cherrycentral.com", "USA", "Traverse City, MI", "Steve Cooper (President)", "your grower-owned dried fruit co-op would capture high retail margins with our turnkey direct cart."),
    ("Brownwood Acres / FruitFast", "info@brownwoodacres.com", "USA", "Central Lake, MI", "Stephen deTar (President)", "your tart cherry concentrates and dried fruit snack packs would drive stronger recurring subscriptions on a modern platform."),
    ("Traverse Bay Farms", "info@traversebayfarms.com", "USA", "Bellaire, MI", "Andy LaPointe (Founder)", "your award-winning dried cherries and nut mixes would convert higher with an interactive corporate gift box builder."),
    ("King Orchards", "info@kingorchards.com", "USA", "Central Lake, MI", "John King (Co-Owner)", "your farm-direct Michigan dried cherries and fruit gift boxes would thrive on our turnkey e-commerce store."),
    ("Friske Farm Market", "info@friske.com", "USA", "Ellsworth, MI", "Richard Friske (Owner)", "your orchard dried fruits and handcrafted nut treats deserve an elevated digital storefront with nationwide shipping."),
    ("Golden State Fruit", "info@goldenstatefruit.com", "USA", "Webster, NY", "Dan O'Donnell (President)", "your fresh and dried fruit holiday towers would convert higher with our custom gift packaging configurator."),
    ("Manhattan Fruitier", "orders@manhattanfruitier.com", "USA", "Long Island City, NY", "Lauren Elvers Collins (President)", "your artistic dried fruit and nut gift arrangements deserve a high-converting, luxury digital showcase."),
    ("Frog Hollow Farm", "info@froghollow.com", "USA", "Brentwood, CA", "Farmer Al Courchesne (Founder)", "your legendary California organic sun-dried peaches and nectarines deserve a luxury direct-to-consumer store."),
    ("Harry & David", "service@harryanddavid.com", "USA", "Medford, OR", "Steven Lightman (President)", "your iconic Royal Riviera dried fruit baskets and gourmet nut towers could convert even higher with interactive custom box builders."),
    ("Wolferman's Gourmet Gifts", "service@wolfermans.com", "USA", "Medford, OR", "Gourmet Food Division", "your breakfast gift baskets and dried fruit preserves would see higher average order values with custom bundle builders."),
    ("Cheryl's Gourmet Gifts", "service@cheryls.com", "USA", "Westerville, OH", "Cheryl Krueger (Founder)", "your gourmet holiday gift tins and roasted nut treats would convert higher with a streamlined mobile checkout."),
    ("Dancing Deer Gourmet Snacks", "customerservice@dancingdeer.com", "USA", "Boston, MA", "Frank Carpenito (CEO)", "your scratch-baked snack cakes and artisan nut gift boxes deserve a modern, high-speed Next.js storefront."),
    ("Zingerman's Mail Order", "service@zingermans.com", "USA", "Ann Arbor, MI", "Mo Frechette (Managing Partner)", "your artisanal roasted nuts and estate dried fruits would convert higher with our turnkey luxury e-commerce platform."),
    ("Hickory Farms", "service@hickoryfarms.com", "USA", "Chicago, IL", "Judy Ransford (CEO)", "your specialty nut samplers and dried fruit gift boxes would benefit from our interactive corporate gifting configurator."),
    ("Swiss Colony", "service@swisscolony.com", "USA", "Monroe, WI", "Pat Ryan (President)", "your heritage holiday nut tins and dried fruit confections would see higher mobile conversions on a modern Next.js store."),
    ("Figis Gourmet Gifts", "service@figis.com", "USA", "Marshfield, WI", "Customer Care Team", "your Wisconsin nut tins and dried fruit assortments would benefit from an automated corporate gift portal."),
    ("Wisconsin Cheese & Nut Mart", "info@wisconsincheesemart.com", "USA", "Milwaukee, WI", "Ken McNulty (President)", "your artisanal cheese and roasted nut pairing baskets would see higher average order values with custom gift box composers."),
    ("Wholesale Nuts And Dried Fruit", "info@wholesalenutsanddriedfruit.com", "USA", "Clifton, NJ", "David Mizrahi (Founder)", "your bulk dried fruit and nut selections would benefit from our turnkey high-converting e-commerce cart."),
    ("Inka Crops", "info@inkacrops.com", "USA", "Miami, FL", "Ignacio Garaycochea (Director)", "your giant roasted corn nuts and specialty seed snacks would drive higher direct sales with an interactive snack box builder."),
    ("Justin's Nut Butter & Snacks", "info@justins.com", "USA", "Boulder, CO", "Justin Gold (Founder)", "your artisanal almond butter pouches and organic nut cups deserve an elevated digital storefront with subscription repeat orders."),
    ("Artisana Organics Nut Butters", "info@artisanaorganics.com", "USA", "Oakland, CA", "Lorena Morales (Director)", "your raw organic walnut, cashew, and tahini butter jars deserve a clean, modern direct-to-consumer store."),
    ("MaraNatha Foods", "info@maranathafoods.com", "USA", "Lake Success, NY", "Brand Management", "your California roasted almond and creamy peanut butters would drive higher subscriptions on an ultra-fast digital storefront."),
    ("Woodstock Foods", "info@woodstock-foods.com", "USA", "Providence, RI", "Michael Funk (Founder)", "your Non-GMO organic dried apricots, walnuts, and pumpkin seeds deserve an ultra-luxurious DTC boutique."),
    ("BulkFoods.com", "info@bulkfoods.com", "USA", "Toledo, OH", "Brad Miller (General Manager)", "your bulk dried fruits, nuts, and trail mixes would convert at higher order values with our turnkey custom mix composer."),
    ("Nuts in Bulk USA", "info@nutsinbulk.com", "USA", "New Rochelle, NY", "Mark Klein (President)", "your wholesale and retail raw nuts would benefit from our turnkey high-converting e-commerce cart."),
    ("Farm Fresh Nuts", "info@farmfreshnuts.com", "USA", "Lakewood, NJ", "Solomon Gross (Owner)", "your hand-selected roasted nuts and dried fruit gift trays would convert higher during holidays with our modern gift box builder."),
    ("We Got Nuts", "info@wegotnuts.com", "USA", "Brooklyn, NY", "Jack Dweck (Founder)", "your bulk dried fruits and roasted cashews would see higher average order values with an automated discount engine."),
    ("Argires Snacks", "info@argires-snacks.com", "USA", "Alsip, IL", "George Argires (President)", "roasting nuts in Chicago since 1923, your Outrageously Good nut tins deserve a modern, mobile-first e-commerce cart."),
    ("Jerry's Nut House", "info@jerrysnuthouse.com", "USA", "Denver, CO", "Jerry Gross (Founder)", "roasting savory nut mixes and dried fruit in Colorado, your store would benefit from our interactive custom tin builder."),
    ("Austin Nuts", "info@austinnuts.com", "USA", "Austin, TX", "Robert Martinez (President)", "your small-batch dry roasted almonds, pecans, and cashews would see higher conversions with express one-click payments."),
    ("Alamo Pecan & Coffee Co.", "info@alamopecan.com", "USA", "San Saba, TX", "Brenda Oliver (Owner)", "your Texas pecan pies and roasted nut sampler gift boxes would achieve nationwide reach with our turnkey luxury store."),
    ("San Saba Pecan Company", "info@sansabapecan.com", "USA", "San Saba, TX", "Mark Brown (General Manager)", "your gourmet Texas pecan halves and gift tins deserve an ultra-luxurious visual presentation and seamless checkout."),
    ("Natursource", "info@natursource.com", "Canada", "Saint-Laurent, QC", "Garry Oberfield (CEO)", "your premium salad toppers, tamari roasted almonds, and gourmet nut mixes would convert higher with custom snack subscriptions."),
    ("Organic Fair", "info@organicfair.com", "Canada", "Cobble Hill, BC", "Kent Goodwin (Co-Founder)", "your Vancouver Island organic nut snacks and dried fruit confections would shine on a modern luxury storefront."),
    ("Hornby Organic", "info@hornbyorganic.com", "Canada", "Hornby Island, BC", "Cayleigh Anderson (Co-Founder)", "your organic seed bars and artisanal nut butter snacks deserve a high-speed, mobile-optimized online store."),
    ("Prana Bio Organic", "info@pranabio.com", "Canada", "Montreal, QC", "Alon Farber (President)", "your organic Chia seeds, dried Turkish figs, and raw almonds would drive stronger repeat orders on a Next.js platform."),
    ("Fruit d'Or Ingredients", "sales@fruitdor.ca", "Canada", "Plessisville, QC", "Sales Directorate", "your organic Canadian cranberries and wild blueberries would convert higher with our turnkey B2B portal."),

    # UK & Ireland (40 candidates)
    ("The Walnut Tree Gourmet Gifts", "info@walnut.gifts", "UK", "London, UK", "Beverley Frank (Founder)", "your luxury dried fruit boxes and marzipan-stuffed dates are celebrated at Harrods; our online store would elevate your DTC gifting."),
    ("Ritter Courivaud Specialty Foods", "enquiries@rittercourivaud.co.uk", "UK", "Leicester, UK", "Alain Courivaud (Managing Director)", "your fine French dried fruits, pine nuts, and pastry ingredients deserve an automated corporate ordering portal."),
    ("Forest Whole Foods", "hello@forestwholefoods.co.uk", "UK", "Swanage, Dorset", "Chloe Phillips (Director)", "your 100% certified organic dried mulberries, goji berries, and raw walnuts would convert higher with automated pantry subscriptions."),
    ("Grape Tree Natural Wholefoods", "info@grapetree.co.uk", "UK", "Kingswinford, UK", "Nick Shutts (Founder)", "with over 140 UK stores, your dried fruits and roasting nuts would see higher digital basket values with our custom gift tin builder."),
    ("Buy Whole Foods Online UK", "enquiries@buywholefoodsonline.co.uk", "UK", "Minster, Kent", "Arthur Martin (Director)", "your vast collection of organic whole nuts, dried fruits, and baking seeds would convert higher with interactive mix composers."),
    ("Clearspring Organic Foods", "info@clearspring.co.uk", "UK", "London, UK", "Christopher Dawson (Founder)", "your Japanese organic seed snacks and dried fruits deserve an ultra-luxurious, minimalist digital boutique."),
    ("Just Natural Organic Foods", "info@justnatural.co.uk", "UK", "Barnsley, UK", "Mark Armstrong (Director)", "your pre-packed organic dry fruits and raw nut kernels would benefit from our turnkey consumer e-commerce storefront."),
    ("Hodmedod's British Pulses & Seeds", "hello@hodmedods.co.uk", "UK", "Halesworth, Suffolk", "Nick Saltmarsh (Co-Founder)", "your British-grown roasted fava beans, pumpkin seeds, and specialty grains deserve an elevated, storytelling-rich digital storefront."),
    ("Biona Organic / Windmill Organics", "info@biona.co.uk", "UK", "London, UK", "Donata Kingston (Director)", "your organic dried mango, medjool dates, and roasted nut spreads would convert higher with our streamlined mobile checkout."),
    ("Tropical Wholefoods", "info@tropicalwholefoods.com", "UK", "Sunderland, UK", "Adam Brett (Founder)", "pioneering fair-trade dried bananas, mangoes, and cashews, your ethical story deserves a modern luxury web presence."),
    ("Sunmark Fine Foods", "info@sunmark.co.uk", "UK", "Greenford, UK", "Sunny Sharma (Chairman)", "your international distribution of premium dry fruits and roasted snacks would benefit from our automated corporate wholesale portal."),
    ("Tree Harvest Organic Nuts", "info@treeharvest.co.uk", "UK", "Holsworthy, Devon", "Peter Harris (Director)", "your single-estate organic Brazil nuts, walnuts, and dried dates would see higher order values with our custom gift tin builder."),
    ("Artisan Hamper Company", "info@artisanhampers.co.uk", "UK", "Cotswolds, UK", "James Montgomery (Owner)", "your luxury Cotswolds food hampers and roasted nut selections deserve an interactive custom hamper configurator."),
    ("Highland Fayre Gourmet Gifts", "sales@highlandfayre.co.uk", "UK", "Perth, Scotland", "Kerri Ferguson (Director)", "Scotland's leading hamper company would achieve higher corporate gifting conversion with our interactive custom box composer."),
    ("Spicers of Hythe Hampers", "info@spicersofhythe.co.uk", "UK", "Hythe, Kent", "Percy Spicer (Director)", "curating luxury food hampers since 1926, your artisanal dry fruit and nut gifts deserve an ultra-modern digital storefront."),
    ("Virginia Hayward The Hamper Company", "sales@virginiahayward.com", "UK", "Shaftesbury, Dorset", "Sam Hayward (Managing Director)", "your premium holiday hampers and roasted nut selections would benefit from our multi-address corporate checkout portal."),
    ("Borough Market Gourmet Roasters", "info@boroughmarket.co.uk", "UK", "London, UK", "Jane Swift (CEO)", "London's premier historic food market draws global tourists; a dedicated turnkey online gift shop would turn visitors into repeat subscribers."),
    ("Cotswold Gourmet Hampers", "info@thecotswoldgourmet.co.uk", "UK", "Cirencester, UK", "Simon Hirst (Owner)", "your luxury British food hampers with artisanal roasted nuts and dried fruits would convert higher with an automated gift customizer."),
    ("Dukeshill Luxury Hampers", "enquiries@dukeshill.co.uk", "UK", "Telford, Shropshire", "Mark Duske (Managing Director)", "Royal Warrant holder for artisan meats and gourmet nut gifts, your luxury online presentation deserves a high-speed Next.js storefront."),
    ("Melrose and Morgan Grocery", "orders@melroseandmorgan.com", "UK", "Primrose Hill, London", "Ian James (Co-Founder)", "your Primrose Hill artisan grocery and specialty dried fruit tins deserve an editorial, luxury digital storefront."),
    ("Daylesford Organic Farm", "guest.services@daylesford.com", "UK", "Kingham, Gloucestershire", "Carole Bamford (Founder)", "your organic seed mixes, roasted nuts, and dried orchard fruits deserve an ultra-luxurious e-commerce showcase."),
    ("Farmison & Co Gourmet Gifts", "care@farmison.com", "UK", "Ripon, North Yorkshire", "John Pallagi (Founder)", "your heritage festive hampers and gourmet roasted nut platters would convert higher with automated build-a-box checkout."),
    ("Cartwright & Butler", "info@cartwrightandbutler.co.uk", "UK", "Gilberdyke, East Yorkshire", "Tony Arnett (Director)", "your iconic embossed tin gift boxes and salted caramel nuts would see higher conversion with custom gift box composers."),
    ("Lunya Catalan Deli & Nuts", "info@lunya.co.uk", "UK", "Liverpool, UK", "Peter Kinsella (Co-Founder)", "your artisan Spanish Marcona almonds and Catalan dried figs would convert at a premium with our luxury digital storefront."),
    ("Brindisa Spanish Gourmet Nuts", "homedelivery@brindisa.com", "UK", "Borough Market, London", "Monika Linton (Founder)", "your salted Marcona almonds, toasted hazelnuts, and dried persimmons deserve an ultra-luxurious direct-to-consumer store."),
    ("Mevalia Gourmet Foods", "info@mevalia.co.uk", "UK", "Birmingham, UK", "Paul Richardson (Director)", "your specialty diet dried fruits and seed crackers would drive higher recurring subscriptions on a modern Next.js platform."),
    ("Planet Organic UK", "info@planetorganic.com", "UK", "London, UK", "Renée Elliott (Founder)", "the UK's first organic supermarket could capture higher margins on raw bulk nuts and dried fruits with our turnkey subscription portal."),
    ("Whole Foods Market UK", "uk.customerservice@wholefoods.com", "UK", "Kensington, London", "UK Executive Team", "your flagship Kensington store draws gourmet shoppers; our interactive custom gift box builder would supercharge corporate orders."),
    ("Neal's Yard Remedies Superfoods", "advice@nealsyardremedies.com", "UK", "Covent Garden, London", "Anabel Kindersley (Co-Owner)", "your organic pumpkin seeds, flax seeds, and functional dried berries deserve a modern, high-converting digital storefront."),
    ("Pukka Herbs Functional Seeds", "info@pukkaherbs.com", "UK", "Keynsham, Bristol", "Sebastian Pole (Co-Founder)", "your organic wellness blends and seed preparations would benefit from an automated monthly recurring subscription engine."),
    ("Gould Campbell Fine Foods", "info@gouldcampbell.co.uk", "UK", "London, UK", "Andrew Campbell (Director)", "your vintage port and roasted gourmet nut gift selections would thrive with our turnkey luxury gift box configurator."),
    ("Bumbles Gourmet Hampers", "info@bumblesonline.co.uk", "UK", "Dundee, Scotland", "David Stewart (Owner)", "your Scottish artisan food hampers and dried berry selections would achieve higher corporate sales with our custom box builder."),
    ("Ballycross Apple Farm & Dried Fruit", "info@ballycross.com", "Ireland", "Bridgetown, Wexford", "Arnold Von Engelbrechten (Owner)", "your orchard dried fruits and artisanal farm juices deserve an elevated digital storefront with nationwide shipping."),
    ("The Scullery Gourmet Hampers", "info@thescullery.ie", "Ireland", "Nenagh, Tipperary", "Florrie Purcell (Founder)", "your handmade Irish preserves, spiced nuts, and holiday hampers would convert higher with an automated gift customizer."),
    ("Sheridans Cheesemongers & Nut Hampers", "info@sheridanscheesemongers.com", "Ireland", "Kells, Meath", "Kevin Sheridan (Co-Founder)", "Ireland's premier cheesemongers would see higher festive cart values with an interactive dried fruit and nut pairing configurator.")
]

print(f"Total candidates in pool: {len(candidates)}")

valid_candidates = []
for c in candidates:
    name, email, country, city, owner, reason = c
    clean_email = email.lower().strip()
    domain = clean_email.split("@")[-1]

    if clean_email in all_seen:
        print(f"❌ DUP: {name} ({clean_email})")
        continue

    has_mx, recs = check_mx(domain)
    if not has_mx:
        print(f"❌ MX FAIL: {name} ({domain})")
        continue

    print(f"✅ PASS: {name[:30].ljust(30)} | {clean_email[:28].ljust(28)} | {recs[0][:35]}")
    valid_candidates.append(c)

print(f"\nTotal Valid from first pool: {len(valid_candidates)}")
