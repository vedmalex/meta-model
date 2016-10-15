import { Entity } from './entity';
import {Field } from './field';
import {ModelPackageInput, EntityInput } from './interfaces';

/** Model package is the storage place of Entities */
export class ModelPackage {
  /** name of the package */
  public name: string;
  /** display title */
  public title?: string;
  /** description */
  public description?: string;
  /** entity storage */
  public entities: Map<string, Entity>;
  /** Identity fields cache */
  public identityFields: Map<string, Entity>;
  /** relation cache */
  public relations: Map<string, Map<string, Field>>;

  constructor(name?: string | ModelPackageInput, title?: string, description?: string) {
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
    }
    // список всех entity в пакете
    this.entities = new Map();
    // существующие в пакете identity
    this.identityFields = new Map();
    // ref для исправлений
    this.relations = new Map();
  }

  /** add entity to PAckage */
  public add(entity: Entity) {
    if (entity instanceof Entity) {
      this.entities.set(entity.name, entity);
      entity.ensureIds(this);
    }
    return entity;
  }

  /** get Entity by name */
  public get(name: string) {
    return this.entities.get(name);
  }

  /** create entity with json */
  public create(json: EntityInput) {
    return this.add(new Entity(json));
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
  public ensureAll() {
    this.entities.forEach((e) => {
      e.ensureFKs(this);
    });
  }

  public toJSON() {
    return {
      name: this.name,
      title: this.title,
      description: this.description,
      entities: Array.from(this.entities.values()).map(f => f.name),
    };
  }
}
