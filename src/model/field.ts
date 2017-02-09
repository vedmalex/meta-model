import { FieldBase } from './fieldbase';
import { HasOne } from './hasone';
import { HasMany } from './hasmany';
import { BelongsTo } from './belongsto';
import { BelongsToMany } from './belongstomany';
import { EntityReference } from './entityreference';
import { ModelPackage } from './modelpackage';
import { RelationBase } from './relationbase';
import { FieldStorage, FieldInput } from './interfaces';

function discoverFieldType(obj) {
  // сделать проверку по полю...
  if (obj.hasOne) {
    return 'HasOne';
  } else if (obj.hasMany) {
    return 'HasMany';
  } else if (obj.belongsTo) {
    return 'BelongsTo';
  } else if (obj.belongsToMany) {
    return 'BelongsToMany';
  } else {
    console.warn(`undefined relation type of ${JSON.stringify(obj)}`);
    return 'undefined';
  }
};

export class Field extends FieldBase {
  protected $obj: FieldStorage;

  get type(): string {
    return this.$obj.type;
  }

  get identity(): boolean | string | string[] {
    return this.getMetadata('storage.identity');
  }

  // this is to make sure that if we internally set
  public makeIdentity() {
    this.$obj.idKey = new EntityReference(this.$obj.entity, this.$obj.name);
    this.setMetadata('storage.identity');
    this.setMetadata('storage.indexed');
  }

  get required(): boolean {
    return this.getMetadata('storage.required');
  }

  get indexed(): boolean | string | string[] {
    return this.getMetadata('storage.indexed');
  }

  get idKey(): EntityReference {
    return this.$obj.idKey;
  }

  get relation(): RelationBase {
    return this.$obj.relation;
  }

  set relation(value: RelationBase) {
    this.$obj.relation = value;
  }

  public getRefType(pkg: ModelPackage): string | void {
    if (this.relation) {
      let ref = this.relation.ref;
      let link = ref.toString();
      if (pkg.identityFields.has(link)) {
        let entity = pkg.identityFields.get(link);
        if (entity.fields.has(ref.field)) {
          return entity.fields.get(ref.field).type;
        }
      }
    }
  }

  public clone() {
    return new (<typeof Field>this.constructor)(this.toObject());
  }

  public updateWith(obj: FieldInput) {
    if (obj) {
      super.updateWith(obj);
      const result = Object.assign({}, this.$obj);

      let $type = obj.type;
      let type = $type || 'String';

      this.setMetadata('storage.identity', obj.identity);

      this.setMetadata('storage.required', obj.required || obj.identity);

      this.setMetadata('storage.indexed', obj.indexed || obj.identity);

      result.type_ = $type;
      result.type = type;

      if (this.getMetadata('storage.identity', false)) {
        // это то как выглядит ключ для внешних ссылок
        result.idKey = new EntityReference(result.entity, result.name);
      }

      // identity can't have relation definition
      if (obj.relation && !this.getMetadata('storage.identity', false)) {
        let $relation = obj.relation;
        let relation: RelationBase;

        switch (discoverFieldType($relation)) {
          case 'HasOne':
            relation = new HasOne(Object.assign({}, $relation, { entity: obj.entity, field: obj.name }));
            break;
          case 'HasMany':
            relation = new HasMany(Object.assign({}, $relation, { entity: obj.entity, field: obj.name }));
            break;
          case 'BelongsToMany':
            relation = new BelongsToMany(Object.assign({}, $relation, { entity: obj.entity, field: obj.name }));
            break;
          case 'BelongsTo':
            relation = new BelongsTo(Object.assign({}, $relation, { entity: obj.entity, field: obj.name }));
            break;
          default:
            throw new Error('undefined type');
        }

        result.relation = relation;
        delete result.type_;
        delete result.type;
      }

      this.$obj = Object.assign({}, result);
    }
  }

  // it get fixed object
  public toObject(modelPackage?: ModelPackage) {
    let props = this.$obj;
    let res = super.toObject();
    return JSON.parse(
      JSON.stringify(
        Object.assign({},
          res,
          {
            entity: props.entity,
            type: props.type || props.type_,
            idKey: props.idKey ? props.idKey.toString() : undefined,
            relation: props.relation ? props.relation.toObject() : undefined,
          },
        ),
      ),
    );
  }

  // it get clean object with no default values
  public toJSON(modelPackage?: ModelPackage) {
    let props = this.$obj;
    let res = super.toJSON();
    return JSON.parse(
      JSON.stringify(
        Object.assign(
          {},
          res,
          {
            type: props.type_,
            relation: props.relation ? props.relation.toJSON() : undefined,
          },
        ),
      ),
    );
  }
}
