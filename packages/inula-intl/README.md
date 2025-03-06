## Inula-intl简介

`Inula-intl`是`Inula`提供的生态组件，主要提供了国际化功能，涵盖了基本的国际化组件和钩子函数，便于用户构建具备国际化能力的前端界面。

在`Inula-intl`中，无论是组件或者Hooks，其目的就是获取当前应用程序的国际化实例，该实例提供了处理多语言文本消息、日期、时间等功能，如下面给出的示例：

```tsx
import { IntlProvider, useIntl } from 'inula-intl';

export default App = () => {
  const locale = 'en';
  const messages = {
    en: {
      greeting: 'Hello, {name}!',
      today: 'Today is {date}',
      amount: 'Amount: {value, number}',
    },
    fr: {
      greeting: 'Bonjour, {name} !',
      today: "Aujourd'hui, c'est le {date}",
      amount: 'Montant : {value, number}',
    },
  };

  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      <Component />
    </IntlProvider>
  );
};

function Component() {
  // 获取国际化对象
  const intl = useIntl();

  // 日期国际化
  const formattedDate = intl.formatDate(new Date(2023, 0, 1), { year: 'numeric', month: 'long', day: 'numeric' });

  // 数字格式化
  const formattedAmount = intl.formatNumber(12345.67);

  return (
    <div>
      <p>{intl.formatMessage({ id: 'greeting' }, { name: 'Alice' })}</p>
      <p>{intl.formatMessage({ id: 'today' }, { date: formattedDate })}</p>
      <p>{intl.formatMessage({ id: 'amount' }, { value: formattedAmount })}</p>
    </div>
  );
};
```

在这个示例中，分别创建了`<App>`组件和`<Component>`组件，`<App>`组件使用 `<IntlProvider>` 来提供国际化的上下文，`<Component>` 组件演示了如何通过使用 `useIntl` 钩子来获取国际化对象并使用相关国际化能力。如 `formatDate`、`formatNumber` 和 `formatMessage`。

```tsx
// 示例结果
Hello, Alice!
January 1, 2023
12,345.67
```

## 类

### I18n

**功能介绍**

`Inula-intl`提供了一个可加载信息的`I18n`类，开发者在使用时，通过创建出`I18n`类的实例对象，以获取国际化的相关功能。

**类定义**

```tsx
class I18n extends EventDispatcher (props: I18nProps){
  constructor(props: I18nProps);

}

interface I18nProps {
  locale?: Locale;
  locales?: Locales;
  messages?: AllMessages;
  localeConfig?: AllLocaleConfig;
  error?: Error;
}

type Messages = Record<string, string> | Record<string, CompiledMessage>; // CompiledMessage是经过编译解析后的信息类型

type AllMessages = Record<string, string> | Record<Locale, Messages>;
```

- `locale`：可选参数，本地语言，默认设置为 'en'
- `locales`：可选参数， 即可以是`string`也可以是数组类型
- `localeConfig`：可选参数，自定义语言的规则，如：复数规则、序数词规则等
- `messages`：可选参数，可加载的国际化的文本信息，可以是字符串、数组、对象等类型。
- `error`：可选参数，一个函数，用于处理资源信息无法加载的错误提示

> 说明： `I18n`类继承了`EventDispatcher`，用于监听国际化资源（如`locale`， `messages`等）变化，当资源变化时，会重新加载资源。

下面我们将通过传递不同的参数以创建i18n实例：

```tsx
// 支持空对象构造，I18n会使用默认值
new I18n({});

// 传入本地语言
new I18n({locale:'en'})

// 仅仅传入message
new I18n({locale:'en', messages: {greeting: "hello world"}})

// 支持自定义复数类型
new I18n({locale:'en',locales: '[en]', messages: {greeting: "hello world"},localeConfig: {englishPlurals})

// 如果需要缓存，可以通过创建缓存函数构建
new I18n({locale:'en',locales: '[en]', messages: {greeting: "hello world"},localeConfig: {englishPlurals}, cache: creatI18nCache())

// 支持自定义错误信息
new I18n({locale:'en',locales: '[en]', messages: {greeting: "hello world"},localeConfig: {englishPlurals}, cache: creatI18nCache(), error:"错误信息"} )
```

在上述示例创建`i18n`对象时，我们通过指定`localeConfig`参数来确定复数规则，用于处理较为复杂的信息。

> 说明：简单消息和复杂消息的区别是一个不过多涉及复杂的语境或者文化差异，另一种是需要涉及更多文化和语言背景。

```tsx
//复数规则类型定义
localeConfig: AllLocaleConfig
export type LocaleConfig = { plurals?: Function };
export type AllLocaleConfig = Record<Locale, LocaleConfig>;
```

如下示例是我们自定义了一个英语的plurals规则函数，获取到`localeConfig`：

```tsx
const englishPlurals = {
  plurals(value, ordinal) {
     if (ordinal) {
        return (
          {
            '1': 'one',
            '2': 'two',
            '3': 'few',
          }[value] || 'other'
        );
     } else {
        return value === 1 ? 'one' : 'other';
     }
  }
};
```

根据上述复数规则，我们对如下编译解析后的文本消息进行国际化：

> ```tsx
> '{value, plural, one {{value} Book} other {# Books}}'
> '{value, selectordinal, one {#st Book} two {#nd Book}}'
> ```

得到如下结果：

```tsx
// 示例结果：
当value值为1时:'1 Book', 当value值为2时:'2 Books'
当value值为1时:'1st Book',  当value值为2时:'2nd Book'
```

**示例**

```tsx
import { I18n } from 'inula-intl';

function App() {
  const messages = {
    'greeting': 'Hello, {name}!'
  };
  const i18n = new I18n({
     locale: 'fr',
     messages: messages
  });

  return (
    <div>
      <h1>
        {i18n.formatMessage('Hello',{name: 'Fred'})}
        {i18n.formatDate(new Date(2023, 0, 1),  {year: 'numeric',month: 'numeric',day: 'numeric'})}
        {i18n.numberFormat(1000,  {style: 'currency', currency: 'USD'})}
      </h1>
    </div>
  );
};
```

```tsx
// 示例结果
Hello, Fred!
January 1, 2023
$1,000.00
```

通过对`I18n`类的学习，我们知道提供了三个核心方法来实现国际化功能，下面我们将给出三个核心方法给予详细介绍以及使用Demo。

#### formatDate()

**功能介绍**

`formatDate`函数API主要用于国际化中的日期格式化，其根据传入参数解析出日期，`formatDate`底层是基于`DateTimeFormatter`类实现。

**接口定义**

```jsx
formatDate(value: string | Date, formatOptions?: Intl.DateTimeFormatOptions): string
```

`formatDate`传入两个参数：

- `value` ：其是需要日期格式化的值，有两种类型，分别为`Data` 和 `string`
- `formatOptions`：是自定义的日期格式化类型，如果不传入，默认为浏览器日期格式

> 常用的日期格式化选项包括：
> `localeMatcher`：指定日期格式的匹配方式，可以是 'lookup'（默认，从库中查找匹配）或 'best fit'（根据浏览器的语言环境选择）
> `weekday`：指定要显示的星期几信息的格式。可以是 'narrow'、'short'、'long'
> `year`、`month`、`day`：指定年、月、日的显示格式。可以是 'numeric'、'2-digit'、'narrow'、'short'、'long'
> `hour`、`minute`、`second`：指定小时、分钟、秒的显示格式。同样可以是不同的选项
> `timeZoneName`：是否显示时区名
> `hour12`：是否使用12小时制，默认为 true
>
> ```jsx
> // 示例
> const options = {year: 'numeric',month: 'numeric',day: 'numeric'}
> ```

**示例**

```tsx
import I18n from 'inula-intl';

const i18n = new I18n({
  locale: 'en',
});

const date = new Date(2023, 0, 1);

function App() {
  return (
    {i18n.formatDate(date, { year: 'numeric', month: 'numeric', day: 'numeric' })}
    {i18n.formatDate('2023-01-01')}
  );
};
```

```tsx
// 示例结果
January 1, 2023
1/1/2023
```

#### formatNumber()

**功能介绍**

`formatNumber`函数API是`inula-intl`提供的数字格式化功能接口，主要用于国际化数字，根据传入参数以及格式化类型解析出数字，及货币等格式。`formatNumber`底层是基于`NumberFormatter`类实现。

**接口定义**

```tsx
formatNumber(value: string | Date, formatOptions?: Intl.NumberFormatOptions): string
```

`formatNumber`传入两个参数：

- `value` ：其是需要数字格式化的值，类型为`number`
- `formatOptions`：是自定义的数字格式化类型，如果不传入，默认为浏览器格式

> 常用的格式化选项包括：
> `style`：指定数字的格式样式。可以是 'decimal'（默认，普通数字格式）、'currency'（货币格式）或'percent'（百分比格式
> `currency`：用于货币格式的货币代码
> `minimumFractionDigits`：最小的小数位数
> `maximumFractionDigits`：最大的小数位数
> `minimumIntegerDigits`：最小的整数位数
> `useGrouping`：是否使用千分位分隔符，默认为 true
>
> ```jsx
> // 示例
> const options = {style: 'currency', currency: 'USD'}
> ```

**示例**

```jsx
import I18n from 'inula-intl';

const i18n = new I18n({
  locale: 'en',
});

function App() {
  return (
    {i18n.formatNumber(1000, { style: 'currency', currency: 'USD' })}
    {i18n.formatNumber(12345.6789, { style: 'currency', currency: 'EUR' })}
  );
};
```

```tsx
// 示例结果
$1,000.00
€12,345.68
```

#### formatMessage()

**功能介绍**

`formatMessage` 是`inula-intl`提供的消息格式化功能接口，其主要针对较复杂的信息在运行时进行格式化。

**接口定义**

```tsx
formatMessage(id: MessageDescriptor | string, values?: Object | undefined, messageOptions?: MessageOptions): string;

interface MessageDescriptor extends MessageOptions {
  id: string;
  defaultMessage?: string | object;
  defaultValues?: Record<string, unknown>;
}
interface MessageOptions {
  comment?: string;
  message?: string;
  context?: string;
  formatOptions?: FormatOptions;
}
```

- `id`： id是唯一标识符，其可以是`MessageDescriptor`对象，也可以是`string`类型
- `value`：复杂消息中，格式化需要的变量值
- `MessageOptions`：消息格式化选项，其包含了消息的描述，格式化文本消息等信息。

**示例**

```tsx
import I18n from 'inula-intl';

const i18n = new I18n({
  locale: 'en',
  message: {
    'greeting': 'Je m'appelle {name}'
  }
});

function App() {
  return intl.formatMessage({id: 'greeting'}, { name: 'Fred' });
}
```

```tsx
// 示例结果
Je m'appelle Fred
```

### DateTimeFormatter

**功能介绍**
`DateTimeFormatter`类主要提供了时间格式化方法，开发者可以基于类直接进行格式化而不需要获取`i18n`实例。

**类定义**

```tsx
class DateTimeFormatter {
  constructor(locales: Locales, formatOptions?: Intl.DateTimeFormatOptions, cache?: I18nCache);
  dateTimeFormat(value: DatePool, formatOptions: FormatOptions): string;
}
```

`DateTimeFormatter`类实例化参数：

- `locales`：必须参数，即可以是`string`也可以是数组类型，默认为zh
- `formatOptions`：可选参数，日期格式化选项，默认采用浏览器日期格式
- `cache`：可选参数，缓存

> ```jsx
> // 示例
> const options = {year: 'numeric',month: 'numeric',day: 'numeric'}
> ```

**示例**

```jsx
import { DateTimeFormatter } form 'inula-intl'

const date = new DateTimeFormatter('en', {year: 'numeric',month: 'numeric',day: 'numeric'}, true)

date.dateTimeFormat(new Date());
```

