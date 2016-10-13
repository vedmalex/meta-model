/* @flow */
import camelcase from 'camelcase';
import decamelize from 'decamelize';
import { ModelPackage } from './modelpackage';
import type {ModelBaseStorage, ModelBaseInput } from './interfaces';

export class ModelBase {
  $obj: ModelBaseStorage

  constructor(obj: ModelBaseInput) {
    if (obj) {
      this.updateWith(obj);
    }
  }

  get name():?string {
    return this.$obj ? this.$obj.name : undefined;
  }

  get title():?string {
    let props = this.$obj;
    return props ? (props.title || props.title_) : undefined;
  }

  get description():?string {
    let props = this.$obj;
    return props ? (props.description || props.description_) : undefined;
  }

  toString() {
    return JSON.stringify(this.toObject());
  }

  toObject(modelPackage?: ModelPackage) {
    let props = this.$obj;
    return {
      name: props.name || props.name_,
      title: props.title || props.title_,
      description: props.description || props.description_,
    };
  }

  toJSON(modelPackage?: ModelPackage):ModelBaseInput {
    var props = this.$obj;
    return {
      name: props.name_,
      title: props.title_,
      description: props.description_,
    };
  }

  updateWith(obj: ModelBaseInput) {
    if (obj) {

      const result: ModelBaseStorage = Object.assign({}, this.$obj);

      let name_ = obj.name;
      let title_ = obj.title;
      let description_ = obj.description;

      let name = camelcase(name_.trim());

      let title = title_ ? title_.trim() : '';

      let description = description_ ? description_.trim() : '';

      if (!title) {
        title = decamelize(name, ' ');
      }
      title = (title.slice(0, 1)).toUpperCase() + title.slice(1);

      if (!description) {
        description = title || title_;
      }
      description = (description.slice(0, 1)).toUpperCase() + description.slice(1);

      result.name_ = name_;
      result.name = name;

      result.title_ = title_;
      result.title = title;

      result.description_ = description_;
      result.description = description;

      this.$obj = Object.assign({}, result);
    }
  }

  clone() {
    return new this.constructor(this.toJSON());
  }
}
