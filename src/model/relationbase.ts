import camelcase from 'camelcase';
import { RelationBaseStorage, RelationBaseInput } from './interfaces';
import { EntityReference } from './entityreference';
export class RelationBase {
  /**
   * represents internal object storage
   */
  protected $obj: RelationBaseStorage;

  /**
   * construct object
   */
  constructor(obj: RelationBaseInput) {
    if (obj) {
      this.updateWith(obj);
    }
  }

  get name(): string {
    return this.$obj.name;
  }

  get ref(): EntityReference {
    return new EntityReference({ entity: '', field: '' });
  }

  public toString() {
    return JSON.stringify(this.toObject());
  }

  public toObject(): RelationBaseInput {
    let props = this.$obj;
    return {
      name: props.name || props.name_,
      entity: props.entity,
    };
  }

  public toJSON(): RelationBaseInput {
    let props = this.$obj;
    return {
      name: props.name_,
      entity: props.entity,
    };
  }

  public updateWith(obj: RelationBaseInput): void {
    if (obj) {

      const result: RelationBaseStorage = Object.assign({}, this.$obj);

      let $name = obj.name;

      let name = $name ? camelcase($name.trim()) : $name;

      result.name_ = $name;
      result.name = name;

      this.$obj = Object.assign({}, result);
    }
  }

  public clone(): RelationBase {
    return new (<typeof RelationBase>this.constructor)(this.toJSON());
  }
}
