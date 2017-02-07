import { ModelBase } from './modelbase';
import { MutationStorage, MutationInput, FieldArgs } from './interfaces';

export class Mutation extends ModelBase {
  protected $obj: MutationStorage;

  public get args(): FieldArgs[] {
    return this.$obj.args_;
  }

  public get payload(): FieldArgs[] {
    return this.$obj.payload_;
  }

  public updateWith(obj: MutationInput) {
    if (obj) {
      super.updateWith(obj);

      const result = Object.assign({}, this.$obj);

      let args = obj.args;
      let $args = obj.args;

      let payload = obj.payload;
      let $payload = obj.payload;

      result.args = args;
      result.args_ = $args;

      result.payload = payload;
      result.payload_ = $payload;

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
            args: props.args ? props.args : undefined,
            payload: props.payload ? props.payload : undefined,
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
            args: props.args_ ? props.args_ : undefined,
            payload: props.payload_ ? props.payload_ : undefined,
          }
        )
      )
    );
  }

}
