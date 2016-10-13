/* @flow */
import { FieldBase } from './fieldbase';
import { HasOne } from './hasone';
import { HasMany } from './hasmany';
import { BelongsTo } from './belongsto';
import { BelongsToMany } from './belongstomany';
import { EntityReference } from './entityreference';
import { ModelPackage } from './modelpackage';
import type {RelationBase} from './relationbase';
import type {FieldStorage, FieldInput} from './interfaces';

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
  $obj: FieldStorage

  get type(): string {
    return this.$obj.type;
  }

  get identity(): boolean {
    return this.$obj.identity;
  }

  // this is to make sure that if we internally set
  makeIdentity() {
    this.$obj.idKey = new EntityReference(this.$obj.entity, this.$obj.name);
    this.$obj.indexed = this.$obj.identity = this.$obj.identity_ = true;
  }

  get required():boolean {
    return this.$obj.required || this.$obj.required_;
  }

  get indexed(): boolean {
    return this.$obj.indexed || this.$obj.indexed_;
  }

  get idKey(): EntityReference {
    return this.$obj.idKey;
  }

  get relation(): RelationBase {
    return this.$obj.relation;
  }

  clone(){
    return new this.constructor(this.toJSON());
  }

  updateWith(obj: FieldInput) {
    if (obj) {
      super.updateWith(obj);
      const result = Object.assign({}, this.$obj);

      let type_ = obj.type;
      let type = type_ || 'string';

      let identity_ = obj.identity;
      let identity = identity_ || false;

      let required_ = obj.required;
      let required = required_ || false;

      let indexed_ = obj.indexed;
      let indexed = indexed_ || identity;

      result.type_ = type_;
      result.type = type;

      result.identity_ = identity_;
      result.identity = identity;

      result.indexed_ = indexed_;
      result.indexed = indexed;

      if (result.identity) {
        // это то как выглядит ключ для внешних ссылок
        result.idKey = new EntityReference(result.entity, result.name);
      }

      result.required_ = required_;
      result.required = identity_ || required;

      if (obj.relation) {
        let relation_ = obj.relation;
        let relation : RelationBase;

        switch (discoverFieldType(relation_)) {
          case 'HasOne':
            relation = new HasOne(Object.assign({}, relation_, { entity: obj.entity }));
            break;
          case 'HasMany':
            relation = new HasMany(Object.assign({}, relation_, { entity: obj.entity }));
            break;
          case 'BelongsToMany':
            relation = new BelongsToMany(Object.assign({}, relation_, { entity: obj.entity }));
            break;
          case 'BelongsTo':
            relation = new BelongsTo(Object.assign({}, relation_, { entity: obj.entity }));
            break;
          default:
            throw new Error('undefined type')
        }

        result.relation = relation;
        delete result.type_;
        delete result.type;
      }

      this.$obj = Object.assign({}, result);
    }
  }

  // it get fixed object
  toObject(modelPackage?: ModelPackage) {
    let props = this.$obj;
    let res = super.toObject();
    return JSON.parse(
      JSON.stringify(
        Object.assign({},
          res,
          {
            type: props.type || props.type_,
            identity: props.identity || props.identity_,
            required: props.required || props.required_,
            indexed: props.indexed || props.indexed_,
            idKey: props.idKey ? props.idKey.toString() : undefined,
            relation: props.relation ? props.relation.toObject() : undefined,
          }
        )
      )
    );
  }

  // it get clean object with no default values
  toJSON(modelPackage?: ModelPackage) {
    let props = this.$obj;
    let res = super.toJSON();
    return JSON.parse(
      JSON.stringify(
        Object.assign(
          {},
          res,
          {
            type: props.type_,
            identity: props.identity_,
            required: props.required_,
            indexed: props.indexed_,
            relation: props.relation ? props.relation.toJSON() : undefined,
          }
        )
      )
    );
  }
}
