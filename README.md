# Generic Data Viewer

This Web app allows users to easily execute queries over multiple data sources (including Solid pods) and 
inspect the corresponding results.
You find a screencast of the app [here](https://cloud.ilabt.imec.be/index.php/s/AJomCGpLjYbxmCX).

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

## Static build

If you want a static build of the application execute

```bash
npm run build
```

This will create a static build in the `build` folder.


### Logging in 

To log in you need to provide an Identity Provider or a WebID.
The application will detect which one you use and redirect you to the login page of your Identity Provider.
If you use your WebID, the first OIDC issuer on your WebID is used when there are multiple. 

### Configuration file

The configuration file follows a simple structure.

```js
{
    "title": "Title shown at the top of the app.",
    "logoLocation": "Image location of the logo shown at the top of the app (relative to public folder.).",
    "logoRedirectURL": "The URL the Web application redirects to when a user clicks on the logo.",
    "mainAppColor": "The main colors used in the app, can be any CSS color.",
    "backgroundColor": "Background color of the app, can be any CSS color.",
    "titleColor": "The color of the title, can be any CSS color",
    "textColor": "The color of all the text in teh app body, this means all text except header and footer.",
    "footer": "HTML components or text that will function as the footer (will be placed in the footer div.)",
    "showMilliseconds", "True or false, whether the Runtime section should show milliseconds or not.",
    "defaultIDP": "The default value used for IDP when logging in, this IDP can be manually changed in the Web app as well. ",
    "queryFolder": "The base location of the queries, all query locations will start from this folder (relative to public folder.)",
    "httpProxy": "The http proxy used to execute queries. When left empty, the Comunica query engine will handle it.",
    "queries": [
        {
            "queryLocation": "path to the query location, relative to "queryFolder"",
            "name": "A name for the query",
            "description": "Description of the query",
            "id": "A unique ID for the query",
            "sources": "Sources over which the query should be executed",
            "askQuery": {
                "trueText": "The text that is to be shown when the query result is true, only useful for ASK queries.",
                "falseText": "The text that is to be shown when the query result is true, only useful for ASK queries."
            }

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

You can specify the type of a variable by extending its name with the type in the query as such: `variableName_variableType`.
The underscore `_` here is crucial to make a clear distinction between name and type.

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

With `typeName` being the name of the variable as defined in the `query`
which is defined in [the configuration file](#configuration-file).
The function `mapperFunction` takes the query result for the corresponding variable and
returns either a string or a [React](https://react.dev/) component (see below).
Examples of how you can do this can already be found in that same [file](./src/typeMapper.js).

The web application uses [gridjs-react](https://gridjs.io/docs/integrations/react) internally.
This allows us to add [html](https://nl.wikipedia.org/wiki/HyperText_Markup_Language) or
[React](https://react.dev/) components as representations of the variable.
To do this you need to import `_` function from [gridjs-react module](https://www.npmjs.com/package/gridjs-react) and
call it with the component as its variable.
An example for this is also already provided in the [typeMapper.js](./src/typeMapper.js).

### Sort Mapper

To support the sorting of the table you can also define sorting comparators for [variable types](#adding-variable-type).
This can be done in the [typeMapper.js](./src/typeMapper.js) file.

The `typeSortMapper` object follows the following structure:

```js
{
    "typeName": sortFunction,
    ...
}
```

With `typeName` being the name of the variable as defined in the query and
the sortFunction a comparator that takes 2 values of type `typeName`.
If a type has no comparator defined it gets sorted as a string.

## Testing with local pods

To create a local pod with which you can test for example authentication you can follow the following steps:

- Add your data and `.acl` files in the `initial-pod-data` folder.
  These files will be available in the pod relative to `http://localhost:8080/example/`.
  We already added files for the resource `favourite-books`.
- Prepare the pods by executing `npm run prepare:pods`.
- Start the pods by executing `npm run start:pods`.
- Add your query as described in [the configuration file section](#configuration-file).
  We already added a query to list books based on the resource `favourite-books` to `src/config.json`.
- Log in with the IDP `http://localhost:8080` and
  the credentials in the file `seeded-pod-config.json`.

## Testing

For testing we use [Cypress](https://www.cypress.io/) and [React-Jest](https://jestjs.io/docs/tutorial-react).
we use [Cypress](https://www.cypress.io/) for user stories and [React-Jest](https://jestjs.io/docs/tutorial-react) for UI requirements.
To run all the tests you can execute the following:

1. Prepare and start the Community Solid Server with the available pods as explained in the [Testing with local pods section](#testing-with-local-pods).

   ```bash
   npm run prepare:pods && npm run start:pods
   ```

   Keep the server running.

2. Start the Web application
   ```bash
   npm start
   ```
   Also keep this process running.
3. Finally, you can execute the tests by running
   ```bash
   npm test
   ```

Alternatively, you can run only the [React-Jest](https://jestjs.io/docs/tutorial-react) without running the Web application or the community server by executing

```bash
npx react-scripts test --watchAll=false
```
