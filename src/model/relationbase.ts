import camelcase from 'camelcase';
import { INamedModel, INamedModelStorage, IInstrumented } from './interfaces';

export class RelationBase implements INamedModel, IInstrumented<INamedModel> {
  /**
   * represents internal object storage
   */
  protected $obj: INamedModel & INamedModelStorage

  /**
   * construct object
   */
  constructor(obj: INamedModel) {
    if (obj) {
      this.updateWith(obj);
    }
  }

  get name() {
    return this.$obj ? this.$obj.name : undefined;
  }

  toString() {
    return JSON.stringify(this.toObject());
  }

  toObject() {
    let props = this.$obj;
    return {
      name: props.name || props.name_,
    };
  }

  toJSON() {
    var props = this.$obj;
    return {
      name: props.name_,
    };
  }

  updateWith(obj: INamedModel): void {
    if (obj) {

      const result = this.$obj ? Object.assign({}, this.$obj) : {};

      let name_ = obj.name;

      let name = name_ ? camelcase(name_.trim()) : name_;

      result.name_ = name_;
      result.name = name;

      this.$obj = Object.assign({}, result);
    }
  }

  clone() {
    return new (<typeof RelationBase>this.constructor)(this.toJSON());
  }
}
