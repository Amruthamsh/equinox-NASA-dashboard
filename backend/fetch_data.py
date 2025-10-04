import requests
import json

# USAspending API endpoint for a list of awards (contracts and financial assistance)
USASPENDING_API_URL = "https://api.usaspending.gov/api/v2/search/spending_by_award/"

# Define the query with the required 'filters' object
# NASA's top-tier agency code is 080.
payload = {
    "subawards": False,
    "limit": 5, # Request only 5 records for a sample
    "filters": {
        "time_period": [
            {"start_date": "2023-10-01", "end_date": "2024-09-30"} # Example: Fiscal Year 2024
        ],
        "agencies": [
            # Using the official top-tier agency code (080) is the most reliable method
            {"type": "awarding", "tier": "toptier", "name": "National Aeronautics and Space Administration"}
        ],
        # A: Block Grant, B: Formula Grant, C: Project Grant, D: Cooperative Agreement
        "award_type_codes": ["A", "B", "C", "D"] 
    },
    # The API also requires the 'fields' parameter to specify what data to return
    "fields": [
        "total_obligation",
        "generated_unique_award_id",
        "recipient_name",
        "description"
    ]
}

headers = {'Content-Type': 'application/json'}

print("Querying USAspending API for NASA Grants...")

try:
    # Use POST request for search APIs
    response = requests.post(USASPENDING_API_URL, headers=headers, data=json.dumps(payload))
    response.raise_for_status()
    data = response.json()
    
    print("\n--- USAspending API Results Summary ---")
    
    if data.get('results'):
        print(f"Retrieved {len(data['results'])} award records.")
        print("\n--- Detailed Grants (First 5 Entries) ---")
        for i, award in enumerate(data['results'][:5]):
            print(f"  {i+1}. Award ID: {award.get('generated_unique_award_id')}")
            print(f"      Recipient: {award.get('recipient_name')}")
            
            amount = award.get('total_obligation', 'N/A')
            if isinstance(amount, (int, float)):
                amount_str = f"${amount:,.2f}"
            else:
                amount_str = amount
            print(f"      Amount Obligated: {amount_str}")
            print(f"      Description: {award.get('description', 'N/A')[:50]}...")
            print("-" * 20)
    else:
        print("No results found for the specified period and agency.")

except requests.exceptions.RequestException as e:
    # Catch any remaining errors
    print(f"\nError accessing USAspending API: {e}")
except json.JSONDecodeError:
    print("\nError: Could not decode JSON response.")