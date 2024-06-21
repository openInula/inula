import { DLNode, DLNodeType } from './DLNode';
import { forwardHTMLProp } from './HTMLNode';
import { DLStore, cached } from './store';
import { schedule } from './scheduler';

/**
 * @class
 * @extends import('./DLNode').DLNode
 */
export class CompNode extends DLNode {
  /**
   * @brief Constructor, Comp type
   * @internal
   *  * key - private property key
   *  * $$key - dependency number, e.g. 0b1, 0b10, 0b100
   *  * $s$key - set of properties that depend on this property
   *  * $p$key - exist if this property is a prop
   *  * $e$key - exist if this property is an env
   *  * $en$key - exist if this property is an env, and it's the innermost env that contains this env
   *  * $w$key - exist if this property is a watcher
   *  * $f$key - a function that returns the value of this property, called when the property's dependencies change
   *  * _$children - children nodes of type PropView
   *  * _$contentKey - the key key of the content prop
   *  * _$forwardProps - exist if this node is forwarding props
   *  * _$forwardPropsId - the keys of the props that this node is forwarding, collected in _$setForwardProp
   *  * _$forwardPropsSet - contain all the nodes that are forwarding props to this node, collected with _$addForwardProps
   */
  constructor({ updateState, updateProp, getUpdateViews, didUnmount, willUnmount, didMount }) {
    super(DLNodeType.Comp);
    this.updateState = updateState;
    this.updateProp = updateProp;
    this.getUpdateViews = getUpdateViews;
    this.didUnmount = didUnmount;
    this.willUnmount = willUnmount;
    this.didMount = didMount;
  }

  /**
   * @brief Init function, called explicitly in the subclass's constructor
   * @param props - Object containing properties
   * @param content - Content to be used
   * @param children - Child nodes
   * @param forwardPropsScope - Scope for forwarding properties
   */
  init(props, content, children, forwardPropsScope) {
    this._$notInitd = true;

    // ---- Forward props first to allow internal props to override forwarded props
    if (forwardPropsScope) forwardPropsScope._$addForwardProps(this);

    // ---- Add envs
    DLStore.global.DLEnvStore &&
      Object.entries(DLStore.global.DLEnvStore.envs).forEach(([key, [value, envNode]]) => {
        if (key === '_$catchable') {
          this._$catchable = value;
          return;
        }
        if (!(`$e$${key}` in this)) return;
        envNode.addNode(this);
        this._$initEnv(key, value, envNode);
      });

    const willCall = () => {
      this._$callUpdatesBeforeInit();
      this.didMount && DLNode.addDidMount(this, this.didMount.bind(this));
      this.willUnmount && DLNode.addWillUnmount(this, this.willUnmount.bind(this));
      DLNode.addDidUnmount(this, this._$setUnmounted.bind(this));
      this.didUnmount && DLNode.addDidUnmount(this, this.didUnmount.bind(this));
      if (this.getUpdateViews) {
        const [baseNode, updateView] = this.getUpdateViews();
        this.updateView = updateView;
        this._$nodes = baseNode;
      }
    };

    if (this._$catchable) {
      this._$catchable(willCall)();
      if (this._$update) this._$update = this._$catchable(this._$update.bind(this));
      this.updateDerived = this._$catchable(this.updateDerived.bind(this));
      delete this._$catchable;
    } else {
      willCall();
    }

    return this;
  }

  _$setUnmounted() {
    this._$unmounted = true;
  }

  /**
   * @brief Call updates manually before the node is mounted
   */
  _$callUpdatesBeforeInit() {
    // invoke full updateState
    this.updateState(-1);
    delete this._$notInitd;
  }

  /**
   * @brief Set all the props to forward
   * @param key
   * @param value
   * @param deps
   */
  _$setPropToForward(key, value, deps) {
    this._$forwardPropsSet.forEach(node => {
      const isContent = key === '_$content';
      if (node._$dlNodeType === DLNodeType.Comp) {
        if (isContent) node._$setContent(() => value, deps);
        else node._$setProp(key, () => value, deps);
        return;
      }
      if (node instanceof HTMLElement) {
        if (isContent) key = 'textContent';
        forwardHTMLProp(node, key, () => value, deps);
      }
    });
  }

  /**
   * @brief Define forward props
   * @param key
   * @param value
   */
  _$setForwardProp(key, valueFunc, deps) {
    const notInitd = '_$notInitd' in this;
    if (!notInitd && this._$cache(key, deps)) return;
    const value = valueFunc();
    if (key === '_$content' && this._$contentKey) {
      this[this._$contentKey] = value;
      this.updateDerived(this._$contentKey);
    }
    this[key] = value;
    this.updateDerived(key);
    if (notInitd) this._$forwardPropsId.push(key);
    else this._$setPropToForward(key, value, deps);
  }

  /**
   * @brief Add a node to the set of nodes that are forwarding props to this node and init these props
   * @param node
   */
  _$addForwardProps(node) {
    this._$forwardPropsSet.add(node);
    this._$forwardPropsId.forEach(key => {
      this._$setPropToForward(key, this[key], []);
    });
    DLNode.addWillUnmount(node, this._$forwardPropsSet.delete.bind(this._$forwardPropsSet, node));
  }

  /**
   * @brief Cache the deps and return true if the deps are the same as the previous deps
   * @param key
   * @param deps
   * @returns
   */
  _$cache(key, deps) {
    if (!deps || !deps.length) return false;
    const cacheKey = `$cc$${key}`;
    if (cached(deps, this[cacheKey])) return true;
    this[cacheKey] = deps;
    return false;
  }

