export interface FieldInput extends FieldBaseInput {
  type?: string,
  identity?: boolean,
  indexed?: boolean,
  required?: boolean,
  relation:
  { hasMany: string, }
  | { hasOne: string, }
  | { belongsTo: string, }
  | { belongsToMany: string, using: string, }
}

export interface FieldStorage extends FieldBaseStorage {
  type: string,
  identity: boolean,
  indexed: boolean,
  required: boolean,
  type_: string,
  idKey: EntityReference,
  identity_: boolean,
  required_: boolean,
  indexed_: boolean,
  relation: RelationBase,
}

export interface BelongsToInput extends RelationBaseInput {
  belongsTo?: string,
}

export interface BelongsToStorage extends RelationBaseStorage {
  belongsTo: EntityReference,
  belongsTo_: string,
}

export interface BelongsToManyInput extends RelationBaseInput {
  belongsToMany: string,
  using: string,
}

export interface BelongsToManyStorage extends RelationBaseStorage {
  belongsToMany: EntityReference,
  belongsToMany_?: string,
  using: EntityReference,
  using_?: string,
}

export interface EntityInput extends ModelBaseInput {
  fields: FieldInput[],
}

export interface EntityStorage extends ModelBaseStorage {
  fields: Map<string, Field>,
  relations: Set<string>,
  identity: Set<string>,
  required: Set<string>,
  indexed: Set<string>,
}

export interface EntityReferenceInput {
  field: string,
  entity: string,
}

export interface FieldBaseInput extends ModelBaseInput {
  entity: Entity,
}

export interface FieldBaseStorage extends FieldBaseInput, ModelBaseStorage {
  entity_: string,
}

export interface HasManyInput extends RelationBaseInput {
  hasMany: string,
}

export interface HasManyStorage extends RelationBaseStorage {
  hasMany: EntityReference,
  hasMany_: string,
}

export interface HasOneInput extends RelationBaseInput {
  hasOne: string,
}

export interface HasOneStorage extends RelationBaseStorage {
  hasOne: EntityReference,
  hasOne_: string,
}

export interface ModelBaseInput {
  name: string,
  title?: string,
  description?: string,
}

export interface ModelBaseStorage {
  name: string,
  title: string,
  description: string,
  name_: string,
  title_: string,
  description_: string,
}

export interface ModelPackageInput {
  name: string,
  title: ?string,
    description: ?string,
}

export interface RelationBaseInput {
  name?: string,
  entity?: string
}

export interface RelationBaseStorage {
  name: string,
  name_: string,
}
