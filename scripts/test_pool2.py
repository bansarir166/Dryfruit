import json
import subprocess
import sys

with open("/Users/sahil/Desktop/Dryfruit/sent_emails.json") as f:
    sent_list = json.load(f)
sent_emails = set(x.get("email", "").strip().lower() for x in sent_list)

with open("/Users/sahil/Desktop/Dryfruit/LEADS_BATCH_3.csv") as f:
    batch3_emails = set(line.split(",")[-4].split("|")[-1].strip().lower() for line in f if "@" in line)

all_seen = sent_emails.union(batch3_emails)

def check_mx(domain):
    try:
        out = subprocess.check_output(["dig", "+short", "MX", domain], timeout=4).decode()
        records = [line.strip() for line in out.splitlines() if line.strip()]
        valid_recs = [r for r in records if not r.endswith(".invalid.") and r != "0 ."]
        return len(valid_recs) > 0, valid_recs
    except Exception as e:
        return False, str(e)

pool2 = [
    # Europe
    ("Alnatura Bio", "kontakt@alnatura.de", "Germany", "Darmstadt, Germany", "Götz Rehn (Founder)", "your organic Medjool dates, dried cranberries, and nut mixes deserve an ultra-luxurious DTC storefront."),
    ("dmBio Snacks & Nuts", "servicecenter@dm.de", "Germany", "Karlsruhe, Germany", "Christoph Werner (CEO)", "your organic snack seeds and dried fruit selections would convert higher with an automated gift box builder."),
    ("Byodo Naturkost", "info@byodo.de", "Germany", "Mühldorf, Germany", "Michael Moßbacher (Founder)", "your 100% organic snack wafers, seeds, and oils deserve an elevated direct-to-consumer store."),
    ("Dr. Goerg Premium Coconut & Nuts", "info@drgoerg.com", "Germany", "Montabaur, Germany", "Manfred Görg (Founder)", "your organic raw coconut flakes and roasted snack treats would drive higher subscriptions on an ultra-fast store."),
    ("Govinda Natur", "info@govinda-natur.de", "Germany", "Neustadt, Germany", "Doris Maiwald (Founder)", "your sun-dried fruit balls, organic tiger nuts, and raw seeds deserve a modern, high-converting digital storefront."),
    ("Arche Naturküche", "info@arche-naturkueche.de", "Germany", "Hilden, Germany", "Stefan Hipp (Managing Director)", "your organic macrobiotic dried fruits and specialty seeds would shine on our turnkey luxury storefront."),
    ("Bohlsener Mühle", "info@bohlsener-muehle.de", "Germany", "Bohlsen, Germany", "Mathias Krause (Managing Director)", "your organic ancient grain and dried fruit snack biscuits would see higher conversion with custom gift bundling."),
    ("Zotter Schokolade & Nüsse", "schokolade@zotter.at", "Austria", "Riegersburg, Austria", "Josef Zotter (Founder)", "your hand-scooped chocolate-coated nuts and dried fruit confectionery deserve an editorial luxury e-commerce experience."),
    ("Bio Zentrale", "info@biozentrale.de", "Germany", "Ulfen, Germany", "Dirk Woywod (Managing Director)", "your organic dried apricots, walnuts, and snack mixes would benefit from our turnkey B2B and DTC ordering portal."),
    ("Allos Hof-Manufaktur", "info@allos.de", "Germany", "Bremen, Germany", "Evert Vermeer (Managing Director)", "your organic Amaranth seed bars, dried fruit bars, and nut spreads deserve a clean, modern digital boutique."),
    ("Sonnentor Kräuter & Früchte", "office@sonnentor.at", "Austria", "Zwettl, Austria", "Johannes Gutmann (Founder)", "your organic dried fruit teas, crunchy snack berries, and seeds deserve an ultra-luxurious e-commerce showcase."),
    ("Vivani Bio Schokolade & Nüsse", "info@vivani.de", "Germany", "Herford, Germany", "Gerrit Wesselink (Managing Director)", "your organic dark chocolate roasted almonds and dried fruit bars would convert higher with custom gift packaging."),
    ("Davert Bio", "info@davert.de", "Germany", "Ascheberg, Germany", "Erk Schuchhardt (Managing Director)", "your organic superfood chia seeds, goji berries, and roasted nuts would achieve higher retention with automated monthly pantry replenishment."),
    ("Venchi 1878", "customercare@venchi.com", "Italy", "Castelletto Stura, Cuneo", "Daniele Ferrero (CEO)", "your world-famous Chocoviar, Piedmont hazelnut nougat, and pistachio gift tins deserve a high-speed Next.js digital boutique."),
    ("Domori Fine Cacao & Nuts", "info@domori.com", "Italy", "None, Turin, Italy", "Andrea Macchione (CEO)", "your single-origin chocolates with Bronte pistachios and Piedmont hazelnuts deserve an editorial luxury storefront."),
    ("Guido Gobino Artisanal Hazelnuts", "info@guidogobino.it", "Italy", "Turin, Italy", "Guido Gobino (Founder)", "your Turin Giandujotto and sea-salt roasted Piedmont hazelnut treats would convert higher with an interactive custom tin builder."),
    ("Caffarel Piemonte Hazelnuts", "info@caffarel.com", "Italy", "Luserna San Giovanni, Italy", "Benedetto Vigna (Director)", "inventor of Gianduja using IGP Piedmont Hazelnuts, your heritage deserves a high-converting digital storefront."),
    ("Pastiglie Leone 1857", "info@pastiglieleone.com", "Italy", "Collegno, Turin, Italy", "Michela Petronio (President)", "your vintage-designed tin boxes with chocolate-coated nuts and dried fruit pastilles would excel with custom gift box composers."),
    ("Majani 1796", "info@majani.it", "Italy", "Bologna, Italy", "Francesco Mezzadri Majani (President)", "celebrated since 1796 for Cremino Fiat and roasted nut delicacies, our turnkey store would elevate your global luxury gifting sales."),
    ("Bodrato Cioccolato", "info@bodratocioccolato.it", "Italy", "Capriata d'Orba, Italy", "Fabio Bergaglio (Owner)", "your hand-dipped Piedmont hazelnuts and boeri cherry chocolates deserve an ultra-luxurious direct-to-consumer store."),
    ("Giraudi Cioccolato Artigianale", "info@giraudi.it", "Italy", "Castellazzo Bormida, Italy", "Giacomo Boidi (Master Chocolatier)", "your hand-crafted hazelnut spreads and roasted almond dragées would thrive on our high-converting luxury storefront."),
    ("Torrons Vicens", "info@vicens.com", "Spain", "Agramunt, Lleida, Spain", "Ángel Velasco (Owner)", "crafting artisanal Marcona almond turrón since 1775, your festive hampers would see higher average order values with custom tin builders."),
    ("Turrones 1880", "sac@almendraymiel.com", "Spain", "Jijona, Alicante, Spain", "José Manuel Sirvent (CEO)", "as the most expensive turrón in the world made with supreme Marcona almonds, your online store deserves a modern luxury Next.js experience."),
    ("El Almendro", "info@elalmendro.com", "Spain", "Madrid, Spain", "María Sánchez (Brand Director)", "synonymous with Spanish holiday almonds, an interactive custom gift tin builder would supercharge international corporate gifting."),
    ("Turrones Picó", "pico@turronpico.com", "Spain", "Jijona, Alicante, Spain", "Antonio Picó (Managing Director)", "your handcrafted Jijona and Alicante Marcona almond turrón would convert higher with express one-click international checkout."),
    ("Casa Mira Turrones", "info@casamira.es", "Madrid", "Madrid, Spain", "Carlos Méndez (Owner)", "Madrid's oldest artisan turrón maker (est. 1842) deserves a museum-grade digital boutique with year-round gourmet gifting options."),
    ("Frutos Secos Medina", "info@frutossecosmedina.com", "Spain", "Móstoles, Madrid, Spain", "Antonio Medina (CEO)", "your raw and roasted nuts, dried fruits, and organic seeds would capture higher retail margins with our turnkey direct cart."),
    ("Finca La Rosala", "info@fincalarosala.com", "Spain", "Calzada de Calatrava, Spain", "Pedro Ciudad (Founder)", "your wood-roasted artisanal nuts with truffle, rosemary, and lime would convert at a premium with customized gift boxes."),
    ("Les Fleurons d'Apt", "info@lesfleuronsdapt.com", "France", "Apt, Provence, France", "Philippe Blanc (General Manager)", "the world capital of candied fruit in Provence deserves a digital boutique with interactive build-a-box packaging."),
    ("Maison Cruzilles", "info@cruzilles.fr", "France", "Clermont-Ferrand, France", "Jean-Marie Cruzilles (President)", "master confiseur of glazed fruits, citrus peels, and fruit pastes since 1880, your online store would thrive on our luxury platform."),
    ("Lilamand Confiseur", "info@lilamand.com", "France", "Saint-Rémy-de-Provence, France", "Pierre Lilamand (5th Gen Owner)", "your five generations of candied melons, figs, and Provencal fruit delicacies deserve an ultra-luxurious digital boutique."),
    ("Maison du Pruneau", "contact@maisondupruneau.com", "France", "Lafitte-sur-Lot, France", "Patrick Vigneau (Owner)", "your hand-selected Agen prunes stuffed with prune cream and coated in dark chocolate would achieve higher orders with custom hampers."),
    ("Lou Prunel Bio", "contact@louprunel.com", "France", "Sainte-Livrade-sur-Lot, France", "Thierry Herbeaux (Director)", "your 100% organic IGP Agen dried prunes and fruit compotes deserve a modern, high-speed French and English digital storefront."),
    ("Askada Farm Organic Kimi Figs", "info@askada.gr", "Greece", "Kimi, Evia, Greece", "Stathis Papanastasiou (Founder)", "your PDO sun-dried organic Kimi figs and fig spreads deserve an editorial, Greek-island-inspired luxury web store."),
    ("Aegina Pistachio Cooperative", "info@aeginapistachio.gr", "Greece", "Aegina, Greece", "Nikos Athanasiou (President)", "celebrated for the world's most aromatic PDO Aegina pistachios, your cooperative would capture global consumer margins with our turnkey store."),

    # Middle East & GCC
    ("Al Mohamadia Dates", "info@almohamadia.com", "Saudi Arabia", "Riyadh, Saudi Arabia", "Sheikh Abdulrahman Al-Mohamadia (Chairman)", "your luxury Sukkari, Ajwa, and stuffed date gift boxes in royal packaging would thrive with an interactive custom box configurator."),
    ("Al Ansar Golden Dates", "info@alansardates.com", "Saudi Arabia", "Madinah, Saudi Arabia", "Mohamed Al-Ansar (Managing Director)", "operating from the Holy City of Madinah, your premium organic Ajwa dates deserve a bilingual Arabic-English luxury store with global delivery."),
    ("Tamrah Dates & Confectionery", "info@tamrah.ae", "UAE", "Dubai, UAE", "Rami Al-Khatib (Managing Director)", "your chocolate-covered stuffed dates with almonds are a global duty-free sensation; a dedicated DTC store would supercharge holiday gift orders."),
    ("Chocodate by Notions Group", "info@notionsgroup.com", "UAE", "Dubai, UAE", "Fawaz Masri (CEO)", "the original Arabian date stuffed with golden almond and draped in European chocolate deserves an ultra-luxurious e-commerce showcase."),
    ("Hunter Foods Gourmet Snacks", "info@hunterfoods.com", "UAE", "JAFZA, Dubai, UAE", "Ananya Narayan (Managing Director)", "your hand-cooked superfood seed snacks and roasted nut pouches would see higher conversion with automated subscription delivery."),
    ("Bayara (Gyma Food)", "info@bayara.com", "UAE", "Dubai Investments Park, UAE", "Jean-Willy Triscos (Managing Director)", "the Middle East's leading brand of roasted nuts, dried fruits, and snack seeds would benefit from our turnkey corporate gifting portal."),
    ("Castania Nuts", "info@castanianuts.com", "UAE", "Dubai, UAE", "Peter Daniel (General Manager)", "your Lebanese mixed nuts and roasted pumpkin seeds would convert at higher order values with customized corporate snack boxes."),
    ("Al Douri Food Industries", "info@aldouri.com", "UAE", "Sharjah, UAE", "Ziad Al-Douri (Chairman)", "your premium roasted nuts, Syrian dried fruits, and festive gifting baskets deserve a high-speed, modern Next.js store."),
    ("House of Pops Healthy Snacks", "info@houseofpops.ae", "UAE", "Dubai, UAE", "Mazen Kanaan (Co-Founder)", "your 100% natural, fruit & nut plant-based snacking line would achieve higher customer retention with automated recurring subscriptions."),
    ("Munchbox Healthy Snacks", "info@munchbox.ae", "UAE", "Dubai, UAE", "Mahmoud Adham (Founder)", "your roasted nut snack packs and dried berries would drive higher corporate pantry orders with our turnkey multi-user ordering portal."),
    ("Freakin' Healthy", "info@freakinhealthy.com", "UAE", "Dubai, UAE", "Roy Koyess (Founder)", "your clean-label raw nut bars, almond butter bites, and dried fruit snacks deserve an elevated, instant-checkout digital storefront."),
    ("Royal Roastery Jordan", "info@royalroastery.com", "Jordan", "Amman, Jordan", "Hani Al-Qawasmi (General Manager)", "your freshly roasted Jordanian nuts, salted pistachios, and dried figs deserve an ultra-luxurious digital boutique with international checkout."),
    ("Al Ameed Roasted Nuts", "info@alameedcoffee.com", "Jordan", "Amman, Jordan", "Basel Al-Dahleh (Managing Director)", "your premium roasted nuts and artisan blends would see higher international sales with our turnkey multilingual e-commerce store."),
    ("Abu Auf Gourmet Nuts & Fruits", "customercare@abu-auf.com", "Egypt", "Cairo, Egypt", "Ahmed Auf (CEO)", "Egypt's premier healthy food and gourmet nut boutique chain would achieve higher online reach with custom corporate gift tin builders."),
    ("El Batal Roastery", "info@elbatalnuts.com", "Egypt", "Cairo, Egypt", "Tarek El-Batal (Managing Partner)", "your freshly roasted Egyptian sunflower seeds, almonds, and dried apricots deserve a modern mobile-first digital storefront."),
    ("Linah Farms Organic Dates", "info@linahfarms.com", "Egypt", "Bahariya Oasis, Egypt", "Amr Radwan (Managing Director)", "your organic Bahariya Oasis Medjool dates would command higher margins with our turnkey direct-to-consumer luxury store."),
    ("Barari Organic Dates & Nuts", "info@bararigroup.com", "UAE", "Sharjah, UAE", "Seyed Mohammad (Director)", "your extensive distribution of Persian saffron, Iranian pistachios, and Medjool dates would benefit from our automated corporate gifting builder."),

    # Australia & New Zealand
    ("Torere Macadamias NZ", "info@toreremacadamias.co.nz", "New Zealand", "Opotiki, Bay of Plenty", "Vanessa Hayes (Founder)", "your organically certified, New Zealand-grown macadamias and roasted nut oils deserve an ultra-luxurious digital boutique."),
    ("Alison's Pantry Bulk Nuts", "info@alisonspantry.co.nz", "New Zealand", "Auckland, New Zealand", "Brand Directorate", "New Zealand's favorite self-selection nut and dried fruit brand could capture substantial direct sales with our custom mix composer."),
    ("Mother Earth New Zealand", "info@motherearth.co.nz", "New Zealand", "Auckland, New Zealand", "Mike Cullen (Managing Director)", "your roasted whole nuts, peanut butters, and dried fruit trail mixes would thrive on our high-speed Next.js digital storefront."),
    ("Tasti Products", "info@tasti.co.nz", "New Zealand", "Te Atatu Peninsula, Auckland", "Simon Hall (Executive Chairman)", "crafting nut bars and dried fruit snacks since 1932, your DTC consumer store would convert higher with automated snack subscriptions."),
    ("Healtheries Superfood Seeds", "info@healtheries.co.nz", "New Zealand", "Auckland, New Zealand", "Rachel Morrison (Brand Director)", "your functional chia seeds, flax seeds, and dried fruit snacks would drive higher recurring consumer revenue with our subscription engine."),
    ("Ceres Organics", "info@ceres.co.nz", "New Zealand", "Mount Wellington, Auckland", "Noel Josephson (Director)", "Australasia's first certified organic distributor would see higher DTC margins on raw nuts and dried fruits with our turnkey store."),
    ("Chantal Organics", "info@chantalorganics.co.nz", "New Zealand", "Napier, Hawke's Bay", "Florian Leuschner (CEO)", "your Hawke's Bay organic nut spreads and dried orchard fruits deserve an ultra-luxurious, minimalist digital storefront."),
    ("Australian Carob Co", "info@australiancarob.com", "Australia", "Eudunda, SA, Australia", "Michael Jolley (Owner)", "your organic Australian carob pods and roasted confectionery snacks would convert higher with our turnkey international store."),
    ("Kakadu Plum Co", "hello@kakaduplumco.com", "Australia", "Melbourne, VIC", "Tali Brash (Founder)", "celebrating native Australian wild-harvested Kakadu plums, dried berries, and seeds, your cultural story deserves an editorial luxury storefront."),
    ("Byron Bay Macadamia Muesli", "info@byronbaymuesli.com.au", "Australia", "Byron Bay, NSW", "Garry Wall (Founder)", "your handcrafted macadamia nut mueslis and roasted seed clusters would convert higher with our build-a-breakfast box composer."),

    # India
    ("Nutty Gritties", "care@nuttygritties.com", "India", "New Delhi, India", "Dinika Bhatia (Founder)", "your artisanal flavored nuts and corporate festive dry fruit gift hampers deserve a high-converting, lightning-fast storefront with instant UPI checkout."),
    ("Open Secret", "care@opensecret.in", "India", "Mumbai, India", "Ahana Gautam (Co-Founder)", "your un-junked nut snacks and holiday dry fruit gift boxes would thrive on a custom luxury storefront designed for high conversion."),
    ("Chitale Bandhu Mithai & Dry Fruits", "care@chitalebandhu.in", "India", "Pune, Maharashtra", "Indraneel Chitale (Partner)", "your iconic Pune confectionery, roasted dry fruits, and festive gift boxes would see higher nationwide reach with custom box builders."),
    ("Healthy Treat", "support@healthytreat.in", "India", "Jaipur, Rajasthan", "Divaksh Gupta (Founder)", "your 100% roasted dry fruit snack mixes and organic seeds deserve an elevated, instant-checkout digital storefront."),
    ("Eat Anytime Healthy Snacks", "support@eatanytime.in", "India", "Mumbai, Maharashtra", "Rishit Sanghvi (Founder)", "your energy nut bars, trail mixes, and dried berry pouches would drive higher repeat orders with automated monthly subscriptions."),
    ("Greenbrrew Gourmet Snacks", "support@greenbrrew.com", "India", "New Delhi, India", "Aditya Goel (Founder)", "your roasted seed mixes and gourmet wellness snacks would achieve higher average order value with custom corporate gift bundles."),
    ("To Be Honest (TBH) Crunch", "hello@tobehonest.in", "India", "Noida, Uttar Pradesh", "Mayank Gupta (Founder)", "your vacuum-cooked dried fruit chips and spiced nuts deserve an ultra-modern, high-speed Next.js storefront."),
    ("The Whole Truth Foods", "help@thewholetruthfoods.com", "India", "Mumbai, Maharashtra", "Shashank Mehta (Founder)", "your 100% clean-label date & nut snack bars and raw nut butters deserve a transparent, high-converting digital storefront."),
    ("Beyond Snack", "support@beyondsnack.in", "India", "Kochi, Kerala", "Manas Madhu (Founder)", "your gourmet Kerala plantain and roasted nut crisps would drive higher basket sizes on a dedicated modern storefront."),
    ("Yoga Bar (Sproutlife Foods)", "info@yogabar.in", "India", "Bangalore, Karnataka", "Suhasini Sampath (Co-Founder)", "your breakfast whole grain nut bars and high-protein seed mixes would see higher subscriber retention with our turnkey platform."),
    ("Raw Pressery Healthy Snacks", "getin@rawpressery.com", "India", "Lower Parel, Mumbai", "Anuj Rakyan (Founder)", "your cold-pressed nut beverages and organic seed blends deserve an ultra-luxurious direct-to-consumer store."),
    ("Urban Platter Superfoods", "support@urbanplatter.in", "India", "Mahim, Mumbai", "Chirag Kenia (Founder)", "India's leading gourmet ingredients portal would see higher gifting conversion with our interactive custom dry fruit box builder."),
    ("Bikaji Foods International", "customercare@bikaji.com", "India", "Bikaner, Rajasthan", "Deepak Agarwal (Managing Director)", "Bikaji's royal Rajasthani dry fruit hampers and cashew treats deserve an ultra-fast, modern digital gifting boutique."),
    ("Karachi Bakery Dry Fruits", "info@karachibakery.com", "India", "Hyderabad, Telangana", "Rajesh Ramnani (Partner)", "your iconic Hyderabad fruit biscuits, roasted cashew tins, and festive dry fruit boxes deserve an elevated e-commerce store.")
]

print(f"Testing {len(pool2)} candidates in Pool 2...")

valid2 = []
for c in pool2:
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
    valid2.append(c)

print(f"\nTotal Valid in Pool 2: {len(valid2)}")
