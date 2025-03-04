Context:
# screenpipe

# api reference for screenpipe

### search api

#### query parameters:

#### sample requests:

#### sample response:

### advanced filtering & querying guide

#### content type combinations

#### filtering limitations and best practices

#### combining multiple filters

#### pagination best practices

### audio devices api

#### sample response:

### monitors api

#### sample response:

### tags api

#### add tags request:

#### sample response:

### pipes api

#### list pipes

#### download pipe

#### enable pipe

#### disable pipe

#### update pipe config

### speakers api

#### list unnamed speakers

##### query parameters:

##### sample request:

#### search speakers

##### query parameters:

##### sample request:

#### update speaker

##### request body:

#### delete speaker

##### request body:

#### get similar speakers

##### query parameters:

##### sample request:

#### merge speakers

##### request body:

#### mark as hallucination

##### request body:

### health api

#### sample response:

### stream frames api

#### query parameters:

#### sample request:

#### sample event data:

### experimental api

#### merge frames

##### request body:

##### sample response:

#### validate media

##### query parameters:

##### sample response:

#### input control (experimental feature)

##### request body:

### database api

#### execute raw sql

##### request body:

#### add content

##### request body:

### LLM links

On This Page

we highly recommend just copy pasting these into your cursor chat for context:

and ask questions as needed.

below is the detailed api reference for screenpipe's core functionality.

the search api provides powerful filtering capabilities, but there are important considerations to understand for effective usage.

you can combine different content types using the + operator:

single value filters: most filter parameters (app_name, window_name) accept only single string values, not arrays

window vs. app name: be consistent in how you filter

url filtering: use the browser_url parameter to filter content from specific websites

timestamp formats: use ISO 8601 format for timestamps

speaker filtering: only applicable to audio content

you can combine multiple filters to narrow your search:

for large result sets, use pagination to improve performance:

requires building the backend with the experimental feature flag.

cargo build --release --features experimental

or

or

or

or

paste these links into your Cursor chat for context:

- intro
- docsgetting startedplugins (pipes)architecture overviewsdk referenceapi referencecli referencecontributingfaq
- getting started
- plugins (pipes)
- architecture overview
- sdk reference
- api reference
- cli reference
- contributing
- faq

- getting started
- plugins (pipes)
- architecture overview
- sdk reference
- api reference
- cli reference
- contributing
- faq

- search api
- query parameters:
- sample requests:
- sample response:
- advanced filtering & querying guide
- content type combinations
- filtering limitations and best practices
- combining multiple filters
- pagination best practices
- audio devices api
- sample response:
- monitors api
- sample response:
- tags api
- add tags request:
- sample response:
- pipes api
- list pipes
- download pipe
- enable pipe
- disable pipe
- update pipe config
- speakers api
- list unnamed speakers
- query parameters:
- sample request:
- search speakers
- query parameters:
- sample request:
- update speaker
- request body:
- delete speaker
- request body:
- get similar speakers
- query parameters:
- sample request:
- merge speakers
- request body:
- mark as hallucination
- request body:
- health api
- sample response:
- stream frames api
- query parameters:
- sample request:
- sample event data:
- experimental api
- merge frames
- request body:
- sample response:
- validate media
- query parameters:
- sample response:
- input control (experimental feature)
- request body:
- database api
- execute raw sql
- request body:
- add content
- request body:
- LLM links

- server API (opens in a new tab)
- app API (opens in a new tab)

- endpoint: /search
- method: get
- description: searches captured data (ocr, audio transcriptions, etc.) stored in screenpipe's local database.

- q (string, optional): search term (a SINGLE word)
- content_type (enum): type of content to search:

ocr: optical character recognition text
audio: audio transcriptions
ui: user interface elements
- ocr: optical character recognition text
- audio: audio transcriptions
- ui: user interface elements
- limit (int): max results per page (default: 20)
- offset (int): pagination offset
- start_time (timestamp, optional): filter by start timestamp
- end_time (timestamp, optional): filter by end timestamp
- app_name (string, optional): filter by application name
- window_name (string, optional): filter by window name
- browser_url (string, optional): filter by browser URL for web content
- include_frames (bool, optional): include base64 encoded frames
- min_length (int, optional): minimum content length
- max_length (int, optional): maximum content length
- speaker_ids (int[], optional): filter by specific speaker ids

- ocr: optical character recognition text
- audio: audio transcriptions
- ui: user interface elements

- single value filters: most filter parameters (app_name, window_name) accept only single string values, not arrays
# CORRECT: Single app name
curl "http://localhost:3030/search?content_type=ocr&app_name=chrome"
 
# INCORRECT: Will only use the last value
curl "http://localhost:3030/search?content_type=ocr&app_name=chrome&app_name=firefox"
- window vs. app name: be consistent in how you filter
# Filter by application name (e.g., "Chrome", "Firefox")
curl "http://localhost:3030/search?content_type=ocr&app_name=chrome"
 
# Filter by window title (e.g., "Google - Meeting Notes")
curl "http://localhost:3030/search?content_type=ocr&window_name=meeting%20notes"
- url filtering: use the browser_url parameter to filter content from specific websites
# Filter content from a specific website
curl "http://localhost:3030/search?content_type=ocr&browser_url=github.com"
 
# Filter content from a specific page
curl "http://localhost:3030/search?content_type=ocr&browser_url=github.com/mediar-ai/screenpipe"
- timestamp formats: use ISO 8601 format for timestamps
# Filter by date range
curl "http://localhost:3030/search?content_type=ocr&start_time=2024-05-01T00:00:00Z&end_time=2024-05-02T23:59:59Z"
- speaker filtering: only applicable to audio content
# Multiple speakers must be comma-separated
curl "http://localhost:3030/search?content_type=audio&speaker_ids=1,2,3"

- endpoint: /audio/list
- method: get
- description: lists available audio input/output devices

- endpoint: /vision/list
- method: post
- description: lists available monitors/displays

- endpoint: /tags/:content_type/:id
- methods: post (add), delete (remove)
- description: manage tags for content items
- content_type: vision or audio

- endpoint: /pipes/list
- method: get

- endpoint: /pipes/download
- method: post

- endpoint: /pipes/enable
- method: post

- endpoint: /pipes/disable
- method: post

- endpoint: /pipes/update
- method: post

- endpoint: /speakers/unnamed
- method: get
- description: get list of speakers without names assigned

- limit (int): max results
- offset (int): pagination offset
- speaker_ids (int[], optional): filter specific speaker ids

- endpoint: /speakers/search
- method: get
- description: search speakers by name

- name (string, optional): name prefix to search for

- endpoint: /speakers/update
- method: post
- description: update speaker name or metadata

- endpoint: /speakers/delete
- method: post
- description: delete a speaker and associated audio chunks

- endpoint: /speakers/similar
- method: get
- description: find speakers with similar voice patterns

- speaker_id (int): reference speaker id
- limit (int): max results

- endpoint: /speakers/merge
- method: post
- description: merge two speakers into one

- endpoint: /speakers/hallucination
- method: post
- description: mark a speaker as incorrectly identified

- endpoint: /health
- method: get
- description: system health status

- endpoint: /stream/frames
- method: get
- description: stream frames as server-sent events (sse)

- start_time (timestamp): start time for frame stream
- end_time (timestamp): end time for frame stream

- endpoint: /experimental/frames/merge
- method: post
- description: merges multiple video frames into a single video

- endpoint: /experimental/validate/media
- method: get
- description: validates media file format and integrity

- file_path (string): path to media file to validate

- endpoint: /experimental/input_control
- method: post
- description: control keyboard and mouse input programmatically

- endpoint: /raw_sql
- method: post
- description: execute raw SQL queries against the database (use with caution)

- endpoint: /add
- method: post
- description: add new content (frames or transcriptions) to the database

- https://github.com/mediar-ai/screenpipe/blob/main/screenpipe-server/src/server.rs (opens in a new tab)
- https://github.com/mediar-ai/screenpipe/blob/main/screenpipe-server/src/db.rs (opens in a new tab)