/* @flow */
import { RelationBase, RelationBaseInput, RelationBaseStorage } from './relationbase';
import { EntityReference } from './entityreference';

export type HasManyInput = RelationBaseInput & {
  hasMany: string,
}

export type HasManyStorage = RelationBaseStorage & {
  hasMany?: EntityReference,
  hasMany_?: string,
}

export class HasMany extends RelationBase {

  $obj: HasManyStorage

  get hasMany() {
    return this.$obj ? this.$obj.hasMany : undefined;
  }

  get ref() {
    return this.$obj ? this.$obj.hasMany : undefined;
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
