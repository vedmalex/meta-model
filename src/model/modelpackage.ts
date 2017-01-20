import { Entity } from './entity';
import { Field } from './field';
import { ModelPackageInput, EntityInput } from './interfaces';
import { MetaModel } from './metamodel';
import { Mutation } from './mutation';

/** Model package is the storage place of Entities */
export class ModelPackage {
  /** name of the package */
  public name: string;
  /** display title */
  public title?: string;
  /** description */
  public description?: string;
  /** package is diagram */
  public abstract: boolean = false;
  /** entity storage */
  public entities: Map<string, Entity> = new Map();
  /** Identity fields cache */
  public identityFields: Map<string, Entity> = new Map();
  /** relation cache */
  public relations: Map<string, Map<string, Field>> = new Map();
  public mutations: Map<string, Mutation> = new Map();

  public metaModel: MetaModel;

  constructor(name?: string | ModelPackageInput, title?: string, description?: string, parent?: MetaModel) {
    if (typeof name === 'string') {
      this.name = name;
      this.title = title || this.name;
      this.description = description || this.name;
    } else if (!name) {
      this.name = 'DefaultPackage';
    } else {
      this.name = name.name;
      this.title = name.title;
      this.description = name.description;
      this.abstract = this.abstract || name.abstract;
    }
  }

  public connect(metaModel: MetaModel) {
    this.metaModel = metaModel;
  }

  /** add entity to Package */
  public addEntity(entity: Entity) {
    if (entity instanceof Entity) {
      this.entities.set(entity.name, entity);
      entity.ensureIds(this);
    }
    this.ensureEntity(entity);
    return entity;
  }

  public addMutation(mutation: Mutation) {
    if (mutation instanceof Mutation) {
      this.mutations.set(mutation.name, mutation);
    }
    this.ensureMutation(mutation);
    return mutation;
  }

  /** get Entity by name */
  public get(name: string) {
    return this.entities.get(name);
  }

  /** create entity with json */
  public create(json: EntityInput) {
    return this.addEntity(new Entity(json));
  }

  /**
   * remove entity from package
   */
  public remove(name: string) {
    let entity = this.entities.get(name);
    if (entity) {
      this.entities.delete(name);
      entity.removeIds(this);
    }
  }
  /**
   *  return size of package
   */
  get size(): number {
    return this.entities.size;
  }

  /** ensure all foreign keys */
  public ensureAll(): Field[] {
    let missing: Field[] = [];
    this.entities.forEach((e) => {
      missing = [
        ...missing,
        ...e.ensureFKs(this),
      ];
    });
    return missing;
  }

  public toJSON(): ModelPackageInput {
    return {
      name: this.name,
      title: this.title,
      description: this.description,
      entities: Array.from(this.entities.values()).map(f => f.name),
      mutations: Array.from(this.mutations.values()).map(f => f.toJSON()),
    };
  }

  public toObject() {
    return {
      name: this.name,
      title: this.title,
      description: this.description,
      entities: Array.from(this.entities.values()).map(f => f.toObject(this)),
      mutations: Array.from(this.mutations.values()).map(f => f.toObject(this)),
    };
  }

  private ensureEntity(entity) {
    if (!this.metaModel.entityList.has(entity.name)) {
      this.metaModel.entityList.set(entity.name, entity);
    }
  }
  private ensureMutation(entity) {
    if (!this.metaModel.mutationList.has(entity.name)) {
      this.metaModel.mutationList.set(entity.name, entity);
    }
  }
}
