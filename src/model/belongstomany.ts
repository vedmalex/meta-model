import capitalize from './../lib/capitalize';
import decapitalize from './../lib/decapitalize';
import { RelationBase } from './relationbase';
import { EntityReference } from './entityreference';
import { BelongsToManyStorage, BelongsToManyInput, EntityInput, FieldInput } from './interfaces';
import { ModelPackage } from './modelpackage';
import { Entity } from './entity';

// http://ooad.asf.ru/standarts/UML/spr/Association_class.aspx

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
      let defaultPackage = modelPackage.metaModel.defaultPackage;
      if (!modelPackage.entities.has(this.using.entity)) {
        // создать
        // 1. найти одноименную связь в ref классе.
        let refe = defaultPackage.entities.get(this.ref.entity);
        let owner = defaultPackage.entities.get(this.$obj.entity);
        let relsCandidate = refe && Array.from(refe.relations)
          // только одноименная связь
          // было что один класс связки мог быть для связывания разных объектов... это логическая ошибка...
          // не соответствует UML и вообще представлению о ОО-дизайне.
          // .filter(r => refe.fields.get(r).relation.name === this.name)
          // по одноименному классу ассоциации
          .filter(r => (refe.fields.get(r).relation instanceof BelongsToMany)
            && (refe.fields.get(r).relation as BelongsToMany).using.entity === this.using.entity)
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
            if (hash.has(curr.name)) {
              curr = Object.assign({}, hash.get(curr.name), curr);
            }
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
            type: this.using.backField ? owner.fields.get(this.using.backField).type : 'ID',
            indexed: true,
          }, {
            name: decapitalize(this.ref.entity),
            type: refe.fields.get(this.ref.field).type,
            indexed: true,
          },
          ...(this.fields || []),
          ].reduce((hash, curr) => {
            if (hash.has(curr.name)) {
              curr = Object.assign({}, hash.get(curr.name), curr);
            }
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
        // проверить типы.... ?
        let using = modelPackage.entities.get(this.using.entity);
        let refe = defaultPackage.entities.get(this.ref.entity);

        let update = using.toJSON();
        // проверить поля на отсутствие повторов.
        let fieldsMap = [
          {
            name: this.using.field,
            type: refe.fields.get(this.ref.field).type,
            indexed: true,
          },
          ...this.fields,
          ...update.fields as FieldInput[],
        ].reduce((hash, curr) => {
          if (hash.has(curr.name)) {
            curr = Object.assign({}, hash.get(curr.name), curr);
          }
          hash.set(curr.name, curr as FieldInput);
          return hash;
        }, new Map<string, FieldInput>());

        update.fields = Array.from(fieldsMap.values());
        using.updateWith(update);
      }
    }
  }

  public updateWith(obj: BelongsToManyInput) {
    if (obj) {
      super.updateWith(obj);
      const result = Object.assign({}, this.$obj);

      let $belongsToMany = obj.belongsToMany;
      this.setMetadata('storage.single', false);
      this.setMetadata('storage.stored', false);
      this.setMetadata('storage.embedded', false);
      this.setMetadata('verb', 'BelongsToMany');

      let $using = obj.using;

      let belongsToMany;
      if ($belongsToMany) {
        belongsToMany = new EntityReference($belongsToMany);
      }

      let using;
      if ($using) {
        using = new EntityReference($using);
      } else {
        // this single end association to other
        // this.$obj.verb = 'HasMany';
        let relName = `${this.$obj.entity}${capitalize(this.$obj.field)}`;
        using = new EntityReference(`${obj.name || relName}#${decapitalize(obj.entity)}`);
      }
      // why? this is need
      // if (!this.$obj.name_ && using) {
      //   result.name = using.entity;
      // }

      result.belongsToMany_ = $belongsToMany;
      result.belongsToMany = belongsToMany;

      result.using_ = $using;
      result.using = using;

      this.$obj = Object.assign({}, result);
      this.initNames();
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
          },
        ),
      ),
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
          },
        ),
      ),
    );
  }
}
