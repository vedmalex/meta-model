import { ModelBase } from './modelbase';
import { Field } from './field';
import { HasOne } from './hasone';
import { HasMany } from './hasmany';
import { BelongsTo } from './belongsto';
import { BelongsToMany } from './belongstomany';
import { DEFAULT_ID_FIELD } from './definitions';
import { ModelPackage } from './modelpackage';

interface EntityInternal extends I {
  identity: Map<string, string>
  fields: Map<string, Field>
}

export class Entity extends ModelBase {

  constructor(obj) {
    super(obj);
  }

  ensureIds(modelPackage: ModelPackage) {
    this.identity.forEach((value) => {
      var ids = this.fields.get(value);
      modelPackage.identityFields.set(ids.idKey.toString(), this);
    });
  }

  ensureFKs(modelPackage) {
    if (modelPackage) {
      let modelRelations;
      if (modelPackage.relations.has(this.name)) {
        modelRelations = modelPackage.relations.get(this.name);
      } else {
        modelRelations = new Map();
        modelPackage.relations.set(this.name, modelRelations);
      }

      this.relations.forEach((value) => {
        let ref = this.fields.get(value);
        // must be different to apply fixup
        modelRelations.set(ref.name, ref.clone());
      });

      let missing = this.checkRelations(modelPackage);
      missing.forEach((r) => {
        modelRelations.delete(r.name);
      });
    }
  }

  checkRelations(modelPackage) {
    let missing = [];
    if (modelPackage.relations.has(this.name)) {
      let modelRelations = modelPackage.relations.get(this.name);
      modelRelations.forEach((field) => {
        let r = field.relation;
        let missingRef = true;
        if (!r.ref.field) {
          // discover fieldName
          if (modelPackage.entities.has(r.ref.entity)) {
            let e = modelPackage.entities.get(r.ref.entity);
            r.ref.field = e.identity[0];
            missingRef = false;
          }
        }

        const fType = (r instanceof HasOne) ? 'HasOne' : (r instanceof HasMany ? 'HasMany' : (r instanceof BelongsToMany ? 'BelongsToMany' : 'BelongsTo'));
        switch (fType) {
          case 'HasOne':
            if (modelPackage.entities.has(r.ref.entity)) {
              let refe = modelPackage.entities.get(r.ref.entity);
              if (refe.relations.fields.has(r.ref.field)) {
                missingRef = false;
              }
            }
            break;
          case 'HasMany':
            // must be in ref store
            if (modelPackage.entities.has(r.ref.entity)) {
              let refe = modelPackage.entities.get(r.ref.entity);
              if (refe.fields.has(r.ref.field)) {
                missingRef = false;
              }
            }
            break;
          case 'BelongsToMany':
            // must be in ref store
            if (modelPackage.entities.has(r.ref.entity)) {
              let refe = modelPackage.entities.get(r.ref.entity);
              if (refe.fields.has(r.ref.field)) {
                missingRef = false;
              }
            } else {
              let using = r.using;
              if (using && modelPackage.entities.has(using.entity)) {
                // здесь нужно будет изменить тип ассоциации

                let replaceRef = r.toJSON();
                replaceRef.hasMany = replaceRef.using;

                delete replaceRef.belongsToMany;
                delete replaceRef.using;

                field.$obj.relation = new HasMany(replaceRef);
                missingRef = false;
              }
            }
            break;
          case 'BelongsTo':
            // must be in identity store
            if (modelPackage.identityFields.has(r.ref.toString())) {
              missingRef = false;
            }
            break;
        }

        if (missingRef) {
          missing.push(field);
        }
      });
    }
    return missing;
  }

  removeIds(modelPackage) {
    this.identity.forEach((value) => {
      var ids = this.fields.get(value);
      modelPackage.identityFields.delete(ids.idKey.toString());
    });
  }

  get relations() {
    return this.$obj ? this.$obj.relations : undefined;
  }

  get required() {
    return this.$obj ? this.$obj.required : undefined;
  }

  get identity() {
    return this.$obj ? this.$obj.identity : undefined;
  }

  get fields() {
    return this.$obj ? this.$obj.fields : undefined;
  }

  get indexed() {
    return this.$obj ? this.$obj.indexed : undefined;
  }


  updateWith(obj) {
    if (obj) {
      super.updateWith(obj);

      const result = this.$obj ? {...this.$obj } : {};

      result.name = (result.name.slice(0, 1)).toUpperCase() + result.name.slice(1);

      const fields = new Map();
      const relations = new Set();
      const identity = new Set();
      const required = new Set();
      const indexed = new Set();

      obj.fields.forEach(f => {

        let field = new Field({...f, entity: result.name});

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

    if (identity.size == 0) {
      let f;
      if (fields.has('id')) {
        f = fields.get('id');
      } else if (fields.has('_id')) {
        f = fields.get('_id');
      } else {
        f = new Field({...DEFAULT_ID_FIELD, entity: result.name});
      fields.set(f.name, f);
    }

    f.makeIdentity();
    indexed.add(f.name);
    identity.add(f.name);
    required.add(f.name);
  }

  result.relations = relations;
  result.identity = identity;
  result.required = required;
  result.indexed = indexed;
  result.fields = fields;

      this.$obj = {
        ...result
};
    }
  }

toObject(modelPackage) {
  if (!modelPackage) {
    let props = this.$obj;
    let res = super.toObject();
    return JSON.parse(JSON.stringify({
      ...res,
      fields: [...props.fields.values()].map(f => f.toObject()),
    }));
} else {
  let modelRelations = modelPackage.relations.get(this.name);
  if (modelRelations) {
    let props = this.$obj;
    let res = super.toObject();
    return JSON.parse(JSON.stringify({
          ...res,
      fields: [...props.fields.values()].map(f => {
        if (this.relations.has(f.name)) {
          if (modelRelations.has(f.name)) {
            return f.toObject(modelPackage);
          }
        } else {
          return f.toObject(modelPackage);
        }
      }).filter(f => f),
        }));
}
    }
  }

toJSON(modelPackage) {
  if (!modelPackage) {
    let props = this.$obj;
    let res = super.toJSON();
    return JSON.parse(JSON.stringify({
      ...res,
      fields: [...props.fields.values()].map(f => f.toJSON()),
    }));
} else {
  let modelRelations = modelPackage.relations.get(this.name);
  if (modelRelations) {
    let props = this.$obj;
    let res = super.toJSON();
    return JSON.parse(JSON.stringify({
          ...res,
      fields: [...props.fields.values()].map(f => {
        if (this.relations.has(f.name)) {
          if (modelRelations.has(f.name)) {
            return f.toJSON(modelPackage);
          }
        } else {
          return f.toJSON(modelPackage);
        }
      }).filter(f => f),
        }));
}
    }
  }
}
