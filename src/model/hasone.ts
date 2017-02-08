import { RelationBase } from './relationbase';
import { EntityReference } from './entityreference';
import { HasOneStorage, HasOneInput } from './interfaces';

export class HasOne extends RelationBase {
  protected $obj: HasOneStorage;

  get hasOne(): EntityReference {
    return this.$obj.hasOne;
  }

  get ref(): EntityReference {
    return this.$obj.hasOne;
  }

  public updateWith(obj: HasOneInput) {
    if (obj) {
      super.updateWith(obj);
      const result = Object.assign({}, this.$obj);

      this.setMetadata('single', true);
      this.setMetadata('stored', false);
      this.setMetadata('embedded', false);
      this.setMetadata('verb', 'HasOne');

      let $hasOne = obj.hasOne;
      let hasOne = new EntityReference($hasOne);

      result.hasOne_ = $hasOne;
      result.hasOne = hasOne;

      this.$obj = Object.assign({}, result);
      this.initNames();
    }
  }

  // it get fixed object
  public toObject() {
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
  public toJSON() {
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
