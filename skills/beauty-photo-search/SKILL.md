---
name: beauty-photo-search
description: Search and display high-quality photos of celebrities, models, or public figures from Baidu Images. Use when user requests photos of a specific person (e.g., "show me photos of 章若楠", "find pictures of Taylor Swift", "get 10 photos of 刘亦菲"). Returns clean markdown-formatted image gallery with valid CDN URLs.
---

# Beauty Photo Search Skill

This skill automates the process of searching for and displaying high-quality photos of celebrities and public figures using Baidu Image Search.

## Workflow

1. **Start Browser**: Launch the browser with `clawd` profile
2. **Navigate**: Open Baidu Image Search with the person's name + random page number
3. **Wait**: Allow 3 seconds for page load
4. **Extract URLs**: Parse thumbnail URLs from page snapshot (randomized + deduplicated)
5. **Generate Output**: Create clean markdown gallery

**Randomization Strategy:**
- Add `&pn={random_offset}` to URL (pn = page number * 30)
- Random offset: 0, 30, 60, 90, 120 (first 5 pages)
- Script automatically shuffles results and tracks history
- Avoids showing same photos repeatedly

## Key Steps

### 1. Open Baidu Image Search

```
URL: https://image.baidu.com/search/index?tn=baiduimage&word={PERSON_NAME}&pn={RANDOM_OFFSET}
```

**Random offset values:**
- 0 (page 1)
- 30 (page 2)
- 60 (page 3)
- 90 (page 4)
- 120 (page 5)

Pick a random offset each time to get different results.

### 2. Extract Thumbnail URLs

From the page snapshot, look for thumbnail URLs in this pattern:

```
thumburl=https://img{0-2}.baidu.com/it/u={ID1},{ID2}&fm=253&fmt=auto&app=138&f=JPEG?w={WIDTH}&h={HEIGHT}
```

These are the stable, working CDN URLs. Extract at least 10 unique URLs.

### 3. Generate Clean Markdown

Output format (exactly as shown):

```markdown
# {PERSON_NAME}照片精选

![](URL1)

![](URL2)

![](URL3)

...
```

**Important**: 
- No descriptions or explanations
- No numbering or captions
- Just title + images
- One blank line between each image

## Script Usage

Use the provided script for automated extraction:

```bash
python3 scripts/extract_photos.py "{PERSON_NAME}" {COUNT}
```

Example:
```bash
python3 scripts/extract_photos.py "章若楠" 10
```

## Quality Guidelines

- Prefer higher resolution thumbnails (w=800 or w=500)
- Verify URLs contain `img0.baidu.com`, `img1.baidu.com`, or `img2.baidu.com`
- Avoid duplicate URLs
- Test at least 1-2 URLs to ensure validity

## Error Handling

If browser fails to start:
- Check browser service status
- Restart with `profile=clawd`
- Verify page loaded before extracting URLs

If no thumbnails found:
- Check if page loaded correctly
- Try alternative search terms
- Verify snapshot captured the image grid