  /**
   * @brief Set the content prop, the key is stored in _$contentKey
   * @param value
   */
  _$setContent(valueFunc, deps) {
    if ('_$forwardProps' in this) return this._$setForwardProp('_$content', valueFunc, deps);
    const contentKey = this._$contentKey;
    if (!contentKey) return;
    if (this._$cache(contentKey, deps)) return;
    this[contentKey] = valueFunc();
    this.updateDerived(contentKey);
  }

  /**
   * @brief Set a prop directly, if this is a forwarded prop, go and init forwarded props
   * @param key
   * @param value
   * @param deps
   */
  _$setProp(key, valueFunc, deps) {
    if ('_$forwardProps' in this) return this._$setForwardProp(key, valueFunc, deps);
    if (this._$cache(key, deps)) return;
    this[key] = valueFunc();
    this.updateProp(key, this[key]);
  }

  _$setProps(valueFunc, deps) {
    if (this._$cache('props', deps)) return;
    const props = valueFunc();
    if (!props) return;
    Object.entries(props).forEach(([key, value]) => {
      this._$setProp(key, () => value, []);
    });
  }

  /**
   * @brief Init an env, put the corresponding innermost envNode in $en$key
   * @param key
   * @param value
   * @param envNode
   */
  _$initEnv(key, value, envNode) {
    this[key] = value;
    this[`$en$${key}`] = envNode;
  }

  // ---- Update functions
  /**
   * @brief Update an env, called in EnvNode._$update
   * @param key
   * @param value
   * @param envNode
   */
  _$updateEnv(key, value, envNode) {
    if (!(`$e$${key}` in this)) return;
    if (envNode !== this[`$en$${key}`]) return;
    this[key] = value;
    this.updateDerived(key);
  }

  /**
   * @brief Update a prop
   */
  _$ud(exp, key) {
    this.updateDerived(key);
    return exp;
  }

  /**
   * @brief Update properties that depend on this property
   * @param {any} newValue
   * @param {number} bit
   */
  updateDerived(newValue, bit) {
    if ('_$notInitd' in this) return;

    // ---- Update all properties that depend on this property
    this.updateState(bit);

    // ---- "trigger-view"
    this._$updateView(bit);
  }

  /**
   *
   * @param {number} bit
   * @private
   */
  _$updateView(bit) {
    if (this._$modelCallee) return this._$updateModelCallee();
    // if (!('_$update' in this)) return;
    if (!bit) return;
    // ---- Collect all depNums that need to be updated
    if ('_$depNumsToUpdate' in this) {
      this._$depNumsToUpdate.push(bit);
    } else {
      this._$depNumsToUpdate = [bit];
      // ---- Update in the next microtask
      schedule(() => {
        // ---- Abort if unmounted
        if (this._$unmounted) return;
        const depNums = this._$depNumsToUpdate;
        if (depNums.length > 0) {
          const depNum = depNums.reduce((acc, cur) => acc | cur, 0);
          this.updateView(depNum);
        }
        delete this._$depNumsToUpdate;
      });
    }
  }

  _$updateModelCallee() {
    if ('_$depNumsToUpdate' in this) return;
    this._$depNumsToUpdate = true;
    // ---- Update in the next microtask
    Promise.resolve().then(() => {
      // ---- Abort if unmounted
      if (this._$unmounted) return;
      this._$modelCallee.updateDerived(this._$modelKey);
      delete this._$depNumsToUpdate;
    });
  }

  /**
   * @brief Update all props and content of the model
   */
  static _$updateModel(model, propsFunc, contentFunc) {
    // ---- Suppress update because top level update will be performed
    //      directly by the state variable in the model callee, which will
    //      trigger the update of the model
    const props = propsFunc() ?? {};
    const collectedProps = props.s ?? [];
    props.m?.forEach(([props, deps]) => {
      Object.entries(props).forEach(([key, value]) => {
        collectedProps.push([key, value, deps]);
      });
    });
    collectedProps.forEach(([key, value, deps]) => {
      model._$setProp(key, () => value, deps);
    });
    const content = contentFunc();
    if (content) model._$setContent(() => content[0], content[1]);
  }

  static _$releaseModel() {
    delete this._$modelCallee;
  }

  /**
   * @brief Inject model in to a property
   * @param ModelCls
   * @param props { m: [props, deps], s: [key, value, deps] }
   * @param content
   * @param key
   * @returns
   */
  _$injectModel(ModelCls, propsFunc, contentFunc, key) {
    const props = propsFunc() ?? {};
    const collectedProps = props.s ?? [];
    props.m?.forEach(([props, deps]) => {
      Object.entries(props).forEach(([key, value]) => {
        collectedProps.push([key, value, deps]);
      });
    });
    const model = new ModelCls();
    model._$init(collectedProps, contentFunc(), null, null);
    model._$modelCallee = this;
    model._$modelKey = key;
    model._$update = CompNode._$updateModel.bind(null, model, propsFunc, contentFunc);

    return model;
  }
}

// ---- @View -> class Comp extends View
export const View = CompNode;
export const Model = CompNode;

/**
 * @brief Run all update functions given the key
 * @param dlNode
 * @param key
 */
export function update(dlNode, key) {
  dlNode.updateDerived(key);
}
