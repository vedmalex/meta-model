/* @flow */
import { RelationBase, } from './relationbase';
import { EntityReference } from './entityreference';
import type {BelongsToStorage, BelongsToInput } from './interfaces';

/**
 * BelongsTo Relation
 */
export class BelongsTo extends RelationBase {
  $obj: BelongsToStorage

  get belongsTo(): EntityReference {
    return this.$obj.belongsTo;
  }

  /**
   * common for all type Relations
   */
  get ref(): EntityReference {
    return this.$obj.belongsTo;
  }

  /**
   * single point update
   */
  updateWith(obj: BelongsToInput) {
    if (obj) {
      super.updateWith(obj);

      const result = Object.assign({}, this.$obj);

      let belongsTo_ = obj.belongsTo;

      let belongsTo;
      if (belongsTo_) {
        belongsTo = new EntityReference(belongsTo_);
      }

      result.belongsTo_ = belongsTo_;
      result.belongsTo = belongsTo;

      this.$obj = Object.assign({}, result);
    }
  }

  /**
   * it get fixed object
  */
  toObject() {
    let props = this.$obj;
    let res = super.toObject();
    return JSON.parse(
      JSON.stringify(
        Object.assign({},
          res,
          {
            belongsTo: props.belongsTo ? props.belongsTo.toString() : undefined,
          }
        )
      )
    );
  }

  /**
   * it get clean object with no default values
   */
  toJSON() {
    let props = this.$obj;
    let res = super.toJSON();
    return JSON.parse(
      JSON.stringify(
        {
          ...res,
        belongsTo: props.belongsTo_,
        },
      )
    );
}
}