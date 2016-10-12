import { ModelBase } from './modelbase';
import { IModelFieldBase, IModelFieldBaseStorage } from './interfaces';

export class FieldBase extends ModelBase {
  $obj: IModelFieldBase & IModelFieldBaseStorage
  constructor(obj) {
    super(obj);
  }

  get entity() {
    return this.$obj ? this.$obj.entity : undefined;
  }

  updateWith(obj: IModelFieldBase) {
    if (obj) {
      super.updateWith(obj);

      const result = Object.assign({}, this.$obj);

      let entity_ = obj.entity;
      let entity = entity_;

      result.entity = entity;
      result.entity_ = entity_;

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
            entity: props.entity || props.entity_,
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
        Object.assign(
          {},
          res,
        )
      )
    );
  }
}
