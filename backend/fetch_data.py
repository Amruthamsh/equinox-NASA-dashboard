import requests
import json

# Define the base API URL and query parameters
BASE_URL = "https://technology.nasa.gov/api/api/"
QUERY_TYPE = "software" # Options: patent, software, spinoff
KEYWORD = "visualization"

# Construct the full API endpoint URL
api_url = f"{BASE_URL}{QUERY_TYPE}/{KEYWORD}"

print(f"Querying URL: {api_url}")

try:
    # Make the GET request to the NASA API
    response = requests.get(api_url)
    
    # Check for a successful response (status code 200)
    response.raise_for_status() 
    
    # Parse the JSON response
    data = response.json()
    
    # Print basic statistics
    print("\n--- API Query Results Summary ---")
    print(f"Total entries found: {data.get('total')}")
    print(f"Entries on this page: {data.get('count')}")
    
    # Iterate over the results and print key information
    if data and data.get('results'):
        print("\n--- Detailed Results (First 5 Entries) ---")
        for i, result in enumerate(data['results'][:5]):
            # The result structure is a list within a list, so we access the inner list elements by index
            # This API format typically returns a fixed order of fields (e.g., [ID, Case Number, Title, Description, ...])
            try:
                # Assuming index 2 is the Title and index 3 is the Description based on API documentation examples
                title = result[2]
                description = result[3]
                print(f"  {i+1}. Title: {title}")
                print(f"     Description snippet: {description[:100]}...") # Print first 100 characters of description
            except IndexError:
                print(f"  {i+1}. Result format unexpected: {result}")
            print("-" * 20)

    else:
        print("No results found for the keyword.")
        
except requests.exceptions.HTTPError as e:
    print(f"\nHTTP Error occurred: {e}")
except requests.exceptions.RequestException as e:
    print(f"\nAn error occurred during the API request: {e}")
except json.JSONDecodeError:
    print("\nError: Could not decode JSON response.")