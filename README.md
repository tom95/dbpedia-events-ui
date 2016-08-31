# DBpedia Events UI

A user interface visualizing the DBpedia Events dataset.

# Running with Docker

A copy of the `article-verify/apiKeys.js` file is required to enable verification.

```
docker build -t dbpedia-events-ui .
docker run -it -p 8000:8000 -d dbpedia-events-ui
```

## The Timeline Interface
![The Timeline](https://raw.githubusercontent.com/tom95/dbpedia-events-ui/master/screenshots/Timeline.png)

## The Resource Search Interface
![The Resource Search](https://raw.githubusercontent.com/tom95/dbpedia-events-ui/master/screenshots/ResourceSearch.png)

## The Editor Interface
![The Editor](https://raw.githubusercontent.com/tom95/dbpedia-events-ui/master/screenshots/Editor.png)


# Automated Verification
In the separate `verify` branch, we have a framework to extract posts of a given day range into a database and fetch verification data for this subset of events in a batch mode.
