import set from './set';

const fold = (data) => {
  if (Array.isArray(data)) {
    const result = [];
    for (let i = 0, len = data.length; i < len; i++) {
      result.push(fold(data[i]));
    }
    return result;
  } else if (data instanceof Object) {
    let result = {};
    let keys = Object.keys(data);
    for (let i = 0, len = keys.length; i < len; i++) {
      let key = keys[i];
      let d = data[key];
      set(result, key, (d instanceof Object) ? fold(d) : d);
    }
    return result;
  }
};

export default fold;
