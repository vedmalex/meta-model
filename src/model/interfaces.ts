import { EntityReference } from './entityreference';
import { RelationBase } from './relationbase';
import { Field } from './field';

export interface FieldInput extends FieldBaseInput {
  type?: string;
  identity?: boolean;
  indexed?: boolean;
  required?: boolean;
  arguments?: [FieldArgs];
  relation?: { hasMany: string, }
  | { hasOne: string, }
  | { belongsTo: string, }
  | { belongsToMany: string, using: string, };
}

export interface FieldStorage extends FieldBaseStorage {
  type: string;
  identity: boolean;
  indexed: boolean;
  required: boolean;
  arguments?: [FieldArgs];
  type_: string;
  idKey: EntityReference;
  identity_: boolean;
  required_: boolean;
  indexed_: boolean;
  relation: RelationBase;
}

export interface BelongsToInput extends RelationBaseInput {
  belongsTo?: string;
}

export interface BelongsToStorage extends RelationBaseStorage {
  belongsTo: EntityReference;
  belongsTo_: string;
}

export interface BelongsToManyInput extends RelationBaseInput {
  belongsToMany: string;
  using: string;
}

export interface BelongsToManyStorage extends RelationBaseStorage {
  belongsToMany: EntityReference;
  belongsToMany_?: string;
  using: EntityReference;
  using_?: string;
}

export interface EntityInput extends ModelBaseInput {
  fields: FieldInput[];
}

export interface EntityStorage extends ModelBaseStorage {
  fields: Map<string, Field>;
  relations: Set<string>;
  identity: Set<string>;
  required: Set<string>;
  indexed: Set<string>;
}

export interface EntityReferenceInput {
  field: string;
  entity: string;
}

export interface FieldArgs {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string;
}

export interface FieldBaseInput extends ModelBaseInput {
  args?: [FieldArgs];
  entity?: string;
}

export interface FieldBaseStorage extends ModelBaseStorage {
  args?: [FieldArgs];
  args_?: [FieldArgs];
  entity: string;
  entity_: string;
}

export interface HasManyInput extends RelationBaseInput {
  hasMany: string;
}

export interface HasManyStorage extends RelationBaseStorage {
  hasMany: EntityReference;
  hasMany_: string;
}

export interface HasOneInput extends RelationBaseInput {
  hasOne: string;
}

export interface HasOneStorage extends RelationBaseStorage {
  hasOne: EntityReference;
  hasOne_: string;
}

export interface ModelBaseInput {
  name: string;
  title?: string;
  description?: string;
}

export interface ModelBaseStorage {
  name: string;
  title: string;
  description: string;
  name_: string;
  title_: string;
  description_: string;
}

export interface ModelPackageInput extends ModelBaseInput {
  name: string;
  title?: string;
  description?: string;
  entities: string[];
  mutations: any[];
}

export interface ModelPackageStore {
  name: string;
  title?: string;
  description?: string;
  entities: string[];
  mutations: any[];
}

export interface MetaModelStore {
  entities: EntityStorage[];
  packages: ModelPackageStore[];
  mutations: MutationStorage[];
  name: string;
  title?: string;
  description?: string;
}


export interface RelationBaseInput {
  /**
   * нужно в случае когда мы будем показывать атрибут связи, и ассоциацию отедельно???
   * больше не зачем
   */
  name?: string;
  entity: string;
  fields?: RelationFields[];
}

export interface RelationFields {
  description: string;
  name: string;
  type: string;
  required: boolean;
  indexed: boolean;
  args: FieldArgs[];
}

export interface RelationBaseStorage {
  name?: string;
  name_?: string;
  entity: string;
  entity_: string;
  fields: RelationFields[];
}

export interface MutationInput extends ModelBaseInput {
  args: [FieldArgs];
  payload: [FieldArgs];
}

export interface MutationStorage extends ModelBaseStorage {
  args: [FieldArgs];
  args_: [FieldArgs];
  payload: [FieldArgs];
  payload_: [FieldArgs];
}
