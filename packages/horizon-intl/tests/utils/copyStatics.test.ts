/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */
import copyStaticProps from '../../src/utils/copyStaticProps';

describe('hoistNonReactStatics', () => {
  test('should hoist static properties from sourceComponent to targetComponent', () => {
    class SourceComponent {
      static staticProp = 'sourceProp';
    }

    class TargetComponent {}

    copyStaticProps(TargetComponent, SourceComponent);

    expect((TargetComponent as any).staticProp).toBe('sourceProp');
  });

  test('should hoist static properties from inherited components', () => {
    class SourceComponent {
      static staticProp = 'sourceProp';
    }

    class InheritedComponent extends SourceComponent {}

    class TargetComponent {}

    copyStaticProps(TargetComponent, InheritedComponent);

    expect((TargetComponent as any).staticProp).toBe('sourceProp');
  });

  test('should not hoist properties if descriptor is not valid', () => {
    class SourceComponent {
      get staticProp() {
        return 'sourceProp';
      }
    }

    class TargetComponent {}

    copyStaticProps(TargetComponent, SourceComponent);

    expect((TargetComponent as any).staticProp).toBeUndefined();
  });

  test('should not hoist properties if descriptor is not valid', () => {
    class SourceComponent {
      static get staticProp() {
        return 'sourceProp';
      }
    }

    class TargetComponent {}

    copyStaticProps(TargetComponent, SourceComponent);

    expect((TargetComponent as any).staticProp).toBe('sourceProp');
  });

  test('copyStaticProps should not copy static properties that already exist in target or source component', () => {
    const targetComponent = { staticProp: 'target' };
    const sourceComponent = { staticProp: 'source' };
    copyStaticProps(targetComponent, sourceComponent);
    expect(targetComponent.staticProp).toBe('source'); // The value should remain the same
  });
});
