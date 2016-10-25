import { RelationBase } from './relationbase';
import { EntityReference } from './entityreference';
import { BelongsToManyStorage, BelongsToManyInput, EntityInput } from './interfaces';
import { ModelPackage } from './modelpackage';
import { Entity } from './entity';

export class BelongsToMany extends RelationBase {

  protected $obj: BelongsToManyStorage;

  get belongsToMany(): EntityReference {
    return this.$obj.belongsToMany;
  }

  get using(): EntityReference {
    return this.$obj.using;
  }

  get ref(): EntityReference {
    return this.$obj.belongsToMany;
  }

  public ensureRelationClass(modelPackage: ModelPackage) {
    if (modelPackage) {
      if (!modelPackage.entities.has(this.using.entity)) {
        // создать
        let refe = modelPackage.entities.get(this.ref.entity);
        modelPackage.addEntity(new Entity({
          name: `${this.using.entity}`,
          fields: [{
            name: this.using.field,
            type: refe.fields.get(this.ref.field).type,
            indexed: true,
          },
          ...this.fields,
          ],
        } as EntityInput));
      } else {
        // Проверить что все необходимые поля созданы.
        let using = modelPackage.entities.get(this.using.entity);
        if (!using.fields.has(this.using.field)) {
          let refe = modelPackage.entities.get(this.ref.entity);

          let update = using.toJSON();
          update.fields = [
            {
              name: this.using.field,
              type: refe.fields.get(this.ref.field).type,
              indexed: true,
            },
            ...update.fields,
            ...this.fields,
          ];
          using.updateWith(update);
        }
      }
    }
  }

  public updateWith(obj: BelongsToManyInput) {
    if (obj) {
      super.updateWith(obj);

      const result = Object.assign({}, this.$obj);

      let $belongsToMany = obj.belongsToMany;

      let $using = obj.using;

      let belongsToMany;
      if ($belongsToMany) {
        belongsToMany = new EntityReference($belongsToMany);
      }

      let using;
      if ($using) {
        using = new EntityReference($using);
      } else {
        using = new EntityReference(`${obj.name || obj.entity}#${obj.entity.toLowerCase()}`);
      }

      if (!this.$obj.name_ && using) {
        result.name = using.entity;
      }

      result.belongsToMany_ = $belongsToMany;
      result.belongsToMany = belongsToMany;

      result.using_ = $using;
      result.using = using;

      result.verb = 'BelongsToMany';
      this.$obj = Object.assign({}, result);
    }
  }
  // it get fixed object
  public toObject() {
    let props = this.$obj;
    let res = super.toObject();
    return JSON.parse(
      JSON.stringify(
        Object.assign(
          {},
          res,
          {
            belongsToMany: props.belongsToMany ? props.belongsToMany.toString() : undefined,
            using: props.using ? props.using.toString() : undefined,
          }
        )
      )
    );
  }

  // it get clean object with no default values
  public toJSON() {
    let props = this.$obj;
    let res = super.toJSON();
    return JSON.parse(
      JSON.stringify(
        Object.assign(
          {},
          res,
          {
            belongsToMany: props.belongsToMany_,
            using: props.using_,
          }
        )
      )
    );
  }
}
