import { RelationBase, RelationBaseInput, RelationBaseStorage } from './relationbase';
import { EntityReference } from './entityreference';

export type HasOneInput = RelationBaseInput & {
  hasOne: string
}

export type HasOneStorage = RelationBaseStorage & {
  hasOne?: EntityReference
  hasOne_?: string
}

export class HasOne extends RelationBase {

  $obj: HasOneStorage
  constructor(obj: HasOneInput) {
    super(obj);
  }

  get hasOne() {
    return this.$obj ? this.$obj.hasOne : undefined;
  }

  get ref() {
    return this.$obj ? this.$obj.hasOne : undefined;
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
