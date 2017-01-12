import { ModelBase } from './modelbase';
import { Field } from './field';
import { HasOne } from './hasone';
import { HasMany } from './hasmany';
import { BelongsTo } from './belongsto';
import { BelongsToMany } from './belongstomany';
import { DEFAULT_ID_FIELD } from './definitions';
import { ModelPackage } from './modelpackage';
import { EntityStorage, EntityInput } from './interfaces';
import * as inflected from 'inflected';

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
                let rel = refe.fields.get(opposite).relation;
                let wellformed = opposite && refe.fields.has(opposite)
                  && (rel instanceof BelongsTo);

                if (rel.opposite !== field.name) {
                  rel.opposite = field.name;
                }

                if (!wellformed) {
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
                let rel = refe.fields.get(opposite).relation;
                let wellformed = opposite && refe.fields.has(opposite)
                  && (rel instanceof BelongsTo);

                if (rel.opposite !== field.name) {
                  rel.opposite = field.name;
                }

                if (!wellformed) {
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
                let rel = refe.fields.get(opposite).relation;
                let wellformed = opposite && refe.fields.has(opposite)
                  && (rel instanceof BelongsToMany);

                if (rel.opposite !== field.name) {
                  rel.opposite = field.name;
                }

                if (!wellformed) {
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
                let rel = refe.fields.get(opposite).relation;
                let wellformed = opposite && refe.fields.has(opposite)
                  && (rel instanceof HasOne || rel instanceof HasMany);

                if (rel.opposite !== field.name) {
                  rel.opposite = field.name;
                }

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
    return this.$obj.plural;
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
      let plural = inflected.camelize($plural.trim());

      result.name = (result.name.slice(0, 1)).toUpperCase() + result.name.slice(1);

      const fields = new Map();
      const relations = new Set();
      const identity = new Set();
      const required = new Set();
      const indexed = new Set();

      result.plural_ = $plural;
      result.plural = plural;

      obj.fields.forEach(f => {

        let field = new Field(Object.assign({}, f, { entity: result.name }));

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
        }

      });

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
              plural: props.plural,
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
                plural: props.plural,
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

  public toJSON(modelPackage?: ModelPackage) {
    if (!modelPackage) {
      let props = this.$obj;
      let res = super.toJSON();
      return JSON.parse(JSON.stringify(
        Object.assign({},
          res,
          {
            plural: props.plural_,
            fields: [...props.fields.values()].map(f => f.toJSON()),
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
                plural: props.plural_,
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
