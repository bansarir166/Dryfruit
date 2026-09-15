import os
import csv

def merge():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    file_300 = os.path.join(base_dir, "LEADS_300.csv")
    file_200_new = os.path.join(base_dir, "LEADS_200_NEW.csv")
    output_500 = os.path.join(base_dir, "LEADS_500.csv")

    leads = []
    seen_ids = set()

    standard_fields = [
        "id", "business_name", "country", "city", "maps_profile",
        "website_status", "social", "contact", "owner", "why_need_website", "quality"
    ]

    for path in [file_300, file_200_new]:
        if not os.path.exists(path):
            continue
        with open(path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                lid = int(row.get("id"))
                if lid and lid not in seen_ids:
                    seen_ids.add(lid)
                    clean_row = {k: row.get(k, "") for k in standard_fields}
                    leads.append(clean_row)

    if not leads:
        print("No leads found to merge.")
        return

    # Sort by ID
    leads.sort(key=lambda x: int(x["id"]))

    # Write LEADS_500.csv
    with open(output_500, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=standard_fields)
        writer.writeheader()
        writer.writerows(leads)

    print(f"Successfully consolidated {len(leads)} total leads into {output_500}")

if __name__ == "__main__":
    merge()
