import { RelationBase } from './relationbase';
import { EntityReference } from './entityreference';
import { BelongsToStorage, BelongsToInput } from './interfaces';

/**
 * BelongsTo Relation
 */
export class BelongsTo extends RelationBase {
  protected $obj: BelongsToStorage;

  get belongsTo(): EntityReference {
    return this.$obj.belongsTo;
  }

  /**
   * common for all type Relations
   */
  get ref(): EntityReference {
    return this.$obj.belongsTo;
  }

  /**
   * single point update
   */
  public updateWith(obj: BelongsToInput) {
    if (obj) {
      super.updateWith(obj);

      const result = Object.assign({}, this.$obj);
      result.verb = 'BelongsTo';
      result.single = true;
      result.stored = true;
      result.embedded = false;

      let $belongsTo = obj.belongsTo;

      let belongsTo;
      if ($belongsTo) {
        belongsTo = new EntityReference($belongsTo);
      }

      result.belongsTo_ = $belongsTo;
      result.belongsTo = belongsTo;

      this.$obj = Object.assign({}, result);
    }
  }

  /**
   * it get fixed object
   */
  public toObject() {
    let props = this.$obj;
    let res = super.toObject();
    return JSON.parse(
      JSON.stringify(
        Object.assign({},
          res,
          {
            belongsTo: props.belongsTo ? props.belongsTo.toString() : undefined,
          }
        )
      )
    );
  }

  /**
   * it get clean object with no default values
   */
  public toJSON() {
    let props = this.$obj;
    let res = super.toJSON();
    return JSON.parse(
      JSON.stringify(
        Object.assign(
          {},
          res,
          {
            belongsTo: props.belongsTo_,
          },
        )
      )
    );
  }
}
