# my-project

## Instagram hashtag search

`instagram_hashtag_search.py` uses the Instagram Graph API to look up a
hashtag's id, fetch recent media for that hashtag, and search your own
account's posts by caption keyword.

Setup:

```bash
pip install -r requirements.txt
export INSTAGRAM_ACCESS_TOKEN="your_instagram_access_token"
export INSTAGRAM_BUSINESS_ACCOUNT_ID="your_instagram_business_account_id"
python instagram_hashtag_search.py
```

You'll need an Instagram Business or Creator account linked to a Facebook
Page, and an access token with the `instagram_basic` and
`instagram_manage_insights` permissions. See the
[Instagram hashtag search guide](https://developers.facebook.com/docs/instagram-api/guides/hashtag-search)
for details.
