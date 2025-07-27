## TODO
1.  不支持动态属性&三元表达式 <p :style="styleObject">Full name: {{ objtest.a[computedObj.a === 'xxx' ? activeColor : 'white'] }} </p>
2.  ref/reactive  要不要替换成state . 方案比较复杂. 建议还是在Adapter做proxy代理比较还是,因为是在最底层的原子属性变更,容易实现
    ```js
      const dataRef = ref({a:{c:d:{e:'xx'}}, b:2});
      ()=>{
        const aa = 'aa'
        // 场景1
         dataRef['a'].[expresionC].d.e = 'aa';
        // 场景2
         aa &&  dataRef['a'].[expresionC].d.e = 'aa';
      }

      const [data, setData] = useState({a:{c:d:{e:'xx'}}, b:2})
         // 场景1
        ()=>{
         // dataRef['a'].[expresionC].d.e = 'aa';
          data['a'].[expresionC].d.e = 'aa';
          setData(Object.assign({},dataRef ))
       }
         // 场景2
         aa &&  dataRef['a'].[expresionC].d.e = 'aa' && setData(Object.assign({},dataRef ));

    ```
3.  computed 要不要替换成useMemo.   替换比较合适 (整体操作切换的是函数+依赖,识别出里面的ref,等对象即可)
    ```js
      // 初始化响应式数据结构
        const cart = reactive({
            items: [
                { id: 1, name: 'Widget', price: 9.99, quantity: 2 },
                { id: 2, name: 'Gadget', price: 22.99, quantity: 1 },
                { id: 3, name: 'Doohickey', price: 5.49, quantity: 4 }
            ],
            taxRate: 0.07,
            discountCode: ref(null)
        });

        const discounts = {
            SAVE10: 0.1, // 10% off
            SAVE20: 0.2  // 20% off
        };

        // 计算税前总价
        const subtotal = computed(() => {
        return cart.items.reduce(
            (total, item) => total + (item.price * item.quantity),
            0
        );
        });

        // 计算税费
        const tax = computed(() => {
            return subtotal.value * cart.taxRate;
        });
        // 计算折扣额，如果有折扣代码的话
        const discountAmount = computed(() => {
        const discountRate = discounts[cart.discountCode.value];
        return discountRate ? subtotal.value * discountRate : 0;
        });

        // 计算最终总价，包括税费和折扣
        const total = computed(() => {
          return subtotal.value + tax.value - discountAmount.value;
        });

        // 模拟设置一个折扣码
        const applyDiscountCode = (code) => {
          cart.discountCode.value = code;
        };
    ```
    ```js
       const [items, setItems] = useState([
            { id: 1, name: 'Widget', price: 9.99, quantity: 2 },
            { id: 2, name: 'Gadget', price: 22.99, quantity: 1 },
            { id: 3, name: 'Doohickey', price: 5.49, quantity: 4 }
         ]);
        const [taxRate] = useState(0.07);
        const [discountCode, setDiscountCode] = useState(null);

        // 保存折扣码信息
        const discounts = {
            SAVE10: 0.1, // 10% off
            SAVE20: 0.2  // 20% off
        };

        // 计算税前总价
        const subtotal = useMemo(() => {
            return items.reduce((total, item) => total + item.price * item.quantity, 0);
        }, [items]);

        // 计算税费
        const tax = useMemo(() => subtotal * taxRate, [subtotal, taxRate]);
          // 计算折扣额
        const discountAmount = useMemo(() => {
            const discountRate = discounts[discountCode];
            return discountRate ? subtotal * discountRate : 0;
        }, [subtotal, discountCode]);

        // 计算最终总价
        const total = useMemo(() => {
            return subtotal + tax - discountAmount;
        }, [subtotal, tax, discountAmount]);

        // 应用折扣码的回调函数
        const applyDiscountCode = useCallback((code) => {
            setDiscountCode(code);
        }, []);
    ```
4.  针对vue的scope (css 样式隔离)，当前会默认在入口的元素添加一个父class name。 在遇到父节点有class的场景，需要手动修改为相邻节点的样式。如下：
    原因: react没有提供类似vue的隔离样式  .className  -->  .className[base64隔离符]
   ```js
        <template>
        <div class="greetings">
            <h1 class="green">{{ msg }}</h1>
            <h3>
            基础自定义组件测试
            <!-- <GlobalUnCompile /> -->
            <!-- <GlobalComponent /> -->
            </h3>
        </div>
        </template>

        <style scoped>
            h1 {
            font-weight: 500;
            font-size: 2.6rem;
            top: -10px;
            }

            h3 {
            font-size: 1.2rem;
            }
   ```
   生成文件
   ```js
        export default props => {
        const { msg } = props;
        return (
            <div className="greetings scope-HelloWorld">
            <h1 className="green">{msg}</h1>
            <h3>基础自定义组件测试</h3>
            </div>
        );
        };
   ```
    ```css
    .scope-HelloWorld .greetings {
      color:red
    }
    .scope-HelloWorld h1 {
    font-weight: 500;
    font-size: 2.6rem;
    top: -10px;
    }

    .scope-HelloWorld h3 {
    font-size: 1.2rem;
    }

    // 请手动修改
    .scope-HelloWorld.greetings h1,
    .scope-HelloWorld.greetings h3 {
    text-align: center;
    }

    @media (min-width: 1024px) {
    // 请手动修改
    .scope-HelloWorld.greetings h1,
    .scope-HelloWorld.greetings h3 {
        text-align: left;
    }
    }

    ```
5. 不支持compute的get、set
   ```javascript
  compute({
      // getter
      get() {
        return this.firstName + ' ' + this.lastName
      },
      // setter
      set(newValue) {
        // 注意：我们这里使用的是解构赋值语法
        [this.firstName, this.lastName] = newValue.split(' ')
      }
    })
   ```

6.  在 JSX 中，你不能直接使用带有点（.）的属性，因为它违反了 JSX 的语法规则。JSX 本质上是 JavaScript 的语法扩展，所以它必须遵循 JavaScript 的命名规则，而在 JavaScript 中，点操作符（.）用来访问对象的属性。因此，如果你尝试在 JSX 元素的属性名中使用点（.），如 <div a.d.d="value" />，这会导致语法错误，因为解析器会尝试将 a.d.d 解释为一个表达式路径，而不是简单的属性名。
  在切换工具中会将点操作修改为两个下划线 __
  ```javascript
    <input @click.stop.prevent="anotherHandler" @keyup.stop @click="handleClick" />
     // 转换成
    <input v-on:click___stop__prevent="anotherHandler"  v-on:keyup___enter="submit"  v-on:click="handleClick" />
  ```
7.  在 JSX 中，你不能直接使用带有点（.）的属性，因为它违反了 JSX 的语法规则。  所以不支持自定义属性的点操作，比如： v-addId.table
   ```jsx
       <el-table
        v-addId.table="'warning-detail'"
        v-bind:data={errData}
        class="warning-table"
        table-layout="fixed"
      >
   ```
8. 不支持sync修饰符

```jsx
<sub-compoennt :visible.sync="visible" />
```


##  列表
### 开发语言: TS
### 开发框架:  Babale
### 运行环境: NODEJS
### 发布形式: NPM
### 使用方式 : CMD 命令行
### 支持: 工程/独立文件
