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

pool4 = [
    ("Natural Balance Foods (Nākd)", "info@naturalbalancefoods.co.uk", "UK", "St Albans, Hertfordshire", "Jamie Combs (Co-Founder)", "your 100% whole fruit & nut raw snack bars would see higher customer lifetime value with automated pantry subscriptions."),
    ("Stoats Scottish Oats & Seeds", "info@eatstoats.com", "UK", "Edinburgh, Scotland", "Tony Stone (Co-Founder)", "your Scottish oat porridge bars, dried berries, and seed flapjacks deserve an ultra-fast modern consumer web store."),
    ("Nairn's Oatcakes & Fruit", "info@nairns-oatcakes.com", "UK", "Edinburgh, Scotland", "Mark Laing (Managing Director)", "your whole grain oatcakes, dark chocolate berry biscuits, and snack crackers would convert higher with our turnkey e-commerce store."),
    ("Paterson Arran Gourmet Shortbread", "info@paterson-arran.com", "UK", "Livingston, Scotland", "Alan Paterson (Director)", "baking traditional Scottish shortbread and oatcakes since 1895, your holiday gift tins deserve an interactive custom tin builder."),
    ("Walkers Shortbread & Fruit Cakes", "info@walkers-shortbread.com", "UK", "Aberlour, Speyside", "Nicky Walker (Managing Director)", "Royal Warrant holder famous for Speyside shortbread and rich fruit cakes, your international online store would thrive on Next.js."),
    ("Island Bakery Organic", "info@islandbakery.scot", "UK", "Isle of Mull, Scotland", "Joe Reade (Founder)", "powered by renewable wind and water on the Isle of Mull, your organic lemon melts and oat & nut biscuits deserve a luxury digital showcase."),
    ("Nutural World Stone Ground Nuts", "info@nuturalworld.com", "UK", "Hendon, London", "Edan Nuriel (Founder)", "your Great Taste award-winning raw nut and seed spreads deserve an ultra-luxurious, minimalist digital storefront."),
    ("Elmhurst 1925 Milked Nuts", "info@elmhurst1925.com", "USA", "Elma, NY", "Henry Schwartz (CEO)", "your HydroRelease cold-milled walnut, almond, and cashew milks deserve an elevated digital direct-to-consumer store."),
    ("MALK Organics", "info@malkorganics.com", "USA", "Austin, TX", "August Vega (Co-Founder)", "your 100% organic sprouted almond and cashew milks without gums or oils would convert higher with flexible subscription ordering."),
    ("Califia Farms", "info@califiafarms.com", "USA", "Los Angeles, CA", "Dave Ritterbush (CEO)", "your plant-based almond milks, toasted coconut, and cold brew coffees would drive higher subscriber retention with our turnkey platform."),
    ("Forager Project", "info@foragerproject.com", "USA", "San Francisco, CA", "Stephen Williamson (Co-Founder)", "your organic creamy cashew milk yogurts, cheeses, and nut-based smoothies deserve a flagship direct-to-consumer digital boutique."),
    ("Kite Hill Artisan Nut Milk", "info@kite-hill.com", "USA", "Hayward, CA", "Tal Ronnen (Co-Founder)", "your chef-crafted almond milk ricotta, cream cheeses, and tortellini deserve an ultra-luxurious e-commerce showcase."),
    ("Harmless Harvest", "info@harmlessharvest.com", "USA", "San Francisco, CA", "Ben Mand (CEO)", "your organic Nam Hom coconut water and creamy coconut yogurt cups would see higher recurring subscription orders on Next.js."),
    ("Tate's Bake Shop & Nut Cookies", "info@tatesbakeshop.com", "USA", "Southampton, NY", "Kathleen King (Founder)", "your world-famous thin, crispy walnut and chocolate chip cookies from the Hamptons deserve an interactive corporate gift tin builder."),
    ("Levain Bakery Gourmet Gift Tins", "orders@levainbakery.com", "USA", "New York, NY", "Pam Weekes (Co-Founder)", "your legendary NYC chocolate walnut cookies and holiday gift boxes would convert even higher with our luxury custom gift box builder."),
    ("Jacques Torres Chocolate & Nuts", "customerservice@mrchocolate.com", "USA", "Brooklyn, NY", "Jacques Torres (Master Chocolatier)", "known as Mr. Chocolate, your chocolate-covered almonds, hazelnuts, and dried cherries deserve an ultra-luxurious digital boutique."),
    ("Vosges Haut-Chocolat", "support@vosgeschocolate.com", "USA", "Chicago, IL", "Katrina Markoff (Founder)", "your exotic dark chocolate truffles infused with Tasmanian sea salt and roasted nuts deserve an editorial luxury storefront."),
    ("Compartés Chocolatier", "support@compartes.com", "USA", "Los Angeles, CA", "Jonathan Grahm (CEO)", "your designer chocolate bars infused with California strawberries, vegan dates, and matcha pecans deserve an ultra-fast modern store."),
    ("Neuhaus Belgian Chocolates & Nuts", "customercare@neuhaus.be", "Belgium", "Vlezenbeek, Belgium", "Ignace Heyman (CEO)", "inventor of the Belgian praline in 1912 with roasted Mediterranean hazelnuts, your heritage deserves a museum-grade digital boutique."),
    ("Leonidas Confectionery & Pralines", "info@leonidas.com", "Belgium", "Brussels, Belgium", "Philippe de Selliers (CEO)", "your fresh Belgian butter pralines and roasted caramelized nuts would see higher international online sales with our turnkey store.")
]

valid4 = []
for c in pool4:
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
    valid4.append(c)

print(f"\nTotal Valid in Pool 4: {len(valid4)}")
