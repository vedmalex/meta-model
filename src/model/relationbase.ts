import * as inflected from 'inflected';
import { RelationBaseStorage, RelationBaseInput, RelationFields, RelationBaseJSON } from './interfaces';
import { EntityReference } from './entityreference';
import { Metadata } from './metadata';
import fold from './../lib/json/fold';

export class RelationBase extends Metadata {
  /**
   * represents internal object storage
   */
  protected $obj: RelationBaseStorage;

  /**
   * construct object
   */
  constructor(obj: RelationBaseInput) {
    super(obj);
    if (obj) {
      this.updateWith(fold(obj) as RelationBaseInput);
    }
  }

  get name(): string {
    return this.$obj.name;
  }

  get fields(): RelationFields[] | undefined {
    return this.$obj.fields;
  }

  get ref(): EntityReference {
    return new EntityReference({ entity: '', field: '', backField: '' });
  }

  get verb() {
    return this.getMetadata('verb');
  }

  // one item per relation
  get single() {
    return this.getMetadata('storage.single');
  }

  // key is storage is located in owner side of entity
  get stored() {
    return this.getMetadata('storage.stored');
  }

  // stored as members of class
  get emdebbed() {
    return this.getMetadata('storage.embedded');
  }

  // opposite entity field with relation def
  get opposite() {
    return this.$obj.opposite;
  }

  set opposite(val) {
    this.$obj.opposite = val;
  }

  protected initNames() {
    let ref = this.single ? inflected.singularize(this.$obj.field) : inflected.pluralize(this.$obj.field);
    this.getMetadata('name.full', this.name || `${this.$obj.entity}${this.verb}${inflected.camelize(ref, true)}`);

    let ref1 = this.single ? inflected.singularize(this.$obj.field) : inflected.pluralize(this.$obj.field);
    this.setMetadata('name.normal', `${this.$obj.entity}${inflected.camelize(ref1, true)}`);

    let ref2 = this.single ? inflected.singularize(this.$obj.field) : inflected.pluralize(this.$obj.field);
    this.getMetadata('name.short', `${inflected.camelize(ref2, true)}`);
  }

  get fullName() {
    let result = this.getMetadata('name.full');
    if (!result) {
      this.initNames();
      result = this.getMetadata('name.full');
    }
    return result;
  }

  get normalName() {
    let result = this.getMetadata('name.normal');
    if (!result) {
      this.initNames();
      result = this.getMetadata('name.normal');
    }
    return result;
  }

  get shortName() {
    let result = this.getMetadata('name.short');
    if (!result) {
      this.initNames();
      result = this.getMetadata('name.short');
    }
    return result;
  }

  public toString() {
    return JSON.stringify(this.toObject());
  }

  public toObject(): RelationBaseInput {
    let props = this.$obj;
    return {
      ...super.toObject(),
      name: props.name || props.name_,
      entity: props.entity,
      field: props.field,
      fields: props.fields,
      opposite: props.opposite,
    };
  }

  public toJSON(): RelationBaseJSON {
    let props = this.$obj;
    return {
      ...super.toJSON(),
      name: props.name_,
      fields: props.fields,
      opposite: props.opposite,
    };
  }

  public updateWith(obj: RelationBaseInput): void {
    if (obj) {

      const result: RelationBaseStorage = Object.assign({}, this.$obj);

      let $name = obj.name;
      let opposite = obj.opposite;

      let name = $name ? inflected.camelize($name.trim()) : $name;

      result.name_ = $name;
      result.name = name;

      result.opposite = opposite;

      result.fields = obj.fields;

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

  // public clone(): RelationBase {
  //   return new (<typeof RelationBase>this.constructor)(this.toJSON());
  // }
}
