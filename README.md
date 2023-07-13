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

```js
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

### Adding variable type

You can specify the type of a variable by extending its name with the type in the query as such: ```variableName_variableType```. The underscore ```_``` here is crutial to make a clear distinction between name and type. 

### Representation Mapper 

If you want to add your own type representations you can do this by adding your representation to the [typeMapper.js](./src/typeMapper.js) file. 

The mapper follows a simple structure:

```js
{
    "typeName": mapperFunction,
    ... 
}
```

With ```typeName``` being the name of the variable as defined in the query and ```mapperFunction``` a function that takes the query result for the corresponding variable and returns either a string or a [React](https://react.dev/) component (see below).  

Examples of how you can do this can already be found in that same file. 

The web application uses [gridjs-react](https://gridjs.io/docs/integrations/react) internally. This allows us to add [html](https://nl.wikipedia.org/wiki/HyperText_Markup_Language) or [React](https://react.dev/) components as representations of the variable. To do this you need to import ```_``` function from [gridjs-react module](https://www.npmjs.com/package/gridjs-react) and call it with the component as its variable. An example for this is also already provided.

### Sort Mapper

To support the sorting of the table you can also define sorting comperators for [variable types](#adding-variable-type). This can be done in the [typeMapper.js](./src/typeMapper.js) file. 

The ```typeSortMapper``` object follows the following structure: 

```js
{
    "typeName": sortFunction,
    ... 
}
```

With ```typeName``` being the name of the variable as defined in the query and the sortFunction a comperator that takes 2 values of type ```typeName```. 

If a type has no comperator defined it gets sorted as a string. 