import { ModelBase } from './modelbase';
import { FieldBaseStorage, FieldBaseInput, FieldArgs } from './interfaces';

export class FieldBase extends ModelBase {
  protected $obj: FieldBaseStorage;

  get entity(): string {
    return this.$obj.entity;
  }

  get args(): FieldArgs[] {
    return this.$obj.args;
  }

  // is used with custom resolver
  get derived() {
    return this.$obj.derived_;
  }

  // is retrieved from storage layer
  get persistent() {
    return this.$obj.persistent_;
  }

  public updateWith(obj: FieldBaseInput) {
    if (obj) {
      super.updateWith(obj);

      const result = Object.assign({}, this.$obj);

      let $entity = obj.entity;
      let entity = $entity;

      let args = obj.args;
      let $args = obj.args;

      let derived = obj.derived;
      let presistent = obj.persistent;

      // wheather it is explicitly defined or has arguments
      let $derived = obj.derived || (Array.isArray(obj.args) && obj.args.length > 0);
      // wheather it is explicitly defined or if derived then by default is transient
      let $presistent = obj.persistent || !$derived;

      result.persistent = presistent;
      result.derived = derived;

      result.persistent_ = $presistent;
      result.derived_ = $derived;

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
            derived: props.derived || props.derived_,
            persistent: props.persistent || props.persistent_,
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
            derived: props.derived_,
            persistent: props.persistent_,
          }
        )
      )
    );
  }
}
