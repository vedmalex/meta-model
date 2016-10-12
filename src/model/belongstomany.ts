import { RelationBase } from './relationbase';
import { REF_PATTERN } from './definitions';
import { EntityReference } from './entityreference';
import camelcase from 'camelcase';
import { IBelongsToMany, IBelongsToManyInput, IBelongsToManyStorage, IEntityReference } from './interfaces';

export class BelongsToMany extends RelationBase {

  $obj: IBelongsToMany & IBelongsToManyStorage

  constructor(obj: IBelongsToManyInput) {
    super(obj);
  }

  get belongsToMany() {
    return this.$obj ? this.$obj.belongsToMany : undefined;
  }

  get using() {
    return this.$obj ? this.$obj.using : undefined;
  }

  get ref() {
    return this.$obj ? this.$obj.belongsToMany : undefined;
  }

  updateWith(obj: IBelongsToManyInput) {
    if (obj) {
      super.updateWith(obj);

      const result = Object.assign({}, this.$obj);

      let belongsToMany_ = obj.belongsToMany;

      let using_ = obj.using;

      let belongsToMany;
      if (belongsToMany_) {
        belongsToMany = new EntityReference();
        let res = belongsToMany_.match(REF_PATTERN);
        belongsToMany.entity = res[1] || obj.entity;
        belongsToMany.field = res[2] ? camelcase(res[2].trim()) : '';
      }

      let using;
      if (using_) {
        using = new EntityReference();
        let res = using_.match(REF_PATTERN);
        using.entity = res[1] || obj.name || obj.entity;
        using.field = res[2] ? camelcase(res[2].trim()) : obj.entity.toLowerCase();
      } else {
        using = new EntityReference(`${obj.name || obj.entity}#${obj.entity.toLowerCase()}`);
      }

      if (!obj.name_ && using) {
        result.name = using.entity;
      }

      result.belongsToMany_ = belongsToMany_;
      result.belongsToMany = belongsToMany;

      result.using_ = using_;
      result.using = using;

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
            belongsToMany: props.belongsToMany ? props.belongsToMany.toString() : undefined,
            using: props.using ? props.using.toString() : undefined,
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
        Object.assign(
          {},
          res,
          {
            belongsToMany: props.belongsToMany_,
            using: props.using_,
          }
        )
      )
    );
  }
}
