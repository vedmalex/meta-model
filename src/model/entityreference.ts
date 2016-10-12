import { DEFAULT_ID_FIELDNAME } from './definitions';
import { IEntityReference, IInstrumented } from './interfaces';

/** Entityt reference implementation */
export class EntityReference implements IEntityReference, IInstrumented<IEntityReference> {
  /** the Entity that is referenced */
  entity: string
  /** the Identity field */
  field: string = 'id'

  constructor(entity?: string | IEntityReference, field?: string) {
    if (typeof entity == 'string') {
      this.entity = entity;
      this.field = field;
    } else if (entity instanceof Object) {
      this.entity = entity.entity;
      this.field = entity.field;
    }
  }

  clone() {
    return new (<typeof EntityReference>this.constructor)(this);
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

  updateWith(obj: IEntityReference) {
    this.field = obj.field || this.field;
    this.entity = obj.entity || this.entity;
  }

  toString(): string {
    return `${this.entity}#${this.field || DEFAULT_ID_FIELDNAME}`;
  }
};
