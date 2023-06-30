# generic-data-viewer
Generic query-based data viewer


## Getting Started 

After installing, the following steps suffice to install the application:

```bash
npm install 
```

after this you can execute

```bash
npm start
```

Which will start the web application

### Configuration file 

The configuration file follows a simple structure. 

```json
{
    "name": "Name shown at the top of the app as a title",
    "queryFolder": "The base location of the queries, all query locations will start from this folder",
    "queries": [
        {
            "queryLocation": "path to the query location, relative to "queryFolder"",
            "name": "A name for the query",
            "description": "Description of the query",
            "id": "A unique ID for the query",
            "sources": "Sources over which the query should be executed"
        }
        ...
    ]
}
```