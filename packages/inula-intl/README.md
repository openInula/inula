# Inula-Intl

`Inula-intl`是`inula`提供的生态组件，主要提供了国际化功能，涵盖了基本的国际化组件和钩子函数，便于用户构建具备国际化能力的前端界面。

在`Inula-intl`中使用国际化时，无论是组件或者Hooks，其目的就是获取当前应用程序的国际化实例，该实例提供了处理多语言文本、日期、时间等功能。

```tsx
import { IntlProvider, useIntl } from 'inula-intl';

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

function App({ locale }) {
  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      <Component />
    </IntlProvider>
  );
};

function Component() {
  // 创建缓存
  const cache = createIntlCache();

  // 获取国际化对象
  const intl = createIntl({ locale, messages }, cache);

  // 日期国际化
  const formattedDate = intl.formatDate(new Date(), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 数字格式化
  const formattedAmount = intl.formatNumber(12345.67);

  const greeting = intl.formatMessage({ id: 'greeting' }, { name: 'Alice' });

  return (
    <div>
      <p>{greeting}</p>
      <p>{intl.formatMessage({ id: 'today' }, { date: formattedDate })}</p>
      <p>{intl.formatMessage({ id: 'amount' }, { value: formattedAmount })}</p>
    </div>
  );
};
```

在这个示例中，创建了一个名为`<App>`的组件，该组件使用 `<IntlProvider>` 来提供国际化的上下文。然后，在 `<Component>`组件中使用 `useIntl` 钩子来获取国际化的功能。`useIntl` 钩子的返回对象中包含了国际化方法，如 `formatDate`、`formatNumber` 和 `formatMessage`。`<Component>` 组件演示了如何使用这些方法来格式化日期、数字和翻译文本消息

## 类

### I18n类

**功能介绍**

如果脱离了`<RawIntlProvider>`或者`<IntlProvider>`，`inula-intl`提供了一个可加载的信息类`I18n`，这要求您必须加载所需的配置信息，创建出`i18n`对象，用于完成国际化的相关功能。

**类定义**

I18n类继承了EventDispatcher，用于监听国际化资源变化，当`loacle`或者`messages`变化时，会重新加载资源。

```tsx
class I18n extends EventDispatcher (i18nProps: I18nProps){
  constructor(props: I18nProps);
}

interface I18nProps {
  locale?: Locale;
  locales?: Locales;
  messages?: AllMessages;
  localeConfig?: AllLocaleConfig;
  useMemorize?: boolean;
  error?: Error;
}
```

- `locale`：表示本地语言
- `locales`：表示可加载多个语言，如：['en','zh']
- `localeConfig`：用于加载本地语言的规则，如：复数规则
- `messages`：用于加载`message`信息
- `error`: 可选参数，用于处理资源信息无法加载的错误提示
- `useMemorize`：可选参数，用于记忆存储开关键

**示例**

以动态加载方式创建国际化对象，以使用国际化功能。

```tsx
import {I18n} from 'inula-intl';

function App() => {
  const messages = {
    'greeting': 'Hello, {name}',

  };
  const i18n = new I18n({
     locale: 'fr',
        messages: messages,
  });

  return (
    <div>
      <h1>
        {i18n.formatMessage('Hello',{name: 'Fred'})}
        {i18n.formatDate(new Date(),  {year: 'numeric',month: 'numeric',day: 'numeric'})}
        {i18n.numberFormat(1000,  {style: 'currency', currency: 'USD'})}
      </h1>
    </div>
  );
};
```

上述示例展示了，若脱离组件，直接通过实例化一个`I18n`类来实现国际化。

> 注意，使用者须构造传参，以确保`I18n`类正确实例化。

### DateTimeFormatter类

**功能介绍**
DateTimeFormatter 类主要提供了时间格式化方法，开发者可以基于类直接进行格式化而不需要获取`i18n`实例。

**类定义**

```tsx
class DateTimeFormatter {
  constructor(locales: any, formatOptions?: Intl.DateTimeFormatOptions, useMemorize?: boolean);
  dateTimeFormat(value: DatePool, formatOptions: FormatOptions): string;
}
```

`DateTimeFormatter`类实例化参数：

- `locales`：必须参数 国际化语言
- `formatOptions`：可选参数，日期格式化选项，默认采用浏览器日期格式
- `useMemorize`：可选参数，记忆存储开关键，默认开启存储功能。

`dateTimeFormat`传入两个参数：

