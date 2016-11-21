import { DEFAULT_ID_FIELDNAME, REF_PATTERN } from './definitions';
import * as camelcase from 'camelcase';
import { EntityReferenceInput } from './interfaces';
import * as inflected from 'inflected'; '';

/** Entityt reference implementation */
export class EntityReference {
  protected $obj: {
    backField_: string;
    entity_: string;
    field_: string;
    backField: string;
    entity: string;
    field: string;
  };
  /** the Entity that is referenced */
  public get entity(): string {
    return this.$obj.entity || this.$obj.entity_;
  }
  public set entity(value: string) {
    this.$obj.entity_ = value;
  }
  /** the Identity field */
  public get field(): string {
    return this.$obj.field || this.$obj.field_ || DEFAULT_ID_FIELDNAME;
  }

  public set field(value: string) {
    this.$obj.field_ = value;
  }

  /** the Identity field */
  public get backField(): string {
    return this.$obj.backField || this.$obj.backField_ || DEFAULT_ID_FIELDNAME;
  }

  public set backField(value: string) {
    this.$obj.backField_ = value;
  }

  constructor(entity: string | EntityReferenceInput, field?: string, backField?: string) {
    if (typeof entity === 'string' && !field) {
      let res = entity.match(REF_PATTERN);
      if (res && res.length > 0) {
        this.$obj = {
          backField: res[1],
          backField_: res[1],
          entity: inflected.classify(res[2]),
          entity_: res[2],
          field: camelcase(res[3].trim()),
          field_: camelcase(res[3].trim()) || DEFAULT_ID_FIELDNAME,
        };
      }
    } else if (typeof entity === 'string') {
      this.$obj = {
        backField: backField,
        backField_: backField || DEFAULT_ID_FIELDNAME,
        entity: inflected.classify(entity),
        entity_: entity,
        field: field,
        field_: field || DEFAULT_ID_FIELDNAME,
      };
    } else if (entity instanceof Object) {
      this.$obj = {
        backField: entity.backField,
        backField_: entity.backField || DEFAULT_ID_FIELDNAME,
        entity: inflected.classify(entity.entity),
        entity_: entity.entity,
        field: entity.field,
        field_: entity.field || DEFAULT_ID_FIELDNAME,
      };
    }
  }

  public clone() {
    return new (<typeof EntityReference>this.constructor)(this);
  }

  public toObject() {
    return Object.assign({}, {
      entity: this.$obj.entity,
      field: this.$obj.field,
    });
  }

  public toJSON() {
    return Object.assign({}, {
      entity: this.$obj.entity_,
      field: this.$obj.field_,
    });
  }

  public updateWith(obj: EntityReferenceInput) {
    this.field = obj.field || this.field;
    this.entity = obj.entity || this.entity;
  }

  public toString(): string {
    return `${this.entity}#${this.field || DEFAULT_ID_FIELDNAME}`;
  }
};
