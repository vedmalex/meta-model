import { RelationBase} from './relationbase';
import { EntityReference } from './entityreference';
import {BelongsToManyStorage, BelongsToManyInput} from './interfaces';

export class BelongsToMany extends RelationBase {

  $obj: BelongsToManyStorage

  get belongsToMany(): EntityReference {
    return this.$obj.belongsToMany;
  }

  get using(): EntityReference {
    return this.$obj.using;
  }

  get ref(): EntityReference {
    return this.$obj.belongsToMany;
  }

  updateWith(obj: BelongsToManyInput) {
    if (obj) {
      super.updateWith(obj);

      const result = Object.assign({}, this.$obj);

      let belongsToMany_ = obj.belongsToMany;

      let using_ = obj.using;

      let belongsToMany;
      if (belongsToMany_) {
        belongsToMany = new EntityReference(belongsToMany_);
      }

      let using;
      if (using_) {
        using = new EntityReference(using_);
      } else {
        using = new EntityReference(`${obj.name || obj.entity}#${obj.entity.toLowerCase()}`);
      }

      if (!this.$obj.name_ && using) {
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
