<brightdata_zillow>

## Purpose

How the skill ingests a Zillow listing: through the **Bright Data** dataset API, by listing URL. It replaces the Apify actors (the Apify account hit its monthly usage hard limit, and Zillow itself blocks direct access with HTTP 403 and a "Press & Hold" captcha, so scraping the page directly is not an option and must not be attempted).

## The endpoint

| Item | Value |
|------|-------|
| Dataset | "Zillow properties listing information - collect by URL" |
| `dataset_id` | `gd_lfqkr8wm13ixtbd8f5` |
| Mode | synchronous: `POST https://api.brightdata.com/datasets/v3/scrape?dataset_id=gd_lfqkr8wm13ixtbd8f5&notify=false&include_errors=true&format=json` |
| Auth | `Authorization: Bearer $BRIGHTDATA_API_KEY` |
| Body | `[{"url": "<zillow listing url>"}]` |
| Key location | `BRIGHTDATA_API_KEY` in the project `.env` (git-ignored). Never print, log or commit it. |

If the synchronous call takes too long the API answers `202` with a `snapshot_id`; the script then polls `/progress/{id}` and downloads `/snapshot/{id}?format=json`.

## How to run

```bash
python .claude/skills/re-walkthrough-pro/scripts/ingest_brightdata.py --url "https://www.zillow.com/homedetails/.../NNNN_zpid/"
```

It saves the raw response (`brightdata-raw.json`), downloads every photo to `source-images/NN-original.jpg` (one URL per photo, the highest resolution available), and writes `PROPERTY.md` (address, price, beds, baths, sqft, year, status, type, agent, photo count). `--raw-json <file>` reuses a saved response without calling the API.

## Troubleshooting

| Symptom | Meaning | What to do |
|---------|---------|------------|
| `HTTP 400 Customer is not active` | The Bright Data account is not activated (billing / verification on their side) | Stop. Ask the user to activate the account. Do not retry in a loop. |
| `HTTP 401/403` | Wrong or revoked key | Ask the user to check `BRIGHTDATA_API_KEY` in `.env`. |
| Photo count is 0 | The response has no `photos.zillowstatic.com` URLs under the field names the script expects | Open `brightdata-raw.json`, find where the photo URLs live, adjust `fotos()` in the script. |
| Address / price shows `n/d` | Field names differ from the ones the script reads | Same: check `brightdata-raw.json` and adjust `endereco()` / `primeiro()` calls. |

## Status of this integration

The script's field mapping was written without a successful live response (the first call returned `Customer is not active`). It was only exercised against a simulated response. After the first real run, check `brightdata-raw.json` against the fields above and fix the mapping if needed.

## Photos from other sources (not Zillow)

Public brokerage sites (e.g. KW "homefront" pages) show the same listing and serve their MLS photos by plain HTTP. These photos usually carry a visible MLS stamp (e.g. "Stellar MLS"), which violates the skill's "no on-screen text" rule. Treat them as a last resort, flag the stamp to the user, and do not animate stamped photos without the user's explicit decision.

## Anti-Patterns

| Anti-Pattern | Why It's Bad | Fix |
|--------------|-------------|-----|
| Fetching Zillow pages directly (curl, headless browser) | Blocked with a captcha; bypassing it is not allowed | Use the Bright Data script |
| Writing the API key in docs, PROPERTY.md, commits or chat | Leaks a billable credential | Only reference the variable name |
| Re-running ingestion on every pass | Each call is billed per record | Reuse `source-images/` and `brightdata-raw.json` |

</brightdata_zillow>
