// /**
//  * Interface for intrumenting something
//  */
// import { ModelPackage } from './modelpackage';

// export interface IInstrumented {
//   /** return Clean object without any additional things*/
//   toJSON<T>(modelPackage?: ModelPackage): T
//   /** return just pure Object */
//   toObject<T>(modelPackage?: ModelPackage): T
//   /** return a string represenation of the object */
//   toString(): string
//   /** make update of internal structure of the object */
//   updateWith<I>(obj: I)
//   /** clones the object */
//   clone<T>(): T
// }

// /** represents named object */
// export interface INamedModel {
//   /** name of the object */
//   name?: string
// }

// /** interface for graphql-relay Node implementation */
// export interface INode {
//   /** Global id of current Object  */
//   id: String
// }

// /** Represents Modeled Item */
// export interface IModelItemBase extends INamedModel {
//   /** string representation of the Modeled Item */
//   title?: string,
//   /** description of the Item */
//   description?: string,
// }
// import { Field } from './field';
// export interface IEntityBase extends IModelItemBase {
//   fields: Map<string, Field>
//   relations: Set<string>
//   identity: Set<string>
//   required: Set<string>
//   indexed: Set<string>
// }

// export interface IEntityInput extends IModelItemBase {
//   fields: IModelFieldInput[]
// }

// export interface IRelationBaseInput extends IModelItemBase {
//   entity: string
// }

// export interface IRelationBase extends INamedModel {

// }

// export interface IModelFieldBase extends IModelItemBase {
//   entity: string
// }

// export interface IModelField extends IModelFieldBase {
//   type?: string
//   identity?: boolean
//   required?: boolean
//   indexed?: boolean
//   idKey?: IEntityReference
//   relation?: IHasOne | IHasMany | IBelongsTo | IBelongsToMany
// }

// export interface IModelFieldInput extends IModelFieldBase {
//   type?: string
//   identity?: boolean
//   required?: boolean
//   indexed?: boolean
//   relation?: IHasOneInput | IHasManyInput | IBelongsToInput | IBelongsToManyInput
// }


// export interface IHasOne extends IRelationBase {
//   hasOne: IEntityReference
// }

// export interface IHasMany extends IRelationBase {
//   hasMany: IEntityReference
// }

// export interface IBelongsTo extends IRelationBase {
//   belongsTo: IEntityReference
// }

// export interface IBelongsToMany extends IRelationBase {
//   belongsToMany: IEntityReference
//   using: IEntityReference
// }

// export interface IHasOneInput extends IRelationBaseInput {
//   hasOne: string
// }

// export interface IHasManyInput extends IRelationBaseInput {
//   hasMany: string
// }

// export interface IBelongsToInput extends IRelationBaseInput {
//   belongsTo: string
// }

// export interface IBelongsToManyInput extends IRelationBaseInput {
//   belongsToMany: string
//   using: string
// }

// /**
//  * Traking changes
//  */

// /** interface for internal storage of INamedModel  */
// export interface INamedModelStorage {
//   /**name storage */
//   name_?: string
// }

// /**
//  * storage for IModelItemBase
//  */
// export interface IModelItemBaseStorage extends INamedModelStorage {
//   /** title storage */
//   title_?: string,
//   /** description storage */
//   description_?: string
// }

// export interface IHasOneStorage extends INamedModelStorage {
//   hasOne_: string
// }

// export interface IHasManyStorage extends INamedModelStorage {
//   hasMany_: string
// }

// export interface IBelongsToStorage extends INamedModelStorage {
//   belongsTo_: string
// }

// export interface IBelongsToManyStorage extends INamedModelStorage {
//   belongsToMany_: string
//   using_: string
// }

// export interface IModelFieldBaseStorage extends INamedModelStorage {
//   entity_: string
// }

// export interface IEntityBaseStorage {

// }

// export interface IModelFieldStorage extends IModelFieldBaseStorage {
//   name_?: string
//   type_?: string,
//   identity_?: boolean
//   required_?: boolean
//   indexed_?: boolean
//   relation_?: IHasOne | IHasMany | IBelongsTo | IBelongsToMany
// }

// /** other interfaces */

// /** represents reference to the entity */
// export interface IEntityReference {
//   /** referenced entity */
//   entity: string
//   /** referenced identity field */
//   field?: string
// }