import { Entity } from './entity';
import { ModelPackage } from './modelpackage';
import {
  MetaModelStore, EntityInput,
  MutationInput, FieldInput, ModelHook,
  ModelPackageStore,
} from './interfaces';
import { Mutation } from './mutation';
import deepMerge from '../lib/json/deepMerge';
import fold from '../lib/json/fold';

import * as fs from 'fs';

function getFilter(inp: string): { filter: (f) => boolean, fields: string[] } {
  let result = {
    filter: f => f.name === inp,
    fields: [inp],
  };
  if (inp === '*') {
    result.filter = () => true;
  }
  if (inp.startsWith('^[')) {
    let notFields = inp.slice(2, inp.length - 1)
      .split(',')
      .map(f => f.trim())
      .reduce((res, cur) => {
        res[cur] = 1;
        return res;
      }, {});
    result.filter = f => !notFields[f.name];
    result.fields = [];
  }
  if (inp.startsWith('[')) {
    let onlyFields = inp.slice(1, inp.length - 1)
      .split(',')
      .map(f => f.trim())
      .reduce((res, cur) => {
        res[cur] = 1;
        return res;
      }, {});
    result.filter = f => !!onlyFields[f.name];
    result.fields = Object.keys(onlyFields);
  }
  return result;
}

/**
 * Represents meta-model store
 */
export class MetaModel extends ModelPackage {
  public packages: Map<string, ModelPackage> = new Map();
  public store: string = 'default.json';
  public defaultPackage: ModelPackage;

  constructor(name: string = 'default') {
    super(name);
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
          let prepare = getFilter(fName);
          let list = result.fields.filter(prepare.filter);
          if (list.length > 0) {
            list.forEach(f => {
              fields[f.name] = deepMerge(f, hook.fields[fName]);
            });
          } else {
            // create specific items
            prepare.fields.forEach(f => {
              fields[f] = hook.fields[fName];
            });
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
      debugger;
      hooks = hooks.filter(f => f);
      hooks.forEach(hook => {
        if (hook.entities) {
          let keys = Object.keys(hook.entities);
          for (let i = 0, len = keys.length; i < len; i++) {
            let key = keys[i];
            let current = hook.entities[key];
            current.fields = current.fields ? current.fields : [];
            current.metadata = current.metadata ? current.metadata : {};
            let prepare = getFilter(key);
            let list = Array.from(this.entities.values()).filter(prepare.filter);
            if (list.length > 0) {
              list.forEach(e => {
                let result = this.applyEntityHook(e, current);
                this.entities.set(result.name, result);
              });
            } else if (prepare.fields.length > 0) {
              throw new Error(`Entit${prepare.fields.length === 1 ? 'y' : 'ies'} ${prepare.fields} not found`);
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

            let prepare = getFilter(key);
            let list = Array.from(this.mutations.values()).filter(prepare.filter);
            if (list.length > 0) {
              list.forEach(e => {
                let result = this.applyMutationHook(e, current);
                this.mutations.set(result.name, result);
              });
            } else if (prepare.fields.length > 0) {
              throw new Error(`Mutation${prepare.fields.length > 1 ? 's' : ''} ${prepare.fields} not found`);
            }
          }
        }
      });
    }
  }

  public addPackage(pckg: ModelPackageStore) {
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

    store.packages.forEach(this.addPackage.bind(this));
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
    if (!this.packages.has(this.name)) {
      this.defaultPackage = this;
      this.connect(this);
      this.ensureAll();
      this.packages.set(this.name, this);
    }
  }
}
