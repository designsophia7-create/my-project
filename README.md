# my-project

## Instagram hashtag search

`instagram_hashtag_search.py` searches Instagram hashtags and your own
account's posts via the Instagram Graph API.

### Setup

1. Create a Facebook App at https://developers.facebook.com/ and add the
   Instagram Graph API product.
2. Connect an Instagram professional account (Business/Creator) linked to a
   Facebook Page, and generate a long-lived access token.
3. Set the required environment variables:

   ```bash
   export IG_ACCESS_TOKEN="your_instagram_access_token"
   export IG_BUSINESS_ACCOUNT_ID="your_instagram_business_account_id"
   ```

### Usage

```bash
pip install -r requirements.txt
python instagram_hashtag_search.py <hashtag> <keyword>
```

For example, `python instagram_hashtag_search.py photography sunset` looks up
the `#photography` hashtag and its recent media, then searches your own
posts' captions for "sunset".
