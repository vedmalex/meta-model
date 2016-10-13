/* @flow */
import camelcase from 'camelcase';

import type { HasOneStorage } from './hasone'
import type { HasManyStorage } from './hasmany'
import type { BelongsToStorage } from './belongsto'
import type { BelongsToManyStorage } from './belongstomany'

export interface RelationBaseInput {
  name?: string,
  entity?: string
}

export interface RelationBaseStorage {
  name: string,
  name_: string,
}

export class RelationBase {
  /**
   * represents internal object storage
   */
  $obj: RelationBaseStorage | HasOneStorage | HasManyStorage | BelongsToStorage | BelongsToManyStorage

  /**
   * construct object
   */
  constructor(obj: RelationBaseInput) {
    this.$obj = { name: '' };
    if (obj) {
      this.updateWith(obj);
    }
  }

  get name(): string {
    return this.$obj.name;
  }

  toString() {
    return JSON.stringify(this.toObject());
  }

  toObject(): RelationBaseInput {
    let props = this.$obj;
    return {
      name: props.name || props.name_,
    };
  }

  toJSON(): RelationBaseInput {
    var props = this.$obj;
    return {
      name: props.name_,
    };
  }

  updateWith(obj: any): void {
    if (obj) {

      const result = this.$obj ? Object.assign({}, this.$obj) : {};

      let name_ = obj.name;

      let name = name_ ? camelcase(name_.trim()) : name_;

      result.name_ = name_;
      result.name = name;

      this.$obj = Object.assign({}, result);
    }
  }

  clone(): RelationBase {
    return new (this.constructor)(this.toJSON());
  }
}
