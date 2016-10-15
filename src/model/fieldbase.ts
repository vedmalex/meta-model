import { ModelBase } from './modelbase';
import {FieldBaseStorage, FieldBaseInput, FieldArgs } from './interfaces';

export class FieldBase extends ModelBase {
  protected $obj: FieldBaseStorage;

  get entity(): string {
    return this.$obj.entity;
  }

  get args(): FieldArgs[] {
    return this.$obj.args;
  }

  public updateWith(obj: FieldBaseInput) {
    if (obj) {
      super.updateWith(obj);

      const result = Object.assign({}, this.$obj);

      let $entity = obj.entity;
      let entity = $entity;

      let args = obj.args;
      let $args = obj.args;

      result.entity = entity;
      result.entity_ = $entity;

      result.args = args;
      result.args_ = $args;

      this.$obj = Object.assign({}, result);
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
            entity: props.entity || props.entity_,
            args: props.args || props.args_,
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
        Object.assign(
          {},
          res,
          {
            args: props.args_,
          }
        )
      )
    );
  }
}
