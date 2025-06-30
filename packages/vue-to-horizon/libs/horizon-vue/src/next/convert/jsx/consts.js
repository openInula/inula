export const EVENT_PARAM_NAME = '$event';
export const JSX_EXPRESSION_CONTAINER = 'JSXExpressionContainer';
export const INSTANCE = 'instance';
export const USE_INSTANCE = 'useInstance';
export const TO_INSTANCE = 'toInstance';
export const DATA_REACTIVE = 'dataReactive';
export const DIRECTIVE_COMPONENT = 'DirectiveComponent';
export const SEMI_CONTROLLED_INPUT = 'SemiControlledInput';

export const DEFAULT_COMPONENT_TAG = {
  teleport: {
    targetTag: 'Teleport',
    source: 'adapters/vueAdapter'
  },
  input: {
    targetTag: 'input',
    attributesMap: {
      readonly: 'readOnly'
    }
  },
  label: {
    targetTag: 'label',
    attributesMap: {
      for: 'htmlFor'
    }
  }
}
