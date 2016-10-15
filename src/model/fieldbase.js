/* @flow */
import { ModelBase } from './modelbase';
import type {FieldBaseStorage, FieldBaseInput, FieldArgs } from './interfaces';

export class FieldBase extends ModelBase {
  $obj: FieldBaseStorage

  get entity(): string {
    return this.$obj.entity;
  }

  get args(): FieldArgs[] {
    return this.$obj.args;
  }

  updateWith(obj: FieldBaseInput) {
    if (obj) {
      super.updateWith(obj);

      const result = Object.assign({}, this.$obj);

      let entity_ = obj.entity;
      let entity = entity_;

      let args = obj.args || [];
      let args_ = obj.args;

      result.entity = entity;
      result.entity_ = entity_;

      result.args = args;
      result.args_ = args_;

      this.$obj = Object.assign({}, result);
    }
  }

  // it get fixed object
  toObject() {
    let props = this.$obj;
    let res = super.toObject();
    return JSON.parse(
      JSON.stringify(
        Object.assign(
          {},
          res,
          {
            entity: props.entity || props.entity_,
            args: props.args || props.args_,
          }
        )
      )
    );
  }

  // it get clean object with no default values
  toJSON() {
    let props = this.$obj;
    let res = super.toJSON();
    return JSON.parse(
      JSON.stringify(
        Object.assign(
          {},
          res,
          {
            args: props.args_,
          }
        )
      )
    );
  }
}
