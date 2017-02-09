import { ModelBase } from './modelbase';
import { Field } from './field';
import { HasOne } from './hasone';
import { HasMany } from './hasmany';
import { BelongsTo } from './belongsto';
import { BelongsToMany } from './belongstomany';
import { DEFAULT_ID_FIELD } from './definitions';
import { ModelPackage } from './modelpackage';
import { EntityStorage, EntityInput, FieldInput, EntityJSON } from './interfaces';
import * as inflected from 'inflected';
import  deepMerge  from './../lib/json/deepMerge';

/**
 * 1. тип объекта который входит на updateWith
 * 2. тип объекта который идет на toObject
 * 3. тип объекта который идет на toJSON
 * 3. тип объекта который идет на выходе clone
 */

export class Entity extends ModelBase {
  protected $obj: EntityStorage;

  public ensureIds(modelPackage: ModelPackage) {
    this.identity.forEach((value) => {
      let ids = this.fields.get(value);
      if (ids) {
        modelPackage.identityFields.set(ids.idKey.toString(), this);
      }
    });
  }

  public ensureFKs(modelPackage: ModelPackage): Field[] {
    let missing: Field[] = [];
    if (modelPackage) {
      let modelRelations;
      if (modelPackage.relations.has(this.name)) {
        modelRelations = modelPackage.relations.get(this.name);
      } else {
        modelRelations = new Map();
        modelPackage.relations.set(this.name, modelRelations);
      }

      if (modelRelations) {
        this.relations.forEach((value) => {
          let ref = this.fields.get(value);
          // must be different to apply fixup
          if (ref && modelRelations) {
            modelRelations.set(ref.name, ref.clone());
          }
        });
      }

      missing = [
        ...missing,
        ...this.checkRelations(modelPackage),
      ];
      missing.forEach((r) => {
        if (modelRelations) {
          modelRelations.delete(r.name);
        }
      });
    }
    return missing || [];
  }

