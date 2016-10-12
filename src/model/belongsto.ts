import { RelationBase } from './relationbase';
import { REF_PATTERN } from './definitions';
import { EntityReference } from './entityreference';
import camelcase from 'camelcase';
import { IBelongsToInput, IBelongsTo, IBelongsToStorage, IEntityReference } from './interfaces';

export class BelongsTo extends RelationBase {
  $obj: IBelongsTo & IBelongsToStorage
  constructor(obj: IBelongsToInput) {
    super(obj);
  }

  get belongsTo() {
    return this.$obj ? this.$obj.belongsTo : undefined;
  }

  get ref() {
    return this.$obj ? this.$obj.belongsTo : undefined;
  }

  updateWith(obj: IBelongsToInput) {
    if (obj) {
      super.updateWith(obj);

      const result = Object.assign({}, this.$obj);

      let belongsTo_ = obj.belongsTo;

      let belongsTo;
      if (belongsTo_) {
        belongsTo = new EntityReference();
        let res = belongsTo_.match(REF_PATTERN);
        if (res.length > 0) {
          belongsTo.entity = res[1];
          belongsTo.field = res[2] ? camelcase(res[2].trim()) : '';
        }
      }

      result.belongsTo_ = belongsTo_;
      result.belongsTo = belongsTo;

      this.$obj = Object.assign({}, result);
    }
  }

  // it get fixed object
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

  // it get clean object with no default values
  toJSON() {
    let props = this.$obj;
    let res = super.toJSON();
    return JSON.parse(
      JSON.stringify(
        Object.assign({},
          res,
          {
            belongsTo: props.belongsTo_,
          }
        )
      )
    );
  }
}
