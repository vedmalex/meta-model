import { RelationBase } from './relationbase';
import { REF_PATTERN } from './definitions';
import { EntityReference } from './entityreference';
import camelcase from 'camelcase';
import { IHasManyInput, IHasMany, IHasManyStorage, IEntityReference } from './interfaces';

export class HasMany extends RelationBase {

  $obj: IHasMany & IHasManyStorage

  constructor(obj: IHasManyInput) {
    super(obj);
  }

  get hasMany() {
    return this.$obj ? this.$obj.hasMany : undefined;
  }

  get ref() {
    return this.$obj ? this.$obj.hasMany : undefined;
  }

  updateWith(obj: IHasManyInput) {
    if (obj) {
      super.updateWith(obj);

      const result = Object.assign({}, this.$obj);

      let hasMany_ = obj.hasMany;

      let hasMany;
      if (hasMany_) {
        hasMany = new EntityReference();
        let res = hasMany_.match(REF_PATTERN);
        hasMany.entity = (<string>res[1]);
        hasMany.field = res[2] ? camelcase(res[2].trim()) : '';
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
