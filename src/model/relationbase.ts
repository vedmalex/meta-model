import capitalize from './../lib/capitalize';
import * as camelcase from 'camelcase';
import { RelationBaseStorage, RelationBaseInput, RelationFields } from './interfaces';
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

  get fields(): RelationFields[] {
    return this.$obj.fields;
  }

  get ref(): EntityReference {
    return new EntityReference({ entity: '', field: '' });
  }

  get verb() {
    return this.$obj.verb;
  }

  // one item per relation
  get single() {
    return this.$obj.single;
  }

  // key is stored in owner side
  get stored() {
    return this.$obj.stored;
  }

  // stored as members of class
  get emdebbed() {
    return this.$obj.embedded;
  }

  get relationName() {
    return this.name || `${this.$obj.entity}${this.$obj.verb}${capitalize(this.$obj.field)}`;
  }

  public toString() {
    return JSON.stringify(this.toObject());
  }

  public toObject(): RelationBaseInput {
    let props = this.$obj;
    return {
      name: props.name || props.name_,
      entity: props.entity,
      field: props.field,
      fields: props.fields,
    };
  }

  public toJSON(): RelationBaseInput {
    let props = this.$obj;
    return {
      name: props.name_,
      entity: props.entity,
      field: props.field,
      fields: props.fields,
    };
  }

  public updateWith(obj: RelationBaseInput): void {
    if (obj) {

      const result: RelationBaseStorage = Object.assign({}, this.$obj);
      result.verb = 'NotDefinetlyRelated';

      let $name = obj.name;

      let name = $name ? camelcase($name.trim()) : $name;

      result.name_ = $name;
      result.name = name;

      result.fields = obj.fields || [];

      let $entity = obj.entity;
      let entity = $entity;

      let $field = obj.field;
      let field = $field;

      result.entity = entity;
      result.entity_ = $entity;

      result.field = field;
      result.field_ = $field;

      this.$obj = Object.assign({}, result);
    }
  }

  public clone(): RelationBase {
    return new (<typeof RelationBase>this.constructor)(this.toJSON());
  }
}