- `value` ：其是需要格式化的数据，有两种类型，分别为`Data` 和 `string`。
- `formatOptions`：是自定义的格式化类型，如果不传入，默认为浏览器格式。

> 常用的日期格式化选项包括：
> localeMatcher：指定日期格式的匹配方式，可以是 'lookup'（默认，从库中查找匹配）或 'best fit'（根据浏览器的语言环境选择）。
> weekday：指定要显示的星期几信息的格式。可以是 'narrow'、'short'、'long'。
> year、month、day：指定年、月、日的显示格式。可以是 'numeric'、'2-digit'、'narrow'、'short'、'long'。
> hour、minute、second：指定小时、分钟、秒的显示格式。同样可以是不同的选项。
> timeZoneName：是否显示时区名。
> hour12：是否使用12小时制，默认为 true。
>
> ```jsx
> // 示例
> const options = {year: 'numeric',month: 'numeric',day: 'numeric'}
> ```

**示例**

```jsx
import DateTimeFormatter form 'inula-intl'

const date = new DateTimeFormatter('en', {year: 'numeric',month: 'numeric',day: 'numeric'}, true)

date.dateTimeFormat(new Date());
```

在上述示例中，通过`DateTimeFormatter`类实例化出`data`实例，可以对传入的参数`new Date()`进行时间格式化，按照给定的时间格式` {year: 'numeric',month: 'numeric',day: 'numeric'}`。

### NumberFormatter类

**功能介绍**
`NumberFormatter`类主要提供了数字格式化方法，开发者可以基于类直接进行格式化而不需要获取`i18n`实例。

**接口定义**

```tsx
class NumberFormatter {
  constructor(locales: Locales, formatOption?: Intl.NumberFormatOptions, useMemorize?: boolean);
  numberFormat(value: number, formatOption?: Intl.NumberFormatOptions): string;
}
```

`NumberFormatter`类实例化参数：

- `locales`：必须参数 国际化语言
- `formatOptions`：可选参数，数字格式化选项，默认采用浏览器数字格式
- `useMemorize`：可选参数，记忆存储开关键，默认开启存储功能。

`numberFormat`传入两个参数：

- `value` ：其是需要格式化的值，类型为`number`
- `formatOptions`：是自定义的格式化类型，如果不传入，默认为浏览器格式

> 常用的格式化选项包括：
> style：指定数字的格式样式。可以是 'decimal'（默认，普通数字格式）、'currency'（货币格式）或 'percent'（百分比格式）。
> currency：用于货币格式的货币代码。
> minimumFractionDigits：最小的小数位数。
> maximumFractionDigits：最大的小数位数。
> minimumIntegerDigits：最小的整数位数。
> useGrouping：是否使用千分位分隔符，默认为 true。
>
> ```jsx
> // 示例
> const options = {style: 'currency', currency: 'USD'}
> ```

**示例**

通过实例化`NumberFormatter`类来直接实现数字国际化，如

```jsx
import NumberFormatter form 'inula-intl'

const number = new NumberFormatter('en',{style: 'currency', currency: 'USD'}, true)

number.numberFormat(1000);
```

在上述示例中，通过`NumberFormatter`类实例化出`number`实例，可以对传入的参数`1000`进行时间格式化，按照给定的时间格式`{style: 'currency', currency: 'USD'}`。

## 组件式API

### IntlProvider

**功能介绍**

用于为应用程序提供国际化的格式化功能，管理程序中的语言文本信息和本地化资源信息。

**接口定义**

该组件用于创建国际化上下文，通常在使用时用此组件包裹应用根组件，以便完成国际化的功能。

`IntlProvider`是函数式组件，如下是该组件可设置的属性内容：

```tsx
interface I18nProviderProps {
  i18n?: I18n;
  locale?: Locale;
  messages?: AllMessages;
  defaultLocale?: string;
  RenderOnLocaleChange?: boolean;
  children?: any;
  uesMemorize?: boolean;
}

type AllMessages = Record<string, string> | Record<Locale, Messages>;
type CompiledMessage = string | CompiledMessagePart[];
type CompiledMessagePart = string | Array<string | Array<string | (string | undefined)> | Record<string, unknown>>;
```

- `i18n`：实现国际化的统一接口类，在`IntlProvider`中可以传入i18n对象；
- `locale`：本地语言
- `messages`：国际化消息文本
- `defaultLocale`：默认语言
- `RenderOnLocaleChange`：语言渲染开关键
- `children`：子组件
- `uesMemorize`：记忆存储开关键

