import { Entity } from './entity';
import { ModelPackage } from './modelpackage';
import { MetaModelStore, EntityInput, ModelPackageInput, MutationInput } from './interfaces';
import { Mutation } from './mutation';
import * as fs from 'fs';

/**
 * Represents meta-model store
 */
export class MetaModel {
  public entityList: Map<string, Entity> = new Map();
  public mutationList: Map<string, Mutation> = new Map();
  public packagesList: Map<string, ModelPackage> = new Map();
  public store: string = 'default.json';
  public defaultPackage: ModelPackage;

  constructor() {
    this.ensureDefaultPackage();
  }

  public loadModel(fileName: string = this.store) {
    let txt = fs.readFileSync(fileName);
    let store = JSON.parse(txt.toString()) as MetaModelStore;
    this.loadPackage(store);
  }

  public loadPackage(store: MetaModelStore) {
    this.reset();
    store.entities.forEach((ent) => {
      this.entityList.set(ent.name, new Entity(ent));
    });

    store.mutations.forEach(mut => {
      this.mutationList.set(mut.name, new Mutation(mut as MutationInput));
    });

    this.ensureDefaultPackage();

    store.packages.forEach((pckg) => {
      let pack = new ModelPackage(pckg);
      pack.connect(this);
      this.packagesList.set(pckg.name, pack);
      pckg.entities.forEach(e => {
        if (this.entityList.has(e)) {
          pack.addEntity(this.entityList.get(e));
        }
      });
      pckg.mutations.forEach(m => {
        if (this.mutationList.has(m)) {
          pack.addMutation(this.mutationList.get(m));
        }
      });
      pack.ensureAll();
    });
  }

  public saveModel(fileName: string = this.store) {
    fs.writeFileSync(fileName, JSON.stringify({
      entities: Array.from(this.entityList.values()).map(f => f.toJSON()),
      packages: Array.from(this.packagesList.values()).map(f => f.toJSON()),
      mutations: Array.from(this.mutationList.values()).map(f => f.toJSON()),
    }));
  }

  public reset() {
    this.entityList.clear();
    this.packagesList.clear();
    this.mutationList.clear();
  }

  public createEntity(input: EntityInput): Entity {
    let entity = new Entity(input);
    if (this.entityList.has(entity.name)) {
      throw new Error(`Entity "${entity.name}" is already Exists`);
    }
    this.entityList.set(entity.name, entity);
    this.defaultPackage.addEntity(entity);
    this.defaultPackage.ensureAll();
    return entity;
  }

  public createMutation(input: MutationInput): Mutation {
    let mutation = new Mutation(input);
    if (this.mutationList.has(mutation.name)) {
      throw new Error(`Mutation "${mutation.name}" is already Exists`);
    }
    this.mutationList.set(mutation.name, mutation);
    this.defaultPackage.addMutation(mutation);
    return mutation;
  }

  public createPackage(name: string): ModelPackage {
    if (this.packagesList.has(name)) {
      throw new Error(`Package "${name}" already exists`);
    }
    let pack = new ModelPackage(name);
    this.packagesList.set(name, pack);
    pack.connect(this);
    return pack;
  }

  public assignEntityToPackage(input: { entity: string, package: string }) {
    let pack = this.packagesList.get(input.package);
    if (!pack) {
      throw new Error(`Package ${input.package} didn't exists`);
    };
    let ent = this.entityList.get(input.entity);
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
    if (!this.packagesList.has('default')) {
      let defPackage = new ModelPackage({ name: 'default' } as ModelPackageInput);
      defPackage.connect(this);
      this.defaultPackage = defPackage;
      this.entityList.forEach(e => {
        this.defaultPackage.addEntity(e);
      });
      this.mutationList.forEach(m => {
        this.defaultPackage.addMutation(m);
      });
      defPackage.ensureAll();
      this.packagesList.set('default', defPackage);
    }
  }
}
