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
    "title": "Title shown at the top of the app.",
    "logoLocation": "Image location of the logo shown at the top of the app (relative to public folder.).",
    "mainAppColor": "The main colors used in the app, can be any CSS color.",
    "backgroundColor": "Background color of the app, can be any CSS color.",
    "footer": "HTML components or text that will function as the footer (will be placed in the footer div.)",
    "queryFolder": "The base location of the queries, all query locations will start from this folder (relative to public folder.)",
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

When executing a query, it gives us either a URL, a literal value or [a blank node](https://www.w3.org/TR/rdf12-concepts/#section-blank-nodes).
These URLs could reference to anything e.g. a picture, spreadsheet, resume, and so on.
Also literals can be lots of things e.g. a float, integer, string, birthdate, price, and so on.
By clarifying what the expected type is of the query result corresponding to a given variable 
we can fully interpret how we can display and represent the result. 

You can specify the type of a variable by extending its name with the type in the query as such: ```variableName_variableType```.
The underscore ```_``` here is crucial to make a clear distinction between name and type. 

### Representation Mapper 

If you want to add your own type representations 
you can do this by adding your representation to the [typeMapper.js](./src/typeMapper.js) file. 
This can be useful for example when querying images.
The result of the query is a reference to the image.
By mapping a representation we can show the actual image instead of the reference. 

The mapper follows a structure:

```js
{
    "typeName": mapperFunction,
    ... 
}
```

With ```typeName``` being the name of the variable as defined in the ```query``` 
which is defined in [the configuration file](#configuration-file). 
The function ```mapperFunction``` takes the query result for the corresponding variable and 
returns either a string or a [React](https://react.dev/) component (see below).
Examples of how you can do this can already be found in that same [file](./src/typeMapper.js). 

The web application uses [gridjs-react](https://gridjs.io/docs/integrations/react) internally.
This allows us to add [html](https://nl.wikipedia.org/wiki/HyperText_Markup_Language) or 
[React](https://react.dev/) components as representations of the variable.
To do this you need to import ```_``` function from [gridjs-react module](https://www.npmjs.com/package/gridjs-react) and 
call it with the component as its variable.
An example for this is also already provided in the [typeMapper.js](./src/typeMapper.js).

### Sort Mapper

To support the sorting of the table you can also define sorting comparators for [variable types](#adding-variable-type).
This can be done in the [typeMapper.js](./src/typeMapper.js) file. 

The ```typeSortMapper``` object follows the following structure: 

```js
{
    "typeName": sortFunction,
    ... 
}
```

With ```typeName``` being the name of the variable as defined in the query and 
the sortFunction a comparator that takes 2 values of type ```typeName```.
If a type has no comparator defined it gets sorted as a string. 