**示例**

通过ES6语法`import`，可导入`<IntlProvider>`组件

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

`<RawIntlProvider>` 区别于`<IntlProvider>` 是未经封装`i18n`对象，,可以说`<RawIntlProvider>`是`<IntlProvider>`的底层实现，其是由`inula.createContext`生成，使用时需要结合钩子函数`createIntl`来使用。

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

上述代码首先用于`createIntl()`创建了一个名为intl的变量，其次使用 `<RawIntlProvider> `组件中使用 intl 变量作为 value 属性的值。`<RawIntlProvider>` 是 inula-intl 库提供的一个上下文组件，它将 intl 对象提供给其子组件，以便在整个组件树中可以访问到国际化相关的函数和数据。

### FormattedMessage

**功能介绍**

`<FormattedMessage>` 组件主要用于格式化多语言信息，其可以处理日期、时间、数字格式化以及翻译字符串等任务。`<FormattedMessage>`组件的作用是将消息字符串从源语言翻译成目标语言，并根据需要进行格式化。该组件通常与`<IntlProvider>`组件一起使用，后者负责提供翻译功能和本地化信息。

**接口定义**

```tsx
interface FormattedMessageProps {
  id: string;
  defaultMessage?: string | object;
  defaultValues?: Record<string, unknown>;
  values?: object;
  tagName?: string;
  children?(nodes: any[]): any;
  comment?: string;
  message?: string;
  context?: string;
  formatOptions?: FormatOptions;
  useMemorize?: boolean;
}
```

- `id`：必须参数，消息的唯一标识符，用于在消息资源文件中查找对应的翻译文本。;
- `defaultValues`：可选参数，默认value值{}。
- `defaultMessage`：可选参数，当找不到对应的翻译文本时，使用默认消息作为备选。
- `values`：表示一个对象，包含要插入到消息中的动态值。
- `tagName`：表示一个需要渲染的HTML标签名，如`div`或者`p`标签。如果不指定，则默认为`<>`。
- `children`：可选参数，表示用于自定义渲染的消息内容
- `comment`：可选参数，表示对消息选项的注释或说明。
- `message`：可选参数，表示消息的内容。
- `context`：可选参数，表示消息的上下文或背景信息。
- `formatOptions`：可选参数，用来指定消息的格式选项，例如日期格式、货币符号等。
- `useMemorize`：可选参数，表示是否使用记忆功能，即是否将消息缓存起来以供后续使用。

```tsx
interface FormatOptions {
  dateTimeFormat?: Intl.DateTimeFormatOptions;
  numberFormat?: Intl.NumberFormatOptions;
  plurals?: Intl.PluralRulesOptions;
}
```

- `dateTimeFormat`：可选参数，它是一个可传递给`Intl.DateTimeFormat`构造函数的对象，用于指定日期和时间格式化的选项。可以使用这些选项来定义日期的显示格式、时区等。
- `numberFormat`：可选参数，它是一个可传递给`Intl.NumberFormat`构造函数的对象，用于指定数字格式化的选项。可以使用这些选项来定义数字的显示格式、小数位数、货币符号等。
- `plurals`：可选参数，它是一个可传递给`Intl.PluralRules`构造函数的对象，用于指定复数形式的选项。可以使用这些选项来根据不同的语言规则确定单数、复数等形式。

> ```tsx
> const pluralRulesOptions = {
> localeMatcher: 'best fit', // 匹配方式，可以是 'lookup' 或 'best fit'
> type: 'cardinal', // 复数类型，可以是 'cardinal'（默认）或 'ordinal'
> }
> ```
>
> - `localeMatcher`：表示匹配方式，有两个选项：'lookup'：从提供的 locale 列表中精确匹配合适的规则。'best fit'：根据浏览器环境或提供的 locale 选择最佳匹配规则。
> - `type`：表示复数类型，有两个选项：'cardinal'：用于基数（一、两、三等）复数形 式。'ordinal'：用于序数（第一、第二、第三等）复数形式。

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

在上面的示例中，使用了`<FormattedMessage>`组件来显示一个国际化的问候语。为了使FormattedMessage正常工作，你需要在应用程序中正确配置并加载翻译文件，以便根据当前的语言环境提供正确的翻译文本。

## 函数式API

### useIntl()

**功能介绍**

`useIntl` hook 主要是函数式组件使用，其提供了一种简单的方式来获取当前应用程序的国际化相关信息。

**接口定义**

```jsx
const intl = useIntl();
```

- `intl`：表示国际的相关信息。

**示例**

使用`useIntl` hook，可以主要访问以下功能

- 格式化消息（Format Messages）: 使用`formatMessage`函数可以格式化消息字符串。你可以定义一系列消息，在不同语言环境下进行翻译，并且根据当前语言环境选择正确的翻译版本。例如：

```jsx
const intl = useIntl();
const message = intl.formatMessage({ id: 'greeting' });
```

- 格式化日期和时间（Format Dates and Times）: 你可以使用formatDate和formatTime函数来格式化日期和时间。这些函数会根据当前语言环境和所设置的格式选项返回相应的格式化结果。例如：

```jsx
const intl = useIntl();
const formattedDate = intl.formatDate(new Date(), { year: 'numeric', month: 'long', day: 'numeric' });
```

- 格式化数字（Format Numbers）: 你可以使用formatNumber函数来格式化数字。这个函数可以根据当前语言环境和所设置的格式选项返回相应的格式化结果。例如：

```jsx
const intl = useIntl();
const formattedNumber = intl.formatNumber(1000, { style: 'currency', currency: 'USD' });
```

### createIntl()

**功能介绍**

createI18n hook函数，用于创建国际化i8n实例，以进行相关的国际化功能。

**接口定义**

```tsx
const intl =  createI18n(config: I18nProviderProps, cache?: I18nCache);

interface I18nProviderProps {
  i18n?: I18n;
  locale?: Locale;
  messages?: AllMessages;
  defaultLocale?: string;
  RenderOnLocaleChange?: boolean;
  children?: any;
  uesMemorize?: boolean;
}
```

`createIntl`接受两个参数：

