import decapitalize from './../lib/decapitalize';
import { RelationBase } from './relationbase';
import { EntityReference } from './entityreference';
import { BelongsToManyStorage, BelongsToManyInput, EntityInput, FieldInput } from './interfaces';
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
        // 1. найти одноименную связь в ref классе.
        let refe = modelPackage.entities.get(this.ref.entity);
        let owner = modelPackage.entities.get(this.$obj.entity);
        let relsCandidate = Array.from(refe.relations)
          .filter(r => refe.fields.get(r).relation.name === this.name)
          // только одноименная связь
          .map(r => refe.fields.get(r).relation)
          .filter(r => r instanceof BelongsToMany)[0] as BelongsToMany;

        if (relsCandidate) {

          let fieldsMap = [{
            name: this.using.field,
            type: owner.fields.get(relsCandidate.ref.field).type,
            indexed: true,
          }, {
            name: relsCandidate.using.field,
            type: refe.fields.get(this.ref.field).type,
            indexed: true,
          },
          ...this.fields,
          ].reduce((hash, curr) => {
            hash.set(curr.name, curr);
            return hash;
          }, new Map<string, FieldInput>());

          let fields = Array.from(fieldsMap.values());

          modelPackage.addEntity(new Entity({
            name: `${this.using.entity}`,
            fields,
          } as EntityInput));
        } else {
          // создаем оба поля ибо это просто вынесенная наружу связь

          let fieldsMap = [{
            name: this.using.field,
            type: 'ID',
            indexed: true,
          }, {
            name: decapitalize(this.using.entity),
            type: refe.fields.get(this.ref.field).type,
            indexed: true,
          },
          ...this.fields,
          ].reduce((hash, curr) => {
            hash.set(curr.name, curr);
            return hash;
          }, new Map<string, FieldInput>());

          let fields = Array.from(fieldsMap.values());

          modelPackage.addEntity(new Entity({
            name: `${this.using.entity}`,
            fields,
          } as EntityInput));
        }
      } else {
        // Проверить что все необходимые поля созданы.
        let using = modelPackage.entities.get(this.using.entity);
        if (!using.fields.has(this.using.field)) {
          let refe = modelPackage.entities.get(this.ref.entity);

          let update = using.toJSON();
          // проверить поля на отсутствие повторов.
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
      this.$obj.verb = 'BelongsToMany';

      const result = Object.assign({}, this.$obj);
      result.name = obj.name || this.relationName;

      let $belongsToMany = obj.belongsToMany;
      result.single = true;
      result.stored = false;
      result.embedded = false;

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
