import { _ } from 'gridjs-react';


export default {
  "img": (value) => _(<img src={value}></img>),
  "int": (value) => {return getLiteralValue(value)},
  "float": (value) => {return getLiteralValue(value)},
  "string": (value) => {return getLiteralValue(value)},
  "euro": (value) => {return `€ ${getLiteralValue(value)}`},
  "dollar": (value) => {return `$ ${getLiteralValue(value)}`}
}

/**
 * 
 * @param {String} value 
 * @returns Gets the value out of a literal as defined in https://www.w3.org/TR/rdf11-concepts/ , thus the value without type, language specifics...
 */
function getLiteralValue(value){
    let literal = value.split("^^")[0]
    return literal.substring(1, literal.length - 1)
  }