import { DEFAULT_ID_FIELDNAME, REF_PATTERN } from './definitions';
import * as camelcase from 'camelcase';
import { EntityReferenceInput } from './interfaces';



/** Entityt reference implementation */
export class EntityReference {
  protected $obj: {
    entity_: string;
    field_: string;
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

  constructor(entity: string | EntityReferenceInput, field?: string) {
    if (typeof entity === 'string' && !field) {
      let res = entity.match(REF_PATTERN);
      if (res && res.length > 0) {
        this.$obj = {
          entity: res[1],
          entity_: res[1],
          field: camelcase(res[2].trim()),
          field_: camelcase(res[2].trim()) || DEFAULT_ID_FIELDNAME,
        };
      }
    } else if (typeof entity === 'string') {
      this.$obj = {
        entity: entity,
        entity_: entity,
        field: field,
        field_: field || DEFAULT_ID_FIELDNAME,
      };
    } else if (entity instanceof Object) {
      this.$obj = {
        entity: entity.entity,
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
      entity: this.entity,
      field: this.field,
    });
  }

  public toJSON() {
    return this.toObject();
  }

  public updateWith(obj: EntityReferenceInput) {
    this.field = obj.field || this.field;
    this.entity = obj.entity || this.entity;
  }

  public toString(): string {
    return `${this.entity}#${this.field || DEFAULT_ID_FIELDNAME}`;
  }
};
