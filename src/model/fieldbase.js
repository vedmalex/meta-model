/* @flow */
import { ModelBase } from './modelbase';
import type {FieldBaseStorage, FieldBaseInput} from './interfaces';

export class FieldBase extends ModelBase {
  $obj: FieldBaseStorage

  get entity(): string {
    return this.$obj.entity;
  }

  updateWith(obj: FieldBaseInput) {
    if (obj) {
      super.updateWith(obj);

      const result = Object.assign({}, this.$obj);

      let entity_ = obj.entity;
      let entity = entity_;

      result.entity = entity;
      result.entity_ = entity_;

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
          }
        )
      )
    );
  }

  // it get clean object with no default values
  toJSON() {
    let res = super.toJSON();
    return JSON.parse(
      JSON.stringify(
        Object.assign(
          {},
          res,
        )
      )
    );
  }
}
