/* @flow */
import camelcase from 'camelcase';

export type RelationBaseInput = {
  name?: string,
}

export type RelationBaseStorage = {
  name?: string,
  name_?: string,
}

export class RelationBase {
  /**
   * represents internal object storage
   */
  $obj: RelationBaseStorage

  /**
   * construct object
   */
  constructor(obj: RelationBaseInput) {
    if (obj) {
      this.updateWith(obj);
    }
  }

  get name(): string {
    return this.$obj ? this.$obj.name : undefined;
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

  updateWith(obj: RelationBaseInput): void {
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