  public checkRelations(modelPackage: ModelPackage): Field[] {
    let missing = [];
    if (modelPackage.relations.has(this.name)) {
      let modelRelations = modelPackage.relations.get(this.name);
      if (modelRelations) {
        modelRelations.forEach((field) => {
          let r = field.relation;
          let missingRef = true;
          if (!r.ref.field) {
            // discover fieldName
            if (modelPackage.entities.has(r.ref.entity)) {
              let e = modelPackage.entities.get(r.ref.entity);
              if (e) {
                let identity = e.identity;
                // посмотреть насколько возможна подобная ситуация...
                (r.ref.field = identity.values().next().value || 'id');
                missingRef = false;
              }
            }
          }

          if (r instanceof HasOne) {
            if (modelPackage.entities.has(r.ref.entity)) {
              let refe = modelPackage.entities.get(r.ref.entity);
              if (refe && refe.fields.has(r.ref.field) && refe.indexed.has(r.ref.field)) {
                missingRef = false;
              }

              if (r.opposite) {
                let opposite = Array.from(refe.relations)
                  .find(rel => rel === r.opposite);

                if (refe.fields.has(opposite)) {
                  let rel = refe.fields.get(opposite).relation;
                  let wellformed = opposite && refe.fields.has(opposite)
                    && (rel instanceof BelongsTo);

                  if (rel.opposite !== field.name) {
                    rel.opposite = field.name;
                  }

                  if (!wellformed) {
                    missingRef = true;
                  }
                } else {
                  missingRef = true;
                }
              }
            }
          } else if (r instanceof HasMany) {
            if (modelPackage.entities.has(r.ref.entity)) {
              let refe = modelPackage.entities.get(r.ref.entity);
              if (refe && refe.fields.has(r.ref.field) && refe.indexed.has(r.ref.field)) {
                missingRef = false;
              }

              if (r.opposite) {
                let opposite = Array.from(refe.relations)
                  .find(rel => rel === r.opposite);
                if (refe.fields.has(opposite)) {
                  let rel = refe.fields.get(opposite).relation;
                  let wellformed = opposite && refe.fields.has(opposite)
                    && (rel instanceof BelongsTo);

                  if (rel.opposite !== field.name) {
                    rel.opposite = field.name;
                  }

                  if (!wellformed) {
                    missingRef = true;
                  }
                } else {
                  missingRef = true;
                }
              }
            }
          } else if (r instanceof BelongsToMany) {
            if (modelPackage.entities.has(r.ref.entity)) {
              let refe = modelPackage.entities.get(r.ref.entity);
              if (refe && refe.fields.has(r.ref.field) && refe.identity.has(r.ref.field)) {
                missingRef = false;
                (r as BelongsToMany).ensureRelationClass(modelPackage);
              }

              if (r.opposite) {
                let opposite = Array.from(refe.relations)
                  .find(rel => rel === r.opposite);
                if (refe.fields.has(opposite)) {
                  let rel = refe.fields.get(opposite).relation;
                  let wellformed = opposite && refe.fields.has(opposite)
                    && (rel instanceof BelongsToMany);

                  if (rel.opposite !== field.name) {
                    rel.opposite = field.name;
                  }

                  if (!wellformed) {
                    missingRef = true;
                  }
                } else {
                  missingRef = true;
                }
              }
            } else {
              let using = r.using;
              // make sure that relationClass exists or created otherwise
              (r as BelongsToMany).ensureRelationClass(modelPackage);
              if (using && modelPackage.entities.has(using.entity)) {
                // здесь нужно будет изменить тип ассоциации
                let replaceRef = r.toJSON();
                replaceRef.hasMany = replaceRef.using;

                delete replaceRef.belongsToMany;
                delete replaceRef.using;

                field.relation = new HasMany(replaceRef);
                missingRef = false;

                // no need to has opposite here
                if (r.opposite) {
                  r.opposite = undefined;
                }
              }
            }
          } else if (r instanceof BelongsTo) {
            // if (modelPackage.identityFields.has(r.ref.toString())) {
            //   missingRef = false;
            // }
            if (modelPackage.entities.has(r.ref.entity)) {
              let refe = modelPackage.entities.get(r.ref.entity);
              if (refe && refe.fields.has(r.ref.field) && refe.identity.has(r.ref.field)) {
                missingRef = false;
              }

              if (r.opposite) {
                let opposite = Array.from(refe.relations)
                  .find(rel => rel === r.opposite);
                if (refe.fields.has(opposite)) {
                  let rel = refe.fields.get(opposite).relation;
                  let wellformed = opposite && refe.fields.has(opposite)
                    && (rel instanceof HasOne || rel instanceof HasMany);

                  if (rel.opposite !== field.name) {
                    rel.opposite = field.name;
                  }

                  if (!wellformed) {
                    missingRef = true;
                  }
                } else {
                  missingRef = true;
                }
              }
              if (r.opposite) {
                let opposite = Array.from(refe.relations)
                  .find(rel => rel === r.opposite);
                let wellformed = opposite && refe.fields.has(opposite)
                  && (refe.fields.get(opposite).relation instanceof HasOne || refe.fields.get(opposite).relation instanceof HasMany);
                if (!wellformed) {
                  missingRef = true;
                }
              }
            }
          }

          if (missingRef) {
            missing.push(field);
          }
        });
      }
    }
    return missing;
  }

  public removeIds(modelPackage: ModelPackage) {
    this.identity.forEach((value) => {
      let ids = this.fields.get(value);
      if (ids) {
        modelPackage.identityFields.delete(ids.idKey.toString());
      }
    });
  }

  get plural(): string {
    return this.getMetadata('name.plural');
  }

  get relations(): Set<string> {
    return this.$obj.relations;
  }

  get required(): Set<string> {
    return this.$obj.required;
  }

  get identity(): Set<string> {
    return this.$obj.identity;
  }

  get fields(): Map<string, Field> {
    return this.$obj.fields;
  }

  get indexed(): Set<string> {
    return this.$obj.indexed;
  }

  protected updateIndex(f: Field) {
    let indexes = this.getMetadata('storage.indexes', {});
    if (f.indexed) {
      let indexName: string | string[];
      if (typeof f.indexed === 'boolean') {
        indexName = f.name;
      } else if (Array.isArray(f.indexed)) {
        indexName = f.indexed;
      } else if (typeof f.indexed === 'string') {
        indexName = f.indexed.split(' ');
      }
      let entry = {
        fields: {
          [f.name]: 1,
        },
        options: {
          sparse: true,
          unique: !!f.identity,
        },
      };
      if (typeof indexName === 'string') {
        indexes[indexName] = entry;
      } else {
        for (let i = 0, len = indexName.length; i < len; i++) {
          let index = indexName[i];
          if (indexes.hasOwnProperty(index)) {
            indexes[index] = deepMerge(indexes[index], entry);
          } else {
            indexes[index] = entry;
          }
        }
      }
    }
  }

