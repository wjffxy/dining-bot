from __future__ import print_function # Python 2/3 compatibility
import json
import decimal

f = open("data.json", "w+")
cuisines = ['chinese', 'italian', 'korean', 'japanese', 'indian', 'mexican', 'american', 'french']

cities = set()

for cuisine in cuisines:
    with open("{}_data.json".format(cuisine)) as json_file:
        responses = json.load(json_file, parse_float=decimal.Decimal)
        for index in responses:
            for business in responses[index]["businesses"]:
                id = business['id'] if business['id'] is not None else "None"
                city = business['location']['city'] if business['location']['city'] is not None else "None"
                city = "manhattan" if city.lower() == "new york" else city.lower()
                cities.add(city)
                index = {"index": {"_index": "restaurants", "_type": "_doc", "_id": id}}
                entry = {"id": id, "cuisine": cuisine}
                f.write(json.dumps(index))
                f.write("\n")
                f.write(json.dumps(entry))
                f.write("\n")

f.close()







