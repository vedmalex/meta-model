import { RelationBase } from './relationbase';
import { REF_PATTERN } from './definitions';
import { EntityReference } from './entityreference';
import camelcase from 'camelcase';
import { IHasOne, IHasOneInput, IHasOneStorage, IInstrumented, IEntityReference } from './interfaces';


export class HasOne extends RelationBase {

  $obj: IHasOne & IHasOneStorage
  constructor(obj: IHasOneInput) {
    super(obj);
  }

  get hasOne() {
    return this.$obj ? this.$obj.hasOne : undefined;
  }

  get ref() {
    return this.$obj ? this.$obj.hasOne : undefined;
  }

  updateWith(obj: IHasOneInput) {
    if (obj) {
      super.updateWith(obj);

      const result = Object.assign({}, this.$obj);

      let hasOne_ = obj.hasOne;

      let hasOne;
      if (hasOne_) {
        hasOne = new EntityReference();
        let res = hasOne_.match(REF_PATTERN);
        hasOne.entity = res[1];
        hasOne.field = res[2] ? camelcase(res[2].trim()) : '';
      }

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
  clone() {
    return new (<typeof HasOne>this.constructor)(this.toJSON());
  }
}
