"""Search Instagram hashtags and media via the Instagram Graph API.

Requires a Business/Creator Instagram account and an access token with the
instagram_basic and instagram_manage_insights permissions. See
https://developers.facebook.com/docs/instagram-api/guides/hashtag-search
"""

import os
import json

import requests

API_VERSION = "v19.0"
BASE_URL = f"https://graph.instagram.com/{API_VERSION}"

ACCESS_TOKEN = os.environ.get("INSTAGRAM_ACCESS_TOKEN")
INSTAGRAM_BUSINESS_ACCOUNT_ID = os.environ.get("INSTAGRAM_BUSINESS_ACCOUNT_ID")


def search_instagram_hashtag(hashtag_name):
    """Search for a hashtag and return its id."""
    url = f"{BASE_URL}/ig_hashtag_search"
    params = {
        "user_id": INSTAGRAM_BUSINESS_ACCOUNT_ID,
        "fields": "id,name",
        "q": hashtag_name,
        "access_token": ACCESS_TOKEN,
    }

    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()


def search_instagram_media(hashtag_id):
    """Get recent media for a specific hashtag id."""
    url = f"{BASE_URL}/{hashtag_id}/recent_media"
    params = {
        "user_id": INSTAGRAM_BUSINESS_ACCOUNT_ID,
        "fields": "id,caption,media_type,timestamp,like_count,comments_count",
        "access_token": ACCESS_TOKEN,
    }

    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()


def search_own_posts(query_keyword):
    """Search your own posts by caption keyword."""
    url = f"{BASE_URL}/{INSTAGRAM_BUSINESS_ACCOUNT_ID}/media"
    params = {
        "fields": "id,caption,timestamp,like_count,comments_count",
        "access_token": ACCESS_TOKEN,
    }

    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()

    return [
        post
        for post in data.get("data", [])
        if query_keyword.lower() in (post.get("caption") or "").lower()
    ]


if __name__ == "__main__":
    if not ACCESS_TOKEN or not INSTAGRAM_BUSINESS_ACCOUNT_ID:
        raise SystemExit(
            "Set the INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID "
            "environment variables before running this script."
        )

    hashtag_results = search_instagram_hashtag("photography")
    print(json.dumps(hashtag_results, indent=2))

    hashtag_id = hashtag_results.get("data", [{}])[0].get("id")
    if hashtag_id:
        media_results = search_instagram_media(hashtag_id)
        print(json.dumps(media_results, indent=2))

    my_posts = search_own_posts("sunset")
    print(json.dumps(my_posts, indent=2))
