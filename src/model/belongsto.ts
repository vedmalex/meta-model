import { RelationBase, RelationBaseInput, RelationBaseStorage } from './relationbase';
import { EntityReference } from './entityreference';

export type BelongsToInput = RelationBaseInput & {
  belongsTo: string
}

export type BelongsToStorage = RelationBaseStorage & {
  belongsTo?: EntityReference
  belongsTo_?: string
}

export class BelongsTo extends RelationBase {
  $obj: BelongsToStorage
  constructor(obj: BelongsToInput) {
    super(obj);
  }

  get belongsTo() {
    return this.$obj ? this.$obj.belongsTo : undefined;
  }

  get ref() {
    return this.$obj ? this.$obj.belongsTo : undefined;
  }

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
