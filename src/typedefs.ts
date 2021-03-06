import * as _ from 'lodash';
import { ISchemaType, IField, ITypesHash } from './interfaces';

const scalarTypes = `
        scalar Date
        scalar JSON
        scalar GeoPoint
        `;

function args(params: string): string {
  return params ? `(${args})` : '';
}

function generateInputField(field: IField, name: string): string {
  return `
        ${name} : ${field.list ? '[' : ''}
        ${field.gqlType}${field.scalar ? '' : 'Input'}${field.required ? '!' : ''} ${field.list ? ']' : ''}`;
}

function generateOutputField(field: IField, name: string): string {
  return `${name} ${args(field.args)} : ${field.list ? '[' : ''}${field.gqlType}${field.required ? '!' : ''} ${field.list ? ']' : ''}`;
}

export function generateTypeDefs(types: ITypesHash) {
  const categories = {
    TYPE: (type: ISchemaType, name: string) => {
      let output = _.reduce(type.fields, (res: string, field: IField, fieldName: string): string => {
        return res + generateOutputField(field, fieldName) + ' \n ';
      }, '');

      let result = `
                type ${name} {
                    ${output}
                }`;
      if (type.input) {
        let input = _.reduce(type.fields, (accumulator: string, field: IField, fieldName: string) => {
          return !field.relation ? accumulator + generateInputField(field, fieldName) + ' \n ' : accumulator;
        }, '');
        result += `input ${name}Input {
                    ${input}
                }`;
      }
      return result;
    },
    UNION: (type: ISchemaType, name: string) => {
      return `union ${name} = ${type.values.join(' | ')}`;
    },
    ENUM: (type: ISchemaType, name: string) => {
      return `enum ${name} {${type.values.join(' ')}}`;
    },
  };

  return _.reduce(types, (result: string, type: ISchemaType, name: string) => {
    return result + categories[type.category](type, name);
  }, scalarTypes);
}