在上述示例中，通过`DateTimeFormatter`类实例化出`data`实例，可以对传入的参数`new Date()`进行时间格式化，按照给定的时间格式` {year: 'numeric',month: 'numeric',day: 'numeric'}`。

### NumberFormatter

**功能介绍**
`NumberFormatter`类主要提供了数字格式化方法，开发者可以基于类直接进行格式化而不需要获取`i18n`实例。

**接口定义**

```tsx
class NumberFormatter {
  constructor(locales: Locales, formatOption?: Intl.NumberFormatOptions, cache?: In18nCache);
  numberFormat(value: number, formatOption?: Intl.NumberFormatOptions): string;
}
```

`NumberFormatter`类实例化参数：

- `locales`：必须参数，即可以是`string`也可以是数组类型，默认为'zh'。
- `formatOptions`：可选参数，数字格式化选项，默认采用浏览器数字格式
- `cache`：可选参数，缓存。

> ```jsx
> // 示例
> const options = {style: 'currency', currency: 'USD'}
> ```

**示例**

通过实例化`NumberFormatter`类来直接实现数字国际化，如

```jsx
import { NumberFormatter } form 'inula-intl'

const number = new NumberFormatter('en',{style: 'currency', currency: 'USD'}, true)

number.numberFormat(1000);
```

在上述示例中，通过`NumberFormatter`类实例化出`number`实例，可以对传入的参数`1000`进行时间格式化，按照给定的时间格式`{style: 'currency', currency: 'USD'}`。

## 组件式API

### IntlProvider

**功能介绍**

`<IntlProvider>`该组件用于创建国际化上下文，管理程序中的语言文本消息和本地化资源信息。通常在使用时用此组件包裹应用根组件，以便完成国际化的功能。

**接口定义**

```tsx
type I18nProviderProps = I18nContextProps & configProps

export interface I18nContextProps {
  i18n?: I18n;
}

export interface configProps {
  locale?: Locale;
  messages?: AllMessages;
  defaultLocale?: string;
  RenderOnLocaleChange?: boolean;
  children?: any;
  cache: I18nCache
}

type AllMessages = Record<string, string> | Record<Locale, Messages>;
type CompiledMessage = string | CompiledMessagePart[];
type CompiledMessagePart = string | Array<string | Array<string | (string | undefined)> | Record<string, unknown>>;
```

- `i18n`：I18n类实例
- `locale`：可选参数，本地语言，默认设置为 'zh'
- `messages`：可选参数，加载国际化的文本消息
- `defaultLocale`：默认语言，默认设置为'zh'
- `RenderOnLocaleChange`：语言渲染开关键
- `children`：子组件
- `cache`：可选参数，缓存

**示例**

```tsx
import {IntlProvider} from 'inula-intl';

const App = () => {
 const locale = 'en';
 const message = {
   'greeting': 'hello,world!'
 };
 return (
   <IntlProvider locale={locale} messages={messgae}>
     {children}
   </IntlProvider>
 );
};
```

上述示例中，`<IntlProvider>` 主要是传递国际化所需要的本地数据和配置信息给其他组件使用，因此一般使用是包裹着子组件。`<IntlProvider>{children}</IntlProvider>`。通过将`lcoale`以及`message`值传给子组件。

### RawIntlProvider

**功能介绍**

`<RawIntlProvider>` 作用与`<IntlProvider>`一样，是用于提供国际化（`i18n`）的上下文环境。与`<IntlProvider>`不同，`<RawIntlProvider>` 内部不对国际化对象进行处理，开发者必须传入`i18n`对象，因此在使用时需要结合`createIntl`来使用。

**接口定义**

```ts
interface RawIntlProviderProps {
  value: I18n;
  children?: any;
}
```

