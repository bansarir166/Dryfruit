import json
import subprocess

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

pool3 = [
    ("Clif Bar & Company", "info@clifbar.com", "USA", "Emeryville, CA", "Sally Grimes (CEO)", "your iconic whole nut and fruit energy bars deserve an elevated, high-converting direct-to-consumer digital storefront."),
    ("KIND Snacks", "customerservice@kindsnacks.com", "USA", "New York, NY", "Daniel Lubetzky (Founder)", "the pioneer of whole nut & fruit snacking would achieve higher average order values with custom gift packaging modules."),
    ("LÄRABAR Whole Food Snacks", "info@larabar.com", "USA", "Minneapolis, MN", "Lara Merriken (Founder)", "your 2-to-9 ingredient real food bars with Medjool dates and whole almonds deserve an ultra-luxurious e-commerce showcase."),
    ("Nature's Bakery", "info@naturesbakery.com", "USA", "Reno, NV", "Dave Marson (Founder)", "your real fruit & whole wheat fig bars and date bars would convert higher with automated recurring household subscriptions."),
    ("RXBAR / Insurgent Brands", "info@rxbar.com", "USA", "Chicago, IL", "Peter Rahal (Co-Founder)", "your minimalist egg white, date, and almond bars deserve a high-converting, lightning-fast digital storefront."),
    ("GoMacro", "info@gomacro.com", "USA", "Viola, WI", "Jola Sonkin (CEO)", "your certified organic, vegan nut butter bars would drive stronger recurring subscriptions on a modern Next.js platform."),
    ("NuGo Nutrition", "info@nugonutrition.com", "USA", "Oakmont, PA", "David Levine (CEO)", "your real dark chocolate coated almond and cashew bars would see higher conversion with custom variety pack builders."),
    ("Think! Protein & Nut Snacks", "info@thinkproducts.com", "USA", "Downers Grove, IL", "Brand Management", "your high-protein roasted nut bars and keto snack treats would thrive with our turnkey consumer e-commerce cart."),
    ("Purely Elizabeth", "info@purelyelizabeth.com", "USA", "Boulder, CO", "Elizabeth Stein (Founder)", "your ancient grain and superfood seed granolas with dried coconut and cashews deserve an elevated luxury digital storefront."),
    ("Bear Naked Granola", "info@bearnaked.com", "USA", "Solon, OH", "Brand Team", "your custom nut and dried fruit trail mixes would achieve higher order values with our interactive build-a-tin composer."),
    ("One Degree Organic Foods", "info@onedegreeorganics.com", "Canada", "Abbotsford, BC", "Stan Smith (Co-Founder)", "your sprouted organic seeds, grains, and dried fruit granolas with 100% farm transparency deserve a flagship digital boutique."),
    ("Grandy Organics", "info@grandyorganics.com", "USA", "Hiram, ME", "Aaron Anker (Chief Granola Officer)", "your organic roasted nuts and small-batch trail mixes powered by solar energy deserve an ultra-luxurious DTC store."),
    ("Early Bird Granola", "info@earlybirdgranola.com", "USA", "Brooklyn, NY", "Nekisia Davis (Founder)", "your olive oil roasted pecans and dried cherries from Brooklyn would see higher margins with automated corporate gifting tins."),
    ("Michele's Granola", "info@michelesgranola.com", "USA", "Timonium, MD", "Michele Tsucalas (Founder)", "your scratch-made artisanal granolas with whole almonds, pecans, and pumpkin seeds deserve an ultra-fast modern web store."),
    ("Bakery On Main", "info@bakeryonmain.com", "USA", "East Hartford, CT", "Michael Smulders (Founder)", "your certified gluten-free roasted nut granolas and sprouted seed snacks would convert higher with our express mobile checkout."),
    ("Safe + Fair Food Company", "info@safeandfair.com", "USA", "Chicago, IL", "Will Sloss (CEO)", "your allergen-friendly roasted seed snack mixes and dried fruit granolas deserve an elevated digital direct-to-consumer store."),
    ("MadeGood Foods", "info@madegoodfoods.com", "Canada", "Concord, ON", "Nima Mirpourian (Founder)", "your organic dried fruit granola minis with vegetable extracts would drive higher basket sizes with customized multipack composers."),
    ("Heavenly Organics", "info@heavenlyorganics.com", "USA", "Fairfield, IA", "Amit Hooda (CEO)", "your 100% organic raw white honey patties and roasted almond clusters deserve an ultra-luxurious direct-to-consumer showcase."),
    ("YumEarth Organic", "info@yumearth.com", "USA", "Stamford, CT", "Jonah Smith (CEO)", "your allergy-friendly fruit snacks and organic treats would see higher conversion with custom holiday gift packaging."),
    ("Unreal Snacks", "info@unrealsnacks.com", "USA", "Boston, MA", "Nicky Bronner (Co-Founder)", "your fair trade dark chocolate covered almonds and peanut butter cups deserve a vibrant, high-speed direct storefront."),
    ("Hu Kitchen", "info@hukitchen.com", "USA", "New York, NY", "Jason Karp (Co-Founder)", "your organic paleo dark chocolate with almonds, hazelnuts, and cashew butter deserve an editorial luxury e-commerce experience."),
    ("TCHO Chocolate & Nuts", "info@tcho.com", "USA", "Berkeley, CA", "Brad Kintzer (Chief Chocolate Maker)", "your single-origin plant-based chocolates with roasted almonds and sea-salt hazelnuts deserve an ultra-luxurious web boutique."),
    ("Theo Chocolate", "info@theochocolate.com", "USA", "Seattle, WA", "Etienne Patout (CEO)", "organic fair-trade chocolate bars with salted almond and cherry would achieve higher gifting conversion with our custom box composer."),
    ("Alter Eco Organic Foods", "info@alterecofoods.com", "USA", "San Francisco, CA", "Antoine Ambert (General Manager)", "your organic regeneratively farmed dried fruit, nut truffles, and superfood snacks deserve a flagship digital storefront."),
    ("Endangered Species Chocolate", "info@chocolatebar.com", "USA", "Indianapolis, IN", "Curt Vander Meer (CEO)", "your ethically traded dark chocolate with blueberries, almonds, and hazelnuts would convert higher with curated gift set builders."),
    ("Once Again Nut Butter", "info@onceagainnutbutter.com", "USA", "Nunda, NY", "Bob Rossi (General Manager)", "employee-owned since 1976, your organic almond, cashew, and sunflower seed butters deserve a modern high-speed DTC store."),
    ("Georgia Grinders", "info@georgiagrinders.com", "USA", "Atlanta, GA", "Jaime Foster (Founder)", "your small-batch handcrafted cashew, almond, and pecan butters would see higher average order values with custom gift box composers."),
    ("Big Spoon Roasters", "info@bigspoonroasters.com", "USA", "Durham, NC", "Mark Overbay (Founder)", "your small-batch nut butters and handcrafted snack bars made with heirloom nuts deserve an ultra-luxurious digital boutique."),
    ("Ground Up PDX", "info@grounduppdx.com", "USA", "Portland, OR", "Julie Sullivan (Co-Founder)", "your palm-free sweet and savory nut butters with roasted cashews and coconut would drive higher repeat subscriptions on Next.js."),
    ("Wild Friends Foods", "info@wildfriendsfoods.com", "USA", "Portland, OR", "Keeley Tillotson (Co-Founder)", "your friendly almond and peanut butters and oat & seed cups would convert higher with an express one-click mobile cart."),
    ("Saratoga Peanut Butter Co.", "info@yopeanuts.com", "USA", "Saratoga Springs, NY", "Jessica Gardner (Founder)", "your small-batch flavored peanut and almond butters would see higher average order values with customized gift set composers."),
    ("Eliot's Nut Butters", "info@eliotsnutbutters.com", "USA", "Portland, OR", "Michael White (Founder)", "your adult nut butters like spicy Thai peanut and honey cardamom almond deserve an elevated gourmet digital showcase."),
    ("Fix & Fogg", "info@fixandfogg.com", "New Zealand", "Wellington, New Zealand", "Roman Jewell (Founder)", "your award-winning gourmet peanut, almond, and cashew nut butters from Wellington would convert higher with our turnkey store."),
    ("Pic's Peanut Butter", "info@picspeanutbutter.com", "New Zealand", "Nelson, New Zealand", "Pic Picot (Founder)", "Nelson's iconic all-natural roasted nut butters and snack packs deserve a modern, international multi-currency web store."),
    ("Mayver's Pure Health", "info@mayvers.com.au", "Australia", "Melbourne, VIC", "Paul Raff (Managing Director)", "Australia's family-owned natural roasted peanut and almond spread leader would benefit from automated pantry subscriptions."),
    ("Melrose Health", "info@melrosehealth.com.au", "Australia", "Melbourne, VIC", "Geoff Newing (CEO)", "your cold-pressed organic nut oils, flax seeds, and almond butter spreads deserve an ultra-luxurious direct-to-consumer store."),
    ("Carman's Kitchen", "info@carmanskitchen.com.au", "Australia", "Melbourne, VIC", "Carolyn Creswell (Founder)", "your roasted nut & fruit muesli bars, nut clusters, and protein seed mixes would achieve higher basket sizes on Next.js."),
    ("Tablelands Gourmet Nuts", "info@tablelandsgourmet.com.au", "Australia", "Mareeba, QLD", "David Armstrong (Owner)", "your tree-ripened Atherton Tablelands macadamias and roasted pecan gifts deserve a high-converting digital storefront."),
    ("Sanitarium Health Food Co", "info@sanitarium.com.au", "Australia", "Berkeley Vale, NSW", "Kevin Jackson (CEO)", "as a household Australian breakfast and roasted peanut butter brand, your direct consumer gifting store would thrive with our turnkey stack."),
    ("Rude Health Organic Snacks", "hello@rudehealth.com", "UK", "London, UK", "Nick Barnard (Co-Founder)", "your organic sprouted seed snacks, roasted almond drinks, and fruit granolas deserve an editorial luxury digital storefront."),
    ("Plenish Clean Snacks", "support@plenishdrinks.com", "UK", "London, UK", "Kara Rosen (Founder)", "your organic almond, cashew, and hazelnut beverages and seed blends deserve a modern, high-converting digital boutique."),
    ("Pip & Nut All-Natural Butters", "thekernel@pipandnut.com", "UK", "London, UK", "Pippa Murray (Founder)", "your palm-oil free roasted peanut and almond butters and nut cups would drive higher recurring consumer revenue on Next.js."),
    ("Meridian Foods", "info@meridianfoods.co.uk", "UK", "Glan Conwy, Wales", "Mark Breen (Managing Director)", "roasting 100% pure nuts with no added palm oil since 1989, your consumer web store would convert higher with automated subscriptions."),
    ("Deliciously Ella Gourmet Snacks", "hello@deliciouslyella.com", "UK", "London, UK", "Ella Mills (Founder)", "your natural date & nut energy balls, oat bars, and roasted seed snacks deserve an ultra-luxurious direct-to-consumer store."),
    ("Creative Nature Superfoods", "info@creativenature.com", "UK", "West Molesey, Surrey", "Julianne Ponan (CEO)", "your top 14 allergen-free raw seed bars, superfood berries, and roasting seeds would convert higher with custom variety pack builders."),
    ("Perkier Superfood Bars & Nuts", "hello@perkier.co.uk", "UK", "Slough, Berkshire", "Ann Perkins (Founder)", "your sprouted quinoa, chia seed, and whole nut snack bars would drive higher repeat subscriptions with our turnkey platform."),
    ("Trek High Protein Nut Bars", "info@trekbaruk.com", "UK", "London, UK", "Brand Team", "your 100% plant-based whole nut flapjacks and date-sweetened protein bars deserve an elevated digital direct-to-consumer store."),
    ("The Protein Ball Co", "info@theproteinballco.com", "UK", "Worthing, West Sussex", "Matt Hunt (Co-Founder)", "your all-natural date, nut, and seed snack balls would see higher average order values with custom subscription box composers."),
    ("Rollagranola Artisanal Nuts", "info@rollagranola.com", "UK", "Hitchin, Hertfordshire", "Robin Longden (Founder)", "your small-batch handmade granolas packed with up to 40% whole nuts and seeds deserve an ultra-luxurious digital boutique.")
]

print(f"Testing {len(pool3)} candidates in Pool 3...")

valid3 = []
for c in pool3:
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
    valid3.append(c)

print(f"\nTotal Valid in Pool 3: {len(valid3)}")
