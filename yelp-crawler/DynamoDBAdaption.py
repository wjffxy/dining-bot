from __future__ import print_function # Python 2/3 compatibility
import boto3
import json
import decimal
from datetime import datetime

dynamodb = boto3.resource('dynamodb', region_name='us-east-1', endpoint_url="https://dynamodb-fips.us-east-1.amazonaws.com")

table = dynamodb.Table('yelp-restaurants')
cuisines = ['chinese', 'italian', 'korean', 'japanese', 'indian', 'mexican', 'american', 'french']

for cuisine in cuisines:
    with open("{}_data.json".format(cuisine)) as json_file:
        movies = json.load(json_file, parse_float = decimal.Decimal)
        for movie in movies:
            for j in movies[movie]["businesses"]:
                Business_id = j['id'] if j['id'] is not None else "None"
                name = j['name'] if j['name'] is not None else "None"
                address = j['location']['address1'] if(isinstance(j['location']['address1'], str) and j['location']['address1'] != "") else "None"
                coordinates = j['coordinates'] if j['coordinates'] is not None else "None"
                review_count = int(j['review_count'])
                rating = decimal.Decimal(j['rating'])
                zip_code = j['location']['zip_code']  if(isinstance(j['location']['zip_code'], str) and j['location']['zip_code'] != "") else "None"
                #print(Business_id,zip_code)
                table.put_item(
                                Item={
                                'Business_id': Business_id,
                                'cusine_type': "french",
                                'name': name,
                                'address': address,
                                'coordinates': coordinates,
                                'Number of Reviews': review_count,
                                'insertedAtTimestamp': datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
                                'rating': rating,
                                'Zip_Code': zip_code

                                }
                                )

