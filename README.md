# generic-data-viewer
Generic query-based data viewer


## Getting Started 

After installing, the following steps suffice to install the application:

```bash
cd web-app
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
    "querry_folder": "The base location of the querries, all querry locations will start from this folder",
    "querries": [
        {
            "querry_location": "path to the querry location, relative to "querry_folder"",
            "name": "A name for the querry",
            "description": "Description of the querry",
            "id": "A unique ID for the querry",
            "sources": "Sources over which the querry should be executed"
        }
        ...
    ]
}
```