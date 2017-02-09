import { Entity } from './entity';
import { ModelPackage } from './modelpackage';
import {
  MetaModelStore, EntityInput,
  MutationInput, FieldInput, ModelHook,
} from './interfaces';
import { Mutation } from './mutation';
import deepMerge from '../lib/json/deepMerge';
import fold from '../lib/json/fold';

import * as fs from 'fs';

/**
 * Represents meta-model store
 */
export class MetaModel extends ModelPackage {
  public packages: Map<string, ModelPackage> = new Map();
  public store: string = 'default.json';
  public defaultPackage: ModelPackage;

  constructor() {
    super('default');
    this.ensureDefaultPackage();
  }

  public loadModel(fileName: string = this.store) {
    let txt = fs.readFileSync(fileName);
    let store = JSON.parse(txt.toString()) as MetaModelStore;
    this.loadPackage(store);
  }

  protected dedupeFields(src: FieldInput[]) {
    return src.reduce((res, curr) => {
      if (!res.hasOwnProperty(curr.name)) {
        res[curr.name] = curr;
      } else {
        res[curr.name] = deepMerge(res[curr.name], curr);
      }
      return res;
    }, {});
  }

  protected applyEntityHook(entity: Entity, hook: EntityInput): Entity {
    let result = entity.toJSON();
    let metadata;
    if (hook.metadata) {
      metadata = deepMerge(result.metadata || {}, hook.metadata);
    }
    let fields: {
      [fName: string]: FieldInput;
    };
    if (hook.fields) {
      if (Array.isArray(hook.fields)) {
        fields = this.dedupeFields([
          ...result.fields as FieldInput[],
          ...hook.fields as FieldInput[],
        ]);
      } else {
        fields = this.dedupeFields(result.fields);
        let fNames = Object.keys(hook.fields);
        for (let i = 0, len = fNames.length; i < len; i++) {
          let fName = fNames[i];
          if (fields.hasOwnProperty(fName)) {
            fields[fName] = deepMerge(fields[fName], hook.fields[fName]);
          } else {
            fields[fName] = hook.fields[fName];
          }
        }
      }
    }

    return new Entity({
      ...result,
      fields,
      metadata,
    });
  }

  protected applyMutationHook(mutation: Mutation, hook: MutationInput): Mutation {
    let result = mutation.toJSON() as MutationInput;
    let metadata;
    if (hook.metadata) {
      metadata = deepMerge(result.metadata || {}, hook.metadata);
    }

    let args = result.args, payload = result.payload;
    if (hook.args) {
      args = [
        ...args,
        ...hook.args,
      ];
    }

    if (hook.payload) {
      payload = [
        ...payload,
        ...hook.payload,
      ];
    }

    result = {
      ...result,
      args,
      payload,
      metadata,
    };
    return new Mutation(result);
  }

  public applyHooks(hooks?: ModelHook[]) {
    if (hooks && !Array.isArray(hooks)) {
      hooks = [hooks];
    }
    if (hooks) {
      hooks.forEach(hook => {
        if (hook.entities) {
          let keys = Object.keys(hook.entities);
          for (let i = 0, len = keys.length; i < len; i++) {
            let key = keys[i];
            let current = hook.entities[key];
            current.fields = current.fields ? current.fields : [];
            current.metadata = current.metadata ? current.metadata : {};
            if (key === '*') {
              Array.from(this.entities.values()).forEach(e => {
                let result = this.applyEntityHook(e, current);
                this.entities.set(result.name, result);
              });
            } else {
              let e = this.entities.get(key);
              if (!e) {
                throw new Error(`Entity ${key} didn't exists anywhere`);
              }
              let result = this.applyEntityHook(e, current);
              this.entities.set(result.name, result);
            }
          }
        }
        if (hook.mutations) {
          let keys = Object.keys(hook.mutations);
          for (let i = 0, len = keys.length; i < len; i++) {
            let key = keys[i];
            let current = hook.mutations[key];
            current.args = current.args ? current.args : [];
            current.payload = current.payload ? current.payload : [];
            current.metadata = current.metadata ? current.metadata : {};
            if (key === '*') {
              Array.from(this.mutations.values()).forEach(e => {
                let result = this.applyMutationHook(e, current);
                this.mutations.set(result.name, result);
              });
            } else {
              let e = this.mutations.get(key);
              let result = this.applyMutationHook(e, current);
              this.mutations.set(result.name, result);
            }
          }
        }
      });
    }
  }

  public loadPackage(store: MetaModelStore, hooks?: any[]) {
    this.reset();

    store.entities.forEach((ent) => {
      this.addEntity(new Entity(ent));
    });

    store.mutations.forEach(mut => {
      this.addMutation(new Mutation(mut));
    });

    this.ensureDefaultPackage();

    this.applyHooks(fold(hooks) as ModelHook[]);

    store.packages.forEach((pckg) => {
      let pack = new ModelPackage(pckg);
      pack.connect(this);
      this.packages.set(pckg.name, pack);
      pckg.entities.forEach(e => {
        if (this.entities.has(e)) {
          pack.addEntity(this.entities.get(e));
        }
      });
      pckg.mutations.forEach(m => {
        if (this.mutations.has(m)) {
          pack.addMutation(this.mutations.get(m));
        }
      });
      pack.ensureAll();
    });
  }

  public saveModel(fileName: string = this.store) {
    fs.writeFileSync(fileName, JSON.stringify({
      entities: Array.from(this.entities.values()).map(f => f.toJSON()),
      packages: Array.from(this.packages.values())/*.filter(p => p.name !== 'default')*/.map(f => f.toJSON()),
      mutations: Array.from(this.mutations.values()).map(f => f.toJSON()),
    }));
  }

  public reset() {
    this.entities.clear();
    this.packages.clear();
    this.mutations.clear();
  }

  public createPackage(name: string): ModelPackage {
    if (this.packages.has(name)) {
      throw new Error(`Package "${name}" already exists`);
    }
    let pack = new ModelPackage(name);
    this.packages.set(name, pack);
    pack.connect(this);
    return pack;
  }

  public assignEntityToPackage(input: { entity: string, package: string }) {
    let pack = this.packages.get(input.package);
    if (!pack) {
      throw new Error(`Package ${input.package} didn't exists`);
    };
    let ent = this.entities.get(input.entity);
    if (!ent) {
      throw new Error(`Package ${input.entity} didn't exists`);
    }
    pack.addEntity(ent);
    pack.ensureAll();
    return {
      package: pack,
      entity: ent,
    };
  }

  private ensureDefaultPackage() {
    if (!this.packages.has('default')) {
      this.defaultPackage = this;
      this.connect(this);
      this.ensureAll();
      this.packages.set('default', this);
    }
  }
}
