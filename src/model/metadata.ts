import get from './../lib/json/get';
import set from './../lib/json/set';

export class Metadata {

  public metadata: { [key: string]: any };

  constructor(inp: { metadata?: { [key: string]: any } }) {
    this.setMetadata('*', inp.metadata);
  }

  public getMetadata(key?: string, def?: any): any {
    if (!key) {
      return this.metadata;
    } else {
      return get(this.metadata, key) || def;
    }
  }

  public setMetadata(key?: string | { [key: string]: any }, data?: { [key: string]: any } | any): any {
    if (typeof key !== 'string' && !data) {
      data = key; key = '*';
    }
    if (data) {
      if (key === '*') {
        this.metadata = data as any;
      } else {
        if (!this.metadata) {
          this.metadata = {};
        }
        set(this.metadata, key, data);
      }
    }
  }
    public toObject(): { [key: string]: any } {
    return {
      metadata: this.metadata,
    };
  }

  public toJSON(): { [key: string]: any } {
    return this.toObject();
  }
}