- `config`：，其类型为I18nProviderProps，
- `cache`： 自定义缓存。其返回一个国际对象的缓存对象，如果不传入，则默认为true，这是为了优化性能，其主要通过[creatIntlCache](### "creatIntlCache")创建。

**示例**

```tsx
import {createIntl, createIntlCache, RawIntlProvider} from 'inula-intl'

const cache = createIntlCache()
const props = {
   locale: 'en',
  messages: {
     greeting : "hello, world",
  }
}

const Component = (props) => {
  // 受渲染时机影响，createIntl方式需控制时序，否则慢一拍
  const intl = createIntl({ ...props }, cache);
  const msg = intl.formatMessage({ id: 'greeting' });

  return (
  <IntlProvider>
    <div className="card">
      <h2>createIntl-Demo</h2>
      <pre>{msg}</pre>
    </div>
  </IntlProvider>
  );
};
```

上述示例展示了如何使用`createIntl`来创建一个国际化对象，并且以这个对象来进行国际化功能操作，即调用`intl.formatMessage`。

### creatIntlCache()

**功能介绍**

`creatIntlCache` 接口是创建供全局使用的国际化缓存示例，其主要保证国际化的性能，是基于内存的缓存接口。

**接口定义**

```tsx
cosnt cache = creatI18nCache(): I18nCache;

// I18n国际化缓存接口
interface I18nCache {
  dateTimeFormat: Record<string, Intl.DateTimeFormat>;
  numberFormat: Record<string, Intl.NumberFormat>;
  plurals: Record<string, Intl.PluralRules>;
  messages: Record<string, IntlMessageFormat>;
  select: Record<string, object>;
  octothorpe: Record<string, any>;
}
```

- `cache` ： 表示国际化的存储。

**示例**

`creatIntlCache`一般作为 `createIntl(config, cache?)`的第二个参数使用

```jsx
const cache = createIntlCache();
const intl = createIntl(config, cache);
```

在通过createIntl初始化国际化对象时，如需要缓存，则可以通过createIntlCache进行传入，当然，如果不传入也可以，inula-intl会默认为您开启存储模式，来存储你的国际化资源，以便优化程序性能。

### formatDate()

**功能介绍**

`formatDate`函数API主要用于国际化中的日期格式化，其可以根据传入参数解析出日期，formatDate底层是基于DateTimeFormatter实现。

**接口定义**

```jsx
formatDate(value: string | Date, formatOptions?: Intl.DateTimeFormatOptions): string
```

- value：需要格式化的日期，可以是字符串也可以日期。
- formatOptions：

**示例**

使用国际化对象intl实现

```tsx
import {useIntl}  form 'inula-intl'

const {intl} = useIntl();

function App() => {
  return(
      <IntlProvider>
         {intl.formatDate(new Date(),  {year: 'numeric',month: 'numeric',day: 'numeric'})}
      </IntlProvider>;
  );
};
```

> 如果在实例化`DateTimeFormatter`对象和调用内部函数`dateTimeFormat`时同时传入`formatOptions`参数，则函数传入的`formatOptions`参数的优先级高，提供灵活性和定制化选项。

### formatNumber()

**功能介绍**

`formatNumber`函数API是`inula-intl`提供的数字格式化功能接口，主要用于国际化中的数字格式化，其可以根据传入参数解析出数字，及货币等格式。

**接口定义**

```tsx
formatNumber(value: number, formatOption?: Intl.NumberFormatOptions): string;
```

**示例**

使用国际化对象intl实现

```jsx
import {useIntl}  form 'inula-intl'

const {intl} = useIntl();

function App() => {
  return(
     <IntlProvider>
        {intl.numberFormat(1000,  {style: 'currency', currency: 'USD'})}
     </IntlProvider>;
  );
};
```

> 如果在实例化`NumberFormatter`对象和调用内部函数`dateTimeFormat`时同时传入`formatOptions`参数，则函数传入的`formatOptions`参数的优先级高，提供灵活性和定制化选项。

### formatMessage()

**功能介绍**

`formatMessage` 是`inula-intl`提供的消息格式化功能接口，其主要针对较复杂的信息在运行时进行格式化。

> 简单消息和复杂消息的区别是一个不过多涉及复杂的语境或者文化差异，另一种是需要涉及更多文化和语言背景。具体在其余参考中可详细了解。

**接口定义**

```tsx
formatMessage(id: MessageDescriptor | string, values?: Object | undefined, { message, context, formatOptions, useMemorize }?: MessageOptions): string;

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
  useMemorize?: boolean;
}

interface FormatOptions {
  dateTimeFormat?: Intl.DateTimeFormatOptions;
  numberFormat?: Intl.NumberFormatOptions;
  plurals?: Intl.PluralRulesOptions;
}
```

- `formatMessage`接口传递了三个参数：
  - `id`： id是唯一标识符，其可以是`MessageDescriptor`对象，也可以是string类型
  - `value`：复杂消息中，格式化需要的变量值
  - `MessageOptions`：消息格式化选项，其包含了消息的描述，默认消息，默认值，记忆存储开关键等信息。

**示例**

`formatMessage`是一个类内部函数，其可以通过实例国际化对象来使用

```jsx
const messages = { id: "Je m'appelle {name}"};

intl.formatMessage("id", { name: 'Fred' });
```

**参考**

复杂消息和简单消息的示例

简单消息不需要过多的文化差异以及复杂的语境

```jsx
Hey {name}!
```

复杂消息状态下，根据复杂语言环境以及文化，如plural复数规则均有所不同。下述代码示例为英语时，其复数规则`value === 1 ? 'one' : 'other';`

```jsx
// 复杂消息
{value, plural, one {{value} Book} other {# Books}};
{value, selectordinal, one {#st Book} two {#nd Book}};
```

### injectIntl()

**功能介绍**

`injectIntl`用于实现国际化的高阶组件(Higher-Order Component，HOC)，将国际化功能注入到组件中，使组件能够使用国际化功能，injectintl高阶组件主要使用于类组件，用于将intl对象注入到类组件的props中

当使用`injectIntl`将一个组件包装起来时，被包装的组件会通过`props`接收一个提供了国际化相关函数的对象intl,。它包含了格式化消息、日期、时间等的方法，还可以获取当前语言环境、可用的语言列表等信息。

**接口定义**

```jsx
const WrappedComponent = injectIntl(Component, options);
```

- `Component`：表示需要国际化的组件
- `options`：可选参数，表示国际化的选项。

**代码示例**

```tsx
import {injectIntl} from 'inula-intl';

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { intl } = this.props as any;
    return (
      <div className="card">
        <h2>injectIntl-Demo</h2>
        <pre>{intl.formatMessage({ id: 'greeting' })}</pre>
      </div>
    );
  };
};

export default injectIntl(App);
```

上述示例采用`injectIntl`高阶组件将国际对象注入，从注入props中获取到国际化对象，并用获取的国际化对象`intl`格式化一个消息。
