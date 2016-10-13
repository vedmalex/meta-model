/* @flow */
import { DEFAULT_ID_FIELDNAME, REF_PATTERN } from './definitions';
import camelcase from 'camelcase';

export interface EntityReferenceInput {
  field: string,
  entity: string,
}

/** Entityt reference implementation */
export class EntityReference {
  /** the Entity that is referenced */
  entity: string
  /** the Identity field */
  field: string

  constructor(entity: string | EntityReferenceInput, field?: string) {
    if (typeof entity === 'string' && !field) {
      let res = entity.match(REF_PATTERN);
      if (res && res.length > 0) {
        this.entity = res[1];
        this.field = res[2] ? camelcase(res[2].trim()) : '';
      }
    } else if (typeof entity === 'string') {
      this.entity = entity;
      this.field = field || 'id';
    } else if (entity instanceof Object) {
      this.entity = entity.entity;
      this.field = entity.field;
    }
  }

  clone() {
    return new (this.constructor)(this);
  }

  toObject() {
    return Object.assign({}, {
      entity: this.entity,
      field: this.field,
    })
  }

  toJSON() {
    return this.toObject();
  }

  updateWith(obj: EntityReferenceInput) {
    this.field = obj.field || this.field;
    this.entity = obj.entity || this.entity;
  }

  toString(): string {
    return `${this.entity}#${this.field || DEFAULT_ID_FIELDNAME}`;
  }
};
