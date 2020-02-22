# -*- coding: utf-8 -*-
"""
    Yelp Fusion API code sample.
    
    This program demonstrates the capability of the Yelp Fusion API
    by using the Search API to query for businesses by a search term and location,
    and the Business API to query additional information about the top result
    from the search query.
    
    Please refer to http://www.yelp.com/developers/v3/documentation for the API
    documentation.
    
    This program requires the Python requests library, which you can install via:
    `pip install -r requirements.txt`.
    
    Sample usage of the program:
    `python sample.py --term="bars" --location="San Francisco, CA"`
    """
from __future__ import print_function

import argparse
import json
import pprint
import requests
import sys
import urllib


# This client code can run on Python 2.x or 3.x.  Your imports can be
# simpler if you only need one of those.
try:
    # For Python 3.0 and later
    from urllib.error import HTTPError
    from urllib.parse import quote
    from urllib.parse import urlencode
except ImportError:
    # Fall back to Python 2's urllib2 and urllib
    from urllib2 import HTTPError
    from urllib import quote
    from urllib import urlencode


# Yelp Fusion no longer uses OAuth as of December 7, 2017.
# You no longer need to provide Client ID to fetch Data
# It now uses private keys to authenticate requests (API Key)
# You can find it on
# https://www.yelp.com/developers/v3/manage_app
API_KEY= "ueSaG54dzEo5zQeM8aI2LT5C4krMvCYm5HJiNWuh13viiwEgh-Zl3qk3Te1ZOfYK6l4kWDIQzaL4O0sezTPUejlxXv_4-v0DDcguHQjazqPClbvOhTclNpJXOe6YXXYx"


# API constants, you shouldn't have to change these.
API_HOST = 'https://api.yelp.com'
SEARCH_PATH = '/v3/businesses/search'
BUSINESS_PATH = '/v3/businesses/'  # Business ID will come after slash.


# Defaults for our simple example.
DEFAULT_TERM = 'french restaurant'
DEFAULT_LOCATION = 'manhatten'
SEARCH_LIMIT = 50
OFFSET = 0


def request(host, path, api_key, url_params=None):
    url_params = url_params or {}
    url = '{0}{1}'.format(host, quote(path.encode('utf8')))
    headers = {
        'Authorization': 'Bearer %s' % api_key,
    }
    
    print(u'Querying {0} ...'.format(url))

    response = requests.request('GET', url, headers=headers, params=url_params)

    return response.json()


def search(api_key, term, location, offset):
    
    url_params = {
        'term': term.replace(' ', '+'),
        'location': location.replace(' ', '+'),
        'limit': SEARCH_LIMIT,
        'offset': offset
    }
    return request(API_HOST, SEARCH_PATH, api_key, url_params=url_params)


def get_business(api_key, business_id):
    business_path = BUSINESS_PATH + business_id
    
    return request(API_HOST, business_path, api_key)


def query_api(term, location):
    offset = 0
    response = []
    json_map = {}
    k=0
    for i in range(20):
        k = k + 1
        json_map[k] = search(API_KEY, term, location, offset)
        offset = offset + 50
    with open('data.json', 'w') as openfile:
        json.dump(json_map, openfile,sort_keys=True, indent=4)

def main():
    parser = argparse.ArgumentParser()
    
    parser.add_argument('-q', '--term', dest='term', default=DEFAULT_TERM,type=str, help='Search term (default: %(default)s)')

    parser.add_argument('-l', '--location', dest='location',default=DEFAULT_LOCATION, type=str,help='Search location (default: %(default)s)')
                        
    input_values = parser.parse_args()
                        
    try:
        query_api(input_values.term, input_values.location)
    except HTTPError as error:
        sys.exit('Encountered HTTP error {0} on {1}:\n {2}\nAbort program.'.format(error.code,error.url,error.read(),))


if __name__ == '__main__':
    main()
