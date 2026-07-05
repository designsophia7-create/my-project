"""Search Instagram hashtags and your own account's posts via the Instagram Graph API.

Setup (https://developers.facebook.com/):
  1. Create a Facebook App and add the "Instagram Graph API" product.
  2. Connect an Instagram professional account (Business/Creator) that is
     linked to a Facebook Page.
  3. Generate a long-lived access token with the required scopes
     (instagram_basic, instagram_manage_comments, pages_show_list, etc.)
  4. Export the credentials as environment variables:

       export IG_ACCESS_TOKEN="..."
       export IG_BUSINESS_ACCOUNT_ID="..."

Note: hashtag search (`ig_hashtag_search`) is only available through the
Facebook Graph API host (graph.facebook.com), not graph.instagram.com.
"""

import os
import sys

import requests

API_VERSION = "v19.0"
GRAPH_API_BASE = f"https://graph.facebook.com/{API_VERSION}"


class InstagramAPIError(RuntimeError):
    """Raised when the Graph API responds with an error payload."""


def _get(url, params):
    response = requests.get(url, params=params, timeout=30)
    data = response.json()
    if "error" in data:
        raise InstagramAPIError(data["error"].get("message", str(data["error"])))
    response.raise_for_status()
    return data


def search_instagram_hashtag(hashtag_name, access_token, business_account_id):
    """Look up a hashtag's id by name."""
    url = f"{GRAPH_API_BASE}/ig_hashtag_search"
    params = {
        "user_id": business_account_id,
        "q": hashtag_name,
        "access_token": access_token,
    }
    return _get(url, params)


def get_hashtag_media(hashtag_id, access_token, business_account_id, kind="recent_media"):
    """Get media for a hashtag. `kind` is 'recent_media' or 'top_media'."""
    if kind not in ("recent_media", "top_media"):
        raise ValueError("kind must be 'recent_media' or 'top_media'")

    url = f"{GRAPH_API_BASE}/{hashtag_id}/{kind}"
    params = {
        "user_id": business_account_id,
        "fields": "id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count",
        "access_token": access_token,
    }
    return _get(url, params)


def search_own_posts(query_keyword, access_token, business_account_id, max_pages=10):
    """Search your own account's posts by caption text (client-side filter)."""
    url = f"{GRAPH_API_BASE}/{business_account_id}/media"
    params = {
        "fields": "id,caption,timestamp,like_count,comments_count",
        "access_token": access_token,
        "limit": 100,
    }

    matches = []
    keyword = query_keyword.lower()
    for _ in range(max_pages):
        data = _get(url, params)
        for post in data.get("data", []):
            if keyword in (post.get("caption") or "").lower():
                matches.append(post)

        next_url = data.get("paging", {}).get("next")
        if not next_url:
            break
        url, params = next_url, None  # `next` already carries all query params

    return matches


def _env_or_die(name):
    value = os.environ.get(name)
    if not value:
        sys.exit(f"Missing required environment variable: {name}")
    return value


if __name__ == "__main__":
    access_token = _env_or_die("IG_ACCESS_TOKEN")
    business_account_id = _env_or_die("IG_BUSINESS_ACCOUNT_ID")

    hashtag = sys.argv[1] if len(sys.argv) > 1 else "photography"
    keyword = sys.argv[2] if len(sys.argv) > 2 else "sunset"

    print(f"Searching hashtag #{hashtag} ...")
    hashtag_result = search_instagram_hashtag(hashtag, access_token, business_account_id)
    print(hashtag_result)

    hashtag_id = next(iter(hashtag_result.get("data", [])), {}).get("id")
    if hashtag_id:
        print(f"\nRecent media for #{hashtag} ...")
        media = get_hashtag_media(hashtag_id, access_token, business_account_id)
        print(media)

    print(f"\nSearching your own posts for '{keyword}' ...")
    own_matches = search_own_posts(keyword, access_token, business_account_id)
    print(own_matches)
