/* @flow */
import { RelationBase} from './relationbase';
import { EntityReference } from './entityreference';
import type { HasOneStorage, HasOneInput} from './interfaces';

export class HasOne extends RelationBase {
  $obj: HasOneStorage

  get hasOne(): EntityReference {
    return this.$obj.hasOne;
  }

  get ref(): EntityReference {
    return this.$obj.hasOne;
  }

  updateWith(obj: HasOneInput) {
    if (obj) {
      super.updateWith(obj);

      const result = Object.assign({}, this.$obj);

      let hasOne_ = obj.hasOne;

      let hasOne = new EntityReference(hasOne_);

      result.hasOne_ = hasOne_;
      result.hasOne = hasOne;

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
            hasOne: props.hasOne ? props.hasOne.toString() : undefined,
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
        Object.assign({},
          res,
          {
            hasOne: props.hasOne_,
          }
        )
      )
    );
  }
}
