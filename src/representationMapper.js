import { _ } from 'gridjs-react';

export const typeRepresentationMapper = {
  "img": (value) => _(<img src={value}></img>),
  "int": (value) => {return literalToNumber(value, parseInt) },
  "float": (value) => {return literalToNumber(value, parseFloat)},
  "string": (value) => {return getLiteralValue(value)},
  "euro": (value) => {return `€ ${getLiteralValue(value)}`},
  "dollar": (value) => {return `$ ${getLiteralValue(value)}`}
}

export const typeSortMapper = {
  "int": sortNumber,
  "float": sortNumber
}

/**
 * Comperator function for any subclass of Number. 
 * @param {Number} valueA  
 * @param {Number} valueB 
 */
function sortNumber(valueA, valueB){
  if(valueA > valueB || isNaN(valueB)){
    return 1
  }
  else if(valueB > valueA || isNaN(valueA)){
    return -1
  }
  else{
    return 0
  }
}

/**
 * 
 * @param {Number} value string value which is to be converted to a number
 * @param {Function} parseFunction a function that takes the string value of a number and converts it to the corresponding number subclass 
 * @returns A number parsed in the correct type (e.g. integer, float...) or an empty string (instead of NaN)
 */
function literalToNumber(value, parseFunction){
  let literalValue = getLiteralValue(value)
  if(literalValue){
    return parseFunction(literalValue)
  }
  else{
    return value 
  }
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

