import frappe
import requests
import json
import datetime

def before_save(doc, method):
    """Update last_data_update only when the user changes data, 
    not when Gemini is writing back the report."""
    if not getattr(doc.flags, "generating_report", False):
        doc.last_data_update = frappe.utils.now_datetime()

def format_friendly_date(date_str):
    """Convert YYYY-MM-DD to 'Saturday, 06 September 2025'"""
    dt = datetime.datetime.strptime(str(date_str), "%Y-%m-%d")
    return dt.strftime("%A, %d %B %Y")

def get_gemini_api_key():
    """Fetch Gemini API key from cache or API Keys Settings singleton"""
    cache = frappe.cache()
    api_key = cache.get_value("gemini_api_key")

    if not api_key:
        settings = frappe.get_single("API Keys Settings")
        api_key = settings.get_password("gemini_api_key")
        if not api_key:
            frappe.throw("Gemini API key is not set. Please configure it in API Keys Settings.")

        # Store in cache for 12 hours (43200 seconds)
        cache.set_value("gemini_api_key", api_key, expires_in_sec=43200)

    return api_key


@frappe.whitelist()
def generate_weekly_report(docname):
    doc = frappe.get_doc("Weekly Regional Report", docname)
    
    start_fmt = format_friendly_date(doc.week_start_date)
    end_fmt = format_friendly_date(doc.week_end_date)
    
    period_sentence = f"for the period of {start_fmt} to {end_fmt}."

    # Prepare structured data (serialize child tables as JSON)
    # context = {
    #     "region": doc.region,
    #     "week_start": str(doc.week_start_date),
    #     "week_end": str(doc.week_end_date),
    #     "demand_reduction": [row.as_dict() for row in doc.counselling_education],
    #     "postal": [row.as_dict() for row in doc.postal_courier_operations],
    #     "airport": [row.as_dict() for row in doc.airport_operations],
    #     "border": [row.as_dict() for row in doc.land_border_operations],
    #     "challenges": [row.as_dict() for row in doc.operational_challenges],
    #     "recommendations": [row.as_dict() for row in doc.recommendations],
    # }
    
    context = {
        "region": doc.region,
        "week_start": format_friendly_date(doc.week_start_date),
        "week_end": format_friendly_date(doc.week_end_date),

        "demand_reduction": [
            {
                "date": format_friendly_date(row.activity_date),
                "institution": row.institution,
                "participants": row.no_of_participants,
                "male": row.male_count,
                "female": row.female_count,
                "topics_covered": row.topics_covered,
                "remarks": row.remarks,
            }
            for row in doc.counselling_education
        ],

        "postal": [
            {
                "date": format_friendly_date(row.date),
                "parcels_examined": row.parcels_examined,
                "outbound": row.outbound_parcels,
                "inbound": row.inbound_parcels,
                "destinations": row.destination_countries,
                "origins": row.origin_countries,
            }
            for row in doc.postal_courier_operations
        ],

        "airport": [
            {
                "date": format_friendly_date(row.date),
                "flights_arrived": row.flights_arrived,
                "flights_departed": row.flights_departed,
                "passengers": row.total_passengers,
                "searched": row.passengers_searched,
            }
            for row in doc.airport_operations
        ],

        "land_border": [
            {
                "date": format_friendly_date(row.date),
                "border_post": row.border_post,
                "passengers": row.passengers_profiled,
                "luggage": row.luggage_searched,
                "vehicles_inbound": row.vehicles_inbound,
                "vehicles_outbound": row.vehicles_outbound,
            }
            for row in doc.land_border_operations
        ],

        "challenges": [
            {"category": row.category, "description": row.description}
            for row in doc.operational_challenges
        ],

        "recommendations": [
            {"category": row.category, "description": row.description}
            for row in doc.recommendations
        ],
    }

    data_json = json.dumps(context, indent=2, default=str)

    # Prompt with strict template
    prompt = f"""
You are generating a **formal weekly report** for the {doc.region} Regional Command,
{period_sentence}.

STRICT INSTRUCTIONS:
- Keep the Introduction section fixed: "This report presents the activities undertaken by the {doc.region} Regional Command {period_sentence}"
- You may add one extra sentence about the scope (demand reduction, enforcement, challenges, recommendations) to the introduction.
- Do not rephrase or omit the period sentence.
- Use ONLY the JSON data provided below. Do not invent or guess numbers, locations, or incidents.
- If a section has no entries, write: "No activities recorded".
- Follow the official structure EXACTLY.

Data (JSON):
{data_json}

Output format:

RESTRICTED

{doc.region.upper()} REGIONAL COMMAND

REPORT ON ACTIVITIES FROM {start_fmt} TO {end_fmt}

1.0 Introduction
[Provide an overview of the week’s activities]

2.0 Demand Reduction
[Summarize counselling and education activities. Include locations, number of participants,
male/female breakdown, and topics covered. If none, state "No activities recorded"]

3.0 Enforcement and Control
3.1 Postal and Courier Services
[Summarize total inbound/outbound parcels, origins/destinations, and any incidents. If none, state "No activities recorded"]

3.2 Airport Operations
[Summarize flights, passengers, searches, and incidents. If none, state "No activities recorded"]

3.3 Land Border Control
[Summarize passengers profiled, luggage searched, vehicles crossing. Provide breakdown by border post. If none, state "No activities recorded"]

4.0 Challenges
[List by category with description, or "No activities recorded"]

5.0 Recommendations
[List by category with description, or "No recommendations recorded"]

6.0 Conclusion
[Closing note on commitment to duties]
"""

    # Call Gemini API
    api_key = get_gemini_api_key()
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    response = requests.post(url, headers=headers, json=payload)

    if response.status_code != 200:
        frappe.throw(f"Gemini API request failed: {response.text}")

    result = response.json()

    # Extract text safely
    try:
        report_text = result["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        frappe.throw(f"Unexpected Gemini response: {result}")

    # Save back into field
    doc.flags.generating_report = True
    doc.weekly_report = report_text
    doc.last_generated_on = frappe.utils.now_datetime()
    doc.save(ignore_permissions=True)

    return report_text
