/* @flow */
import { RelationBase } from './relationbase';
import { EntityReference } from './entityreference';
import type {HasManyStorage, HasManyInput} from './interfaces';

export class HasMany extends RelationBase {

  $obj: HasManyStorage

  get hasMany() :EntityReference{
    return this.$obj.hasMany;
  }

  get ref():EntityReference {
    return this.$obj.hasMany;
  }

  updateWith(obj: HasManyInput) {
    if (obj) {
      super.updateWith(obj);

      const result = Object.assign({}, this.$obj);

      let hasMany_ = obj.hasMany;

      let hasMany;
      if (hasMany_) {
        hasMany = new EntityReference(hasMany_);
      }

      result.hasMany_ = hasMany_;
      result.hasMany = hasMany;

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
            hasMany: props.hasMany ? props.hasMany.toString() : undefined,
          }
        )
      )
    );
  }

  // it get clean object with no default values
  toJSON() {
    var props = this.$obj;
    let res = super.toJSON();
    return JSON.parse(
      JSON.stringify(
        Object.assign({},
          res,
          {
            hasMany: props.hasMany_,
          }
        )
      )
    );
  }
}
