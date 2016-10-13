import { Entity } from '../model/entity';
import { Field } from '../model/field';

export type ModelPackageInput = {
  name: string
  title: string
  description: string
}

/** Model package is the storage place of Entities */
export class ModelPackage {
  /** name of the package */
  name: string
  /** display title */
  title: string
  /** description */
  description: string
  /** entity storage */
  entities: Map<string, Entity>
  /** Identity fields cache */
  identityFields: Map<string, Entity>
  /** relation cache */
  relations: Map<string, Set<string>>

  constructor(name: string | ModelPackageInput, title?: string, description?: string) {
    if (typeof name == 'string') {
      this.name = name || 'DefaultPackage';
      this.title = title || this.name;
      this.description = description || this.name;
    } else {
      this.name = name.name;
      this.title = name.title;
      this.description = name.description;
    }
    // список всех entity
    this.entities = new Map();
    // существующие в пакете identity
    this.identityFields = new Map();
    // ref для исправлений
    this.relations = new Map();
  }

  /** add entity to PAckage */
  add(entity: Entity) {
    if (entity instanceof Entity) {
      this.entities.set(entity.name, entity);
      entity.ensureIds(this);
    }
    return entity;
  }

  /** get Entity by name */
  get(name) {
    return this.entities.get(name);
  }

  /** create entity with json */
  create(json) {
    return this.add(new Entity(json));
  }

  /** remove entity from package*/
  remove(name) {
    let entity = this.entities.get(name);
    if (entity) {
      this.entities.delete(name);
      entity.removeIds(this);
    }
  }
  /** return size of package */
  get size() {
    return this.entities.size;
  }

  /** ensure all foreign keys */
  ensureAll() {
    this.entities.forEach((e) => {
      e.ensureFKs(this);
    });
  }
}
