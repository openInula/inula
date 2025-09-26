export default class SourceCodeContext {
  refs = {};
  data = {};
  props = {};
  computeds = {};
  components = {};
  methods = {};
  reactive = {};
  globalProperties = ['$route', '$router'];
  usedGlobalProperties = [];
  globalPropertiesName = 'globalProperties';
  extrasImports = new Map();
  // 在option api中注册的引入组件
  optionTypeRegistComponentMap = new Map();
  hasDirectives = false;
  has$t = false;
  has$l = false;
  has$i18n = false;
  selfThisDefines = new Map();
  i18n = ''; // 存 <i18n>{ "en": {}, "zh": {} }</i18n>
  propsName = 'props'; // 存 const props = defineProps({}); 的变量名字

  constructor() {}

  setProps(props) {
    this.props = props;
  }

  /**
   * 添加一个import 语句
   * addExtrasImport('ref','vue')
   * addExtrasImport('useEffect','Horizon')
   * @param {*} specifier
   * @param {*} source
   */
  addExtrasImport(specifier, source, defaultImport = false) {
    let specifiers = this.extrasImports.get(source) || new Map();
    specifiers.set(specifier, defaultImport);
    this.extrasImports.set(source, specifiers);
  }

  /**
   * 删除一个import 语句
   * @param {*} specifier
   * @param {*} source
   */
  removeImport(specifier, source) {
    let specifiers = this.extrasImports.get(source) || new Map();
    specifiers.delete(specifier);
    if (specifier.size === 0) {
      this.extrasImports.delete(source);
      return;
    }
    this.extrasImports.set(source, specifiers);
  }

  /**
   * 在option api中手动注册的引入组件
   */
  get importComponents() {
    return this.optionTypeRegistComponentMap;
  }

  set importComponents(componentsMap) {
    this.optionTypeRegistComponentMap = componentsMap;
  }

  get selfThisDefines() {
    return this.selfThisDefines;
  }

  get extrasImport() {
    return this.extrasImports;
  }

  get hasDirectives() {
    return this.hasDirectives;
  }

  set hasDirectives(hasDirectives) {
    this.hasDirectives = hasDirectives;
  }

  addRef(key, value) {
    this.refs[key] = value;
  }

  addComputed(key, value) {
    this.computeds[key] = value;
  }

  addMethods(key, value) {
    this.methods[key] = value;
  }

  addReactive(key, value) {
    this.reactive[key] = value;
  }

  addUsedGlobalProperties(key) {
    this.usedGlobalProperties.push(key);
  }

  setGlobalProperties(globalProperties) {
    this.globalProperties = [...this.globalProperties, ...globalProperties];
  }

  setHas$t(has$t) {
    this.has$t = has$t;
  }

  setHas$l(has$l) {
    this.has$l = has$l;
  }

  setHas$i18n(has$i18n) {
    this.has$i18n = has$i18n;
  }

  get refs() {
    return this.refs;
  }

  get computeds() {
    return this.computeds;
  }

  get reactive() {
    return this.reactive;
  }

  get usedGlobalProperties() {
    return this.usedGlobalProperties;
  }

  set i18n(content) {
    this.i18n = content;
  }

  get i18n() {
    return this.i18n;
  }

  set propsName(name) {
    this.propsName = name;
  }

  get propsName() {
    return this.propsName;
  }

  get globalPropertiesName() {
    return this.globalPropertiesName;
  }

  findKeyInProps(key) {
    return Reflect.has(this.props, key);
  }

  findKeyInComputeds(key) {
    return Reflect.has(this.computeds, key);
  }

  findKeyInRefs(key) {
    return Reflect.has(this.refs, key);
  }

  findKeyInReactive(key) {
    return Reflect.has(this.reactive, key);
  }

  findKeyInMethods(key) {
    return Reflect.has(this.methods, key);
  }

  findKeyInGlobalProperties(key) {
    return this.globalProperties.includes(key);
  }

  findKeyInSelfThisDefines(key) {
    return this.selfThisDefines.has(key);
  }
}
