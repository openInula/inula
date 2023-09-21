/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */
import copyStaticProps from '../../src/utils/copyStaticProps';

describe('copyStaticProps', () => {
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