- `value`：接受一个 `I18n `对象，该对象包含了国际化的配置和翻译信息。你可以使用[createIntl](###createIntl)函数来创建`I18n`对象，也可以通过`I18n`类实例化对象。
- `children`：可选属性，表示要包裹在`<RawIntlProvider>`内部的子组件

**示例**

```tsx
import {RawIntlProvider} from 'inula-intl';

 const locale = 'en';
 const messages = {
   'greeting': 'hello,world!'
 };

 const intl = createIntl({
    locale: locale,
    messages: messages
  },
  cache
 );

function App() {
  return (
    <RawIntlProvider value={intl}>
      {children}
    </RawIntlProvider>
  );
};
```

> 说明：
> `<RawIntlProvider>` 是 `Inula-intl` 库的底层组件，一般较少直接使用。通常推荐开发者使用`Inula-intl` 提供的高级组件，如`IntlProvider`。

### FormattedMessage

**功能介绍**

`<FormattedMessage>` 组件主要用于格式化多语言信息，其可以处理日期、时间、数字格式化以及翻译字符串等任务。该组件使用 `formatMessage` API进行描述

**接口定义**

```tsx
export interface FormattedMessageProps extends MessageDescriptor {
  values?: object;
  tagName?: string;
  children?(nodes: any[]): any;
}

export interface MessageDescriptor {
  id: string;
  defaultMessage?: string;
  defaultValues?: Record<string, unknown>;
}
```

- `id`：必须参数，消息的唯一标识符，用于在消息资源文件中查找对应的翻译文本消息
- `defaultValues`：可选参数，默认值为{}
- `defaultMessage`：可选参数，默认国际化消息
- `values`：表示一个对象，包含要插入到消息中的动态值
- `tagName`：表示一个需要渲染的HTML标签名，如`div`或者`p`标签。如果不指定，则默认为`<>`
- `children`：可选参数，表示用于自定义渲染的消息内容

**示例**

```tsx
import { FormattedMessage } from 'inula-intl';

const App = () => {
  const name = 'John Doe';

  return (
    <div>
      <h1>
        <FormattedMessage
          id="greeting"
          defaultMessage="Hello, {name}!"
          values={{ name }}
        />
      </h1>
    </div>
  );
};
```

```tsx
// 示例结果
Hello, John Doe！
```

## 函数式API

### useIntl()

**功能介绍**

`useIntl` hook 主要是函数式组件使用，其提供了一种简单的方式来获取当前应用程序的`I18n`实例，便于开发者使用国际化功能。

**接口定义**

```jsx
function useIntl(): IntlType;

export type IntlType = {
    i18n: I18n;
    formatMessage: Function;
    formatNumber: Function;
    formatDate: Function;
};
```

- `intl`：表示获取到的国际化对象，其主要包含了i18n对象以及国际化的三个方法

**示例**

假设你已经通过如下的代码，传递给子组件`locale`和`message`，并在`useIntlDemo.js`函数用来实现国际化

```tsx
import {IntlProvider} from 'inula-intl';

const App = () => {
 const locale = 'en';
 const message = {
   'greeting': 'Hello,world!'
 };
 return (
   <IntlProvider locale={locale} messages={messgae}>
     {children}
   </IntlProvider>
 );
};
```

使用`useIntl` 钩子函数可以访问如下功能：

- 格式化消息: 使用`formatMessage`函数可以格式化消息字符串。你可以定义一系列消息，在不同语言环境下进行翻译，并且根据当前语言环境获取到国际化的消息。例如：

  ```jsx
  // useIntlDemo.js
  const useIntlDemo = () => {
    const intl = useIntl();
    const message = intl.formatMessage({ id: 'greeting' });
  };
  ```

示例结果：

```tsx
Hello,world!
```

- 格式化时间日期: 使用`formatDate`函数来格式化日期和时间。`formatDate`函数会根据当前语言环境和所设置的格式选项返回相应的格式化结果。例如：

  ```jsx

  ```

// useIntlDemo.js
const useIntlDemo = () => {
const intl = useIntl();
const formattedDate = intl.formatDate(new Date(2023, 0, 1), { year: 'numeric', month: 'long', day: 'numeric' });
};

```
示例结果：

```tsx
1/1/2023
```

- 格式化数字: 使用`formatNumber`函数来格式化数字。`formatNumber`函数可以根据当前语言环境和所设置的格式选项返回相应的格式化结果。例如：

  ```jsx

  ```

// useIntlDemo.js
const useIntlDemo = () => {
const intl = useIntl();
const formattedNumber = intl.formatNumber(1000, { style: 'currency', currency: 'USD' });
};

```
示例结果：

```tsx
$1,000.00
```

### createIntl()

**功能介绍**

`createIntl` 函数用于创建国际化`i18n`实例，以获取相关的国际化功能。

**接口定义**

```tsx
function createIntl(config: ConfigProps, cache?: I18nCache);

// 配置文件参数
export interface ConfigProps {
  locale?: Locale;
  messages?: AllMessages;
  defaultLocale?: string;
  RenderOnLocaleChange?: boolean;
  children?: any;
  cache?: I18nCache;
}
```

- `config`：必须参数，是获取国际化对象所传递的参数，如loccale和message
- `cache`：可选参数，缓存。通过[creatIntlCache](### "creatIntlCache")创建，用于优化应用程序性能参数

**示例**

```tsx
import { createIntl, createIntlCache, IntlProvider } from 'inula-intl';

const cache = createIntlCache();
const props = {
  locale: 'en',
  messages: {
    greeting: 'hello, world',
  },
};

const Component = (props) => {
  // 受渲染时机影响，createIntl方式需控制时序，否则慢一拍
  const intl = createIntl({ ...props }, cache);
  const msg = intl.formatMessage({ id: 'greeting' });

  return (
  <IntlProvider>
    <h2>createIntl-Demo</h2>
    <p>{msg}</p>
  </IntlProvider>
  );
};
```

### creatIntlCache()

**功能介绍**

`creatIntlCache` 接口是创建供全局使用的国际化缓存示例，其主要保证国际化的性能，是基于内存的缓存接口。

**接口定义**

```tsx
function creatI18nCache(): I18nCache;

// I18n国际化缓存接口
export interface I18nCache {
  dateTimeFormat: Record<string, Intl.DateTimeFormat>;
  numberFormat: Record<string, Intl.NumberFormat>;
  plurals: Record<string, Intl.PluralRules>;
  select: Record<string, any>;
  octothorpe: Record<string, any>;
}
```

**示例**

`creatIntlCache`一般作为 `createIntl(config, cache?)`的第二个参数使用:

```jsx
const cache = createIntlCache();
const intl = createIntl(config, cache);
```

> 当开发者使用通过`createIntl`创建国际化对象时，可以传入`createIntlCache`函数进行创建缓存来加快应用程序的效率。cache是可选参数，如果您忽略这个参数，`Inula-intl`会默认为您创建缓存，来存储国际化资源，以便优化程序性能。

### injectIntl()

**功能介绍**

`injectIntl`用于实现国际化的高阶组件(Higher-Order Component，HOC)，将国际化所需要的上下文注入到组件中的props中，使组件能够使用国际化功能，`injectintl`高阶组件主要使用于类组件。

**接口定义**

```jsx
function injectIntl(Component, options?: InjectOptions);
```

- `Component`：表示需要国际化的组件
- `options`：可选参数，表示注入选项的配置对象

```jsx
export interface InjectOptions {
  isUsingForwardRef?: boolean;
  ensureContext?: boolean;
}
```

- `isUsingForwardRef`:可选参数，用于指示被包装的组件是否使用了 `forwardRef`
- `ensureContext`: 可选参数，布尔值，用于判断是否传递了正确的国际化上下文。如果设置为 `true`，当没有提供上下文时，`injectIntl` 将在控制台上显示警告信息。默认值为 `false`

**代码示例**

使用`injectIntl`时，我们通常将一个组件用`injectIntl`包裹，被包裹的组件会通过`props`接收国际化对象`intl`。它包含了格式化消息、日期、时间等方法，还可以获取当前语言环境、格式化文本消息等信息。

```tsx
import { injectIntl } from 'inula-intl';

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { intl } = this.props;
    return (
      <div>
        {intl.formatMessage({ id: 'greeting' })}
      </div>
    );
  };
};

export default injectIntl(App);
```