  public updateWith(obj: EntityInput) {
    if (obj) {
      super.updateWith(obj);

      const result = Object.assign({}, this.$obj);
      result.name = inflected.classify(result.name);

      if (result.name !== obj.name) {
        console.warn(`Please use singular form of Noun to name entity ${result.name}!=${obj.name}`);
      }

      let $plural = obj.plural;
      if (!$plural) {
        $plural = inflected.pluralize(result.name);
      }

      this.setMetadata('name.singular', result.name);
      this.setMetadata('name.plural', $plural);

      result.name = (result.name.slice(0, 1)).toUpperCase() + result.name.slice(1);

      const fields = new Map();
      const relations = new Set();
      const identity = new Set();
      const required = new Set();
      const indexed = new Set();

      let traverse = (f, index) => {
        let field = new Field({
          ...f,
          metadata: {
            order: index,
            ...f.metadata,
          },
          entity: result.name,
        });

        if (fields.has(field.name)) {
          throw new Error(`the same field ${field.name} is already exists in ${obj.name} entry`);
        }

        fields.set(field.name, field);

        if (field.identity) {
          identity.add(field.name);
        }

        if (field.required) {
          required.add(field.name);
        }

        if (field.relation) {
          relations.add(field.name);
        }

        if (field.indexed) {
          indexed.add(field.name);
          this.updateIndex(field);
        }
      };

      if (Array.isArray(obj.fields)) {
        (obj.fields as FieldInput[]).forEach(traverse);
      } else {
        let fieldNames = Object.keys(obj.fields);
        for (let i = 0, len = fieldNames.length; i < len; i++) {
          let fName = fieldNames[i];
          traverse({ ...obj.fields[fName], name: fName }, i);
        }
      }

      if (identity.size === 0 || !(fields.has('_id') || fields.has('id'))) {
        let f;
        if (fields.has('id')) {
          f = fields.get('id');
        } else if (!f && fields.has('_id')) {
          f = fields.get('_id');
        } else {
          f = new Field(Object.assign({}, DEFAULT_ID_FIELD, { entity: result.name }));
          fields.set(f.name, f);
        }

        if (f) {
          f.makeIdentity();
          indexed.add(f.name);
          identity.add(f.name);
          required.add(f.name);
        }
      }

      result.relations = relations;
      result.identity = identity;
      result.required = required;
      result.indexed = indexed;
      result.fields = fields;

      this.$obj = Object.assign({}, result);
    }
  }

  public toObject(modelPackage?: ModelPackage) {
    if (!modelPackage) {
      let props = this.$obj;
      let res = super.toObject();
      return JSON.parse(
        JSON.stringify(
          Object.assign(
            {},
            res,
            {
              fields: [...props.fields.values()].map(f => f.toObject()),
            },
          ),
        ),
      );
    } else {
      let modelRelations = modelPackage.relations.get(this.name);
      if (modelRelations) {
        let props = this.$obj;
        let res = super.toObject();
        return JSON.parse(
          JSON.stringify(
            Object.assign(
              {},
              res,
              {
                fields: [...props.fields.values()].map(f => {
                  let result;
                  if (this.relations.has(f.name)) {
                    if (modelRelations && modelRelations.has(f.name)) {
                      result = f.toObject(modelPackage);
                    }
                  } else {
                    result = f.toObject(modelPackage);
                  }
                  return result;
                }).filter(f => f),
              },
            ),
          ),
        );
      }
    }
  }

  public toJSON(modelPackage?: ModelPackage): EntityJSON {
    if (!modelPackage) {
      let props = this.$obj;
      let res = super.toJSON();
      return JSON.parse(JSON.stringify(
        Object.assign({},
          res,
          {
            fields: [...props.fields.values()],
          },
        ),
      ),
      );
    } else {
      let modelRelations = modelPackage.relations.get(this.name);
      if (modelRelations) {
        let props = this.$obj;
        let res = super.toJSON();
        return JSON.parse(
          JSON.stringify(
            Object.assign(
              {},
              res,
              {
                fields: [...props.fields.values()].map(f => {
                  let result;
                  if (this.relations.has(f.name)) {
                    if (modelRelations && modelRelations.has(f.name)) {
                      result = f.toJSON(modelPackage);
                    }
                  } else {
                    result = f.toJSON(modelPackage);
                  }
                  return result;
                }).filter(f => f),
              },
            ),
          ),
        );
      }
    }
  }
}
