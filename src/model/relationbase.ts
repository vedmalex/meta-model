import * as inflected from 'inflected';
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
    return new EntityReference({ entity: '', field: '', backField: '' });
  }

  get verb() {
    return this.$obj.verb;
  }

  // one item per relation
  get single() {
    return this.$obj.single;
  }

  // key is storage is located in owner side of entity
  get stored() {
    return this.$obj.stored;
  }

  // stored as members of class
  get emdebbed() {
    return this.$obj.embedded;
  }

  // opposite entity field with relation def
  get opposite() {
    return this.$obj.opposite;
  }

  set opposite(val) {
    this.$obj.opposite = val;
  }

  get fullName() {
    // в зависимости от типа связи pluralize + singularize
    let ref = this.single ? inflected.singularize(this.$obj.field) : inflected.pluralize(this.$obj.field);
    return this.name || `${this.$obj.entity}${this.$obj.verb}${inflected.camelize(ref, true)}`;
  }

  get normalName() {
    // в зависимости от типа связи pluralize + singularize
    let ref = this.single ? inflected.singularize(this.$obj.field) : inflected.pluralize(this.$obj.field);
    return `${this.$obj.entity}${inflected.camelize(ref, true)}`;
  }

  get shortName() {
    // в зависимости от типа связи pluralize + singularize
    let ref = this.single ? inflected.singularize(this.$obj.field) : inflected.pluralize(this.$obj.field);
    return `${inflected.camelize(ref, true)}`;
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
      opposite: props.opposite,
    };
  }

  public toJSON(): RelationBaseInput {
    let props = this.$obj;
    return {
      name: props.name_,
      entity: props.entity,
      field: props.field,
      fields: props.fields,
      opposite: props.opposite,
    };
  }

  public updateWith(obj: RelationBaseInput): void {
    if (obj) {

      const result: RelationBaseStorage = Object.assign({}, this.$obj);
      result.verb = 'NotDefinetlyRelated';

      let $name = obj.name;
      let opposite = obj.opposite;

      let name = $name ? inflected.camelize($name.trim()) : $name;

      result.name_ = $name;
      result.name = name;

      result.opposite = opposite;

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
