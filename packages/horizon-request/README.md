# Horizon-Request

### 1 horizon-request请求方法

方便起见，该文档将使用`hr`别名介绍`horizon-request`请求方法，即使用如下方式导入请求组件：

```typescript
import hr from 'horizon-request';
```

#### 1.1 hr(config)

该请求方法为通用请求方法，可以通过配置config参数完成多种形式的网络请求，关于config具体参数配置将在参数配置章节详细介绍。

##### 1.1.1 接口定义

```typescript
hr<T = unknown>(config: HrRequestConfig): Promise<HrResponse<T>>;
```

其中请求配置参数类型`HrRequestConfig`和请求响应类型`HrResponse`定义如下：

```typescript
// 请求配置
interface HrRequestConfig {
  url?: string;

  method?: Method;

  // 公共URL前缀
  baseURL?: string;

  // 请求数据转换器
  transformRequest?: HrTransformer | HrTransformer[];

  // 响应数据转换器
  transformResponse?: HrTransformer | HrTransformer[];

  headers?: Record<string, any>;

  params?: Record<string, any> | null;

  // 请求参数序列化函数
  paramsSerializer?: (params: any) => string;

  data?: any;

  timeout?: number;

  // 超时错误消息
  timeoutErrorMessage?: string;

  // 是否发送凭据
  withCredentials?: boolean;

  // 响应类型
  responseType?: ResponseType;

  // 上传进度事件回调
  onUploadProgress?: (progressEvent: any) => void;

  // 下载进度事件回调
  onDownloadProgress?: (progressEvent: any) => void;

  // 状态码校验函数
  validateStatus?: (status: number) => boolean;

  // 请求取消令牌
  cancelToken?: CancelToken;

  signal?: AbortSignal;

  // 过渡选项
  transitional?: TransitionalOptions;
}

// 请求响应
type HrResponse<T = unknown> = {
  // 响应数据
  data: T;

  // 响应状态码
  status: number;

  // 响应状态消息
  statusText: string;

  // 响应头
  headers: any;

  // 请求配置
  config: HrRequestConfig;

  // 请求对象
  request?: any;

  // 响应事件消息
  event?: string;
};
```

##### 1.1.2 代码示例

```typescript
hr({
  url: 'https://www.example.com/data',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  data: {
    name: 'horizon-request'
  },
  timeout: 5000
})
  .then(response => {
    // 处理成功响应
  })
  .catch(error => {
    // 处理错误
  });
```

使用`hr(config)`方法可以灵活地定制请求的各个参数，以满足特定的需求，同时注意正确处理成功响应和错误情况。

#### 1.2 hr(url[, config])

该接口提供一种简化的请求方式，您可以将网络请求的`url`作为请求方法的第一个参数，省略其他复杂的配置，`horizon-request`请求组件将为您发送一个默认的`get`请求，在多数简单`get`请求场景中，您可以使用这种方式来简化您的代码。

##### 1.2.1 接口定义

```typescript
hr<T = unknown>(url: string[, config: HrRequestConfig]): Promise<HrResponse<T>>;
```

##### 1.2.2 代码示例

```typescript
hr('https://www.example.com/data', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
})
  .then(response => {
    // 处理成功响应
  })
  .catch(error => {
    // 处理错误
  });

// 简化写法
hr('https://www.example.com/data')
  .then(response => {
    // 处理成功响应
  })
  .catch(error => {
    // 处理错误
  });
```

#### 1.3 hr.request(config) & hr.request(url[, config])

该接口为`hr(config) & hr(url[, config])`的完整表达方式，`hr(config) & hr(url[, config])`是网络请求的语法糖，其功能完全等同，接口定义和代码使用用法参见1.1和1.2章节。

#### 1.4 hr.get(url[, config])

该接口将发送`GET`网络请求并返回一个`Promise`对象。

##### 1.4.1 接口定义

```typescript
hr.get<T = unknown>(url: string, config?: HrRequestConfig): Promise<HrResponse<T>>;
```

##### 1.4.2 代码示例

```typescript
// 使用默认配置发送GET请求
hr.get('https://www.example.com/data')
  .then(response => {
    // 请求成功，处理响应数据
  })
  .catch(error => {
    // 请求失败，处理错误
  });

// 使用自定义配置发送GET请求
hr.get('https://www.example.com/data', {
  params: {
    id: 123,
    sortBy: 'name'
  },
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Authorization': 'your-token'
  }
})
  .then(response => {
    // 处理响应数据
  })
  .catch(error => {
    // 处理错误
  });
```

上述示例中，通过`hr.get`方法发送一个GET请求到`https://www.example.com/data`。在请求成功后，通过`response.data`访问服务器返回的数据。如果请求失败，将会捕获到`catch`块中的错误并进行处理。 同时，您也可以传入响应头等进行自定义配置请求。

#### 1.5 hr.post(url[, data[, config]])

该接口将发送`POST`网络请求并返回一个`Promise`对象。

##### 1.5.1 接口定义

```typescript
hr.post<T = unknown>(url: string, data?: any, config?: HrRequestConfig): Promise<HrResponse<T>>;
```

##### 1.5.2 代码示例

```typescript
// 使用默认配置发送POST请求
hr.post('https://www.example.com/data', {
  name: 'Xiao Ming',
  age: 18
})
  .then(response => {
    // 请求成功，处理响应数据
  })
  .catch(error => {
    // 请求失败，处理错误
  });

// 使用自定义配置发送POST请求
hr.post('https://www.example.com/data', {
  name: 'Xiao Ming',
  age: 18
}, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'your-token'
  }
})
  .then(response => {
    // 处理响应数据
  })
  .catch(error => {
    // 处理错误
  });
```

上述示例中，通过`hr.post`方法发送一个POST请求到`https://www.example.com/data`，并传递了一个包含`name`和`age`字段的数据对象。在请求成功后，通过`response.data`访问服务器返回的数据。如果请求失败，将会捕获到`catch`块中的错误并进行处理。 同时，您也可以传入响应头等进行自定义配置请求。

#### 1.6 hr.delete(url[, config])

该接口将发送`DELETE`网络请求删除`url`上的资源，并返回一个`Promise`对象。

##### 1.6.1 接口定义

```typescript
hr.delete<T = unknown>(url: string, config?: HrRequestConfig): Promise<HrResponse<T>>;
```

##### 1.6.2 代码示例

```typescript
// 使用默认配置发送DELETE请求
hr.delete('https://www.example.com/data/123')
  .then(response => {
    // 删除成功
  })
  .catch(error => {
    // 删除失败
  });

// 使用自定义配置发送DELETE请求
hr.delete('https://api.example.com/data/123', {
  params: {
    force: true
  },
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Authorization': 'your-token'
  }
})
  .then(response => {
    // 删除成功
  })
  .catch(error => {
    // 删除失败
  });
```

上述示例中，我们通过`hr.delete`方法发送一个DELETE请求删除`https://www.example.com/data/123`上的资源。在请求成功后，服务器成功删除`url`上的资源。如果请求失败，将会捕获到`catch`块中的错误并进行处理。 同时，您也可以传入响应头等进行自定义配置请求。

#### 1.7 hr.head(url[, config])

该接口将发送`HEAD`网络请求并返回一个`Promise`对象。HEAD请求方法与GET方法类似，但是服务器不会返回实际内容。它仅返回响应头，包括状态码、响应日期、服务器信息以及其他元数据 。

##### 1.7.1 接口定义

```typescript
hr.head<T = unknown>(url: string, config?: HrRequestConfig): Promise<HrResponse<T>>;
```

##### 1.7.2 代码示例

```typescript
// 使用默认配置发送HEAD请求
hr.head('https://api.example.com/data')
  .then(response => {
    // 请求成功，处理响应头等信息
  })
  .catch(error => {
    // 请求失败，处理错误
  });

// 使用自定义配置发送HEAD请求
hr.head('https://api.example.com/data', {
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Authorization': 'your-token'
  }
})
  .then(response => {
    // 处理响应头等信息
  })
  .catch(error => {
    // 请求失败，处理错误
  });
```

上述示例中，我们通过`hr.head`方法发送一个HEAD请求到`https://api.example.com/data`。在请求成功后，可以通过`response.headers`访问服务器返回的头信息等。如果请求失败，将会捕获到`catch`块中的错误并进行处理。  同时，您也可以传入响应头等进行自定义配置请求。

#### 1.8 hr.options(url[, config])

该接口将发送`OPTIONS`网络请求目标资源所支持的请求方法、请求头等信息 ，并返回一个`Promise`对象。

##### 1.8.1 接口定义

```typescript
hr.options<T = unknown>(url: string, config?: HrRequestConfig): Promise<HrResponse<T>>;
```

##### 1.8.2 代码示例

```typescript
// 使用默认配置发送OPTIONS请求
hr.options('https://www.example.com/data')
  .then(response => {
    // 请求成功，处理响应
  })
  .catch(error => {
    // 请求失败，处理错误
  });

// 使用自定义配置发送OPTIONS请求
hr.options('https://api.example.com/data', {
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Authorization': 'your-token'
  }
})
  .then(response => {
    // 请求成功，处理响应
  })
  .catch(error => {
    // 请求失败，处理错误
  });
```

上述示例中，通过`hr.options`方法发送一个OPTIONS请求到`https://api.example.com/data`。在请求成功后，我们获取访问服务器支持的请求方法、请求头等信息。如果请求失败，将会捕获到`catch`块中的错误并进行处理。  同时，您也可以传入响应头等进行自定义配置请求。

#### 1.9 hr.put(url[, data[, config]])

该接口将发送`PUT`网络请求更新或替换现有资源 ，并返回一个`Promise`对象。

##### 1.9.1 接口定义

```typescript
hr.put<T = unknown>(url: string, data?: any, config?: HrRequestConfig): Promise<HrResponse<T>>;
```

##### 1.9.2 代码示例

```typescript
// 使用默认配置发送PUT请求
hr.put('https://api.example.com/data/123', {
  name: 'Xiao Ming',
  age: 18
})
  .then(response => {
    // 请求成功，处理响应
  })
  .catch(error => {
    // 请求失败，处理错误
  });

// 使用自定义配置发送PUT请求
hr.put('https://api.example.com/data/123', {
  name: 'Xiao Ming',
  age: 18
}, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'your-token'
  }
})
  .then(response => {
    // 请求成功，处理响应
  })
  .catch(error => {
    // 请求失败，处理错误
  });
```

上述示例中，通过`hr.put`方法发送一个PUT请求到`https://api.example.com/data/123`，并传递了一个包含`name`和`age`字段的数据对象去更新服务端数据。在请求成功后，说明成功更新了服务端数据。如果请求失败，将会捕获到`catch`块中的错误并进行处理。   同时，您也可以传入响应头等进行自定义配置请求。

#### 1.10 hr.patch(url[, data[, config]])

该接口将发送`PATCH`网络请求更新服务器上现有资源 ，并返回一个`Promise`对象。与 PUT 请求不同，PATCH 请求是对已存在的资源进行部分更新。它允许客户端发送仅包含要更新的资源的部分数据，而不需要发送整个资源的副本。

##### 1.10.1 接口定义

```typescript
hr.patch<T = unknown>(url: string, data?: any, config?: HrRequestConfig): Promise<HrResponse<T>>;
```

##### 1.10.2 代码示例

```typescript
// 使用默认配置发送PATCH请求
hr.patch('https://api.example.com/data/123', {
  name: 'Xiao Ming',
  age: 18
})
  .then(response => {
    // 请求成功，处理响应数据
  })
  .catch(error => {
    // 请求失败，处理错误
  });

// 使用自定义配置发送PATCH请求
hr.patch('https://api.example.com/data/123', {
  name: 'Xiao Ming',
  age: 18
}, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'your-token'
  }
})
  .then(response => {
    // 请求成功，处理响应数据
  })
  .catch(error => {
    // 请求失败，处理错误
  });
```

上述示例中，我们通过`hr.patch`方法发送一个PATCH请求到`https://api.example.com/data/123`，并传递了一个包含`name`和`age`字段的数据对象。在请求成功后，说明服务端成功更新了所传入的字段值。如果请求失败，将会捕获到`catch`块中的错误并进行处理。 同时，您也可以传入响应头等进行自定义配置请求。

#### 1.11 hr.all(iterable)

该接口是`horizon-request`请求组件中的一个静态方法，用于同时发送多个并发请求。它接受一个可迭代对象`iterable`作为参数，该可迭代对象包含多个`hr`请求实例，方法返回一个Promise对象 。

##### 1.11.1 接口定义

```typescript
hr.all<T>(promises: Array<Promise<T>>): Promise<Array<T>>;
```

##### 1.11.2 代码示例

```typescript
// 创建多个 hr 请求实例
const request1 = hr.get('https://www.example.com/data1');
const request2 = hr.get('https://www.example.com/data2');
const request3 = hr.get('https://www.example.com/data3');

// 发送并发请求
hr.all([request1, request2, request3])
  .then(responseArray => {
    // 请求成功，处理每个请求的响应数据
    responseArray.forEach(response => {
      console.log(response.data);
    });
  })
  .catch(error => {
    // 请求失败，处理错误
  });
```

上述示例中，通过`hr.get`方法创建了三个`hr`请求实例，并将它们放入一个数组中。然后，将这个数组作为参数传递给`hr.all`方法，以同时发送这三个请求。在所有请求成功完成后，通过`responseArray`参数获取每个请求的响应数据，并进行处理。

#### 1.12 hr.spread(callback)

该接口是`horizon-request`库中的一个静态方法，用于将多个并发请求的响应数据传递给回调函数进行处理。通常配合`hr.all(iterable)`接口同时使用。

##### 1.12.1 接口定义

```typescript
hr.spread<T>(callback: Callback<T>): (arr: any[]) => T;
```

##### 1.12.2 代码示例

```typescript
// 创建多个 hr 请求实例
const request1 = hr.get('https://www.example.com/data1');
const request2 = hr.get('https://www.example.com/data2');
const request3 = hr.get('https://www.example.com/data3');

// 发送并发请求
hr.all([request1, request2, request3])
  .then(hr.spread((response1, response2, response3) => {
    // 请求成功，处理每个请求的响应数据
    console.log(response1.data);
    console.log(response2.data);
    console.log(response3.data);
  }))
  .catch(error => {
    // 请求失败，处理错误
  });
```

上述示例中，通过`hr.get`方法创建了三个`hr`请求实例，并将它们放入一个数组中。然后，使用`hr.all`方法将这个数组作为参数传递给`hr.all`方法，以同时发送这三个请求。在`then`回调中，通过`hr.spread`方法将多个请求的响应数据传递给回调函数进行处理。在回调函数中，可以通过多个参数（`response1`、`response2`、`response3`）访问每个请求的响应数据。

#### 1.13 hr.create([config])

该接口是`horizon-request`请求组件中的一个静态方法，用于创建一个独立的 hr 实例 。

##### 1.13.1 接口定义

```typescript
hr.create(config?: HrRequestConfig): HrInstance;
```

其中`hr`实例类型`HrInstance`定义如下：

```typescript
// Hr 类接口类型
interface HrInterface {
  request<T = unknown>(url: string | Record<string, any>, config?: HrRequestConfig): Promise<HrResponse<T>>;

  get<T = unknown>(url: string, config?: HrRequestConfig): Promise<HrResponse<T>>;

  post<T = unknown>(url: string, data?: any, config?: HrRequestConfig): Promise<HrResponse<T>>;

  put<T = unknown>(url: string, data?: any, config?: HrRequestConfig): Promise<HrResponse<T>>;

  delete<T = unknown>(url: string, config?: HrRequestConfig): Promise<HrResponse<T>>;

  head<T = unknown>(url: string, config?: HrRequestConfig): Promise<HrResponse<T>>;

  options<T = unknown>(url: string, config?: HrRequestConfig): Promise<HrResponse<T>>;
}

// Hr 实例接口类型
interface HrInstance extends HrInterface {
  // Hr 类
  HorizonRequest: HrInterface;

  // 创建 Hr 实例
  create: (config?: HrRequestConfig) => HrInstance;

  // 使用内置的配置初始化实例属性
  defaults: HrRequestConfig;

  // 取消当前正在进行的请求
  CancelToken: CancelTokenStatic;

  // 判断是否请求取消
  isCancel: (value: any) => boolean;

  // CanceledError的别名，用于向后兼容
  Cancel: typeof CanceledError;

  // 实例拦截请求
  interceptors: Interceptors;

  // 并发发送多个 HTTP 请求
  all<T>(promises: Array<Promise<T>>): Promise<Array<T>>;

  // 封装多个 Promise 至数组，便于作为 all 传入参数
  spread: <T>(callback: Callback<T>) => (arr: any[]) => T;

  // horizonRequest 对象的默认实例
  default: HrInstance;

  CanceledError: typeof CancelError;

  // HrError 错误
  HrError: typeof HrError;

  // 判断输入值是否为 HrError
  isHrError: (avl: any) => boolean;

  // HrHeaders 响应头
  HrHeaders: typeof HrHeaders;

  useHR: <T = any>(url: string, config?: HrRequestConfig, options?: QueryOptions) => { data?: T; error?: any };
}
```

##### 1.13.2 代码示例

```typescript
// 创建一个独立的 hr 实例
const instance = hr.create({
  baseURL: 'https://www.example.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'your-token'
  }
});

// 使用独立实例发送请求
instance.get('/data')
  .then(response => {
    // 请求成功，处理响应数据
  })
  .catch(error => {
    // 请求失败，处理错误
  });
```

上述示例中，使用`hr.create`方法创建了一个名为`instance`的独立`hr`实例。通过传递一个配置对象给`hr.create`方法，指定了实例的默认配置，包括基础URL、超时时间和请求头。然后，使用`instance`实例发送GET请求到`https://www.example.com/data`。在请求成功后，通过`response.data`访问服务器返回的数据。如果请求失败，将会捕获到`catch`块中的错误并进行处理。

### 2 horizon-request 实例化方法

通过1.13章节的`hr.create`方法可以创建一个独立的`hr`实例，您可以更改该实例的默认配置以便在同类场景中发送同类配置的网络请求，您可以创建多个实例以满足多场景下同类请求的发送。

方便起见，以下hr实例统一使用instance代替，实例对象上同样可以进行`request`、`get`、`post`、`delete`、`head`、`options`、`put`及`patch`请求的发送，其接口类型和使用方法与第一章节中各类请求方式一致。

```typescript
// 创建一个默认配置的 hr 实例
const instance = hr.create();

// 实例对象上请求方法接口类型
instance.get<T = unknown>(url: string, config?: HrRequestConfig): Promise<HrResponse<T>>;

instance.get<T = unknown>(url: string, config?: HrRequestConfig): Promise<HrResponse<T>>;

instance.post<T = unknown>(url: string, data?: any, config?: HrRequestConfig): Promise<HrResponse<T>>;

instance.delete<T = unknown>(url: string, config?: HrRequestConfig): Promise<HrResponse<T>>;

instance.head<T = unknown>(url: string, config?: HrRequestConfig): Promise<HrResponse<T>>;

instance.options<T = unknown>(url: string, config?: HrRequestConfig): Promise<HrResponse<T>>;

instance.put<T = unknown>(url: string, data?: any, config?: HrRequestConfig): Promise<HrResponse<T>>;

instance.patch<T = unknown>(url: string, data?: any, config?: HrRequestConfig): Promise<HrResponse<T>>;
```

### 3 请求配置参数

`horizon-request`请求组件可以通过传入请求配置参数`config`自定义网络请求的行为，以便满足您在不同场景下的请求需求。

#### 3.1 接口定义

```typescript
// 请求配置
interface HrRequestConfig {
  url?: string;

  method?: Method;

  // 公共URL前缀
  baseURL?: string;

  headers?: Record<string, any>;

  params?: Record<string, any> | null;

  data?: any;

  timeout?: number;

  // 超时错误消息
  timeoutErrorMessage?: string;

  // 是否发送凭据
  withCredentials?: boolean;

  // 响应类型
  responseType?: ResponseType;

  // 上传进度事件回调
  onUploadProgress?: (progressEvent: any) => void;

  // 下载进度事件回调
  onDownloadProgress?: (progressEvent: any) => void;

  // 请求取消令牌
  cancelToken?: CancelToken;

  signal?: AbortSignal;

  // 过渡选项
  transitional?: TransitionalOptions;
}
```

### 3.2 参数使用

#### 3.2.1 url 参数

##### 3.2.1.1 参数说明

该参数为请求的`URL`地址，类型为`string`。 该参数可以通过请求方法的第一个参数传入，也可以通过`config`配置对象的`url`字段传入。

##### 3.2.1.2 代码示例

```typescript
hr({
  url: 'https://www.example.com'
})
```

#### 3.2.2 method 参数

##### 3.2.2.1 参数说明

该参数为请求的`HTTP`方法。该参数在使用特定的请求方法时无需传入，在使用通用请求方法时通过`config`配置对象的`method`字段传入。 其类型定义如下：

```typescript
type Method = 'get' | 'GET' | 'delete' | 'DELETE' | 'head' | 'HEAD' | 'options' | 'OPTIONS' | 'post' | 'POST' | 'put' | 'PUT' | 'patch' | 'PATCH';
```

##### 3.2.2.2 代码示例

```typescript
hr('https://www.example.com', {
    method: 'GET'
})
```

#### 3.2.3 baseURL 参数

##### 3.2.3.1 参数说明

该参数为请求的公共URL前缀，类型为string。该参数会自动拼接在传入的url之前，通常配合实例化请求使用，提供公共场景下的便利请求方式。

##### 3.2.3.2 代码示例

```typescript
hr.get('/data', {
    baseURL: 'https://www.example.com'
})
```

#### 3.2.4 headers 参数

##### 3.2.4.1 参数说明

该参数为请求的自定义头信息，类型为`Record<string, any>`。您可以根据自身需求在`config`中配置请求头信息，以满足不同场景的请求需求。

##### 3.2.4.2 代码示例

```typescript
hr.get('https://www.example.com', {
  headers: {
    'Content-Type': 'application/json'
  }
})
```

#### 3.2.5 params 参数

##### 3.2.5.1 参数说明

该参数为请求`URL`中的参数，类型为`Record<string, any>`。该参数可以通过URL请求参数传入或通过`config`配置的`params`参数传入进而自动拼接到`URL`中。

##### 3.2.5.2 代码示例

```typescript
hr.get('https://www.example.com', {
  params: {
    id: 123,
    limit: 10,
  }
})
```

#### 3.2.6 data 参数

##### 3.2.6.1 参数说明

该参数为请求的数据体，类型为任意值。该参数为`post`、 `put`及`patch`请求所需要携带的数据，可以通过这些请求的第二个参数传入，也可以通过`config`配置的data字段传入。

##### 3.2.6.2 代码示例

```typescript
hr.post('https://www.example.com/data', {
  data: {
    name: 'Xiao Ming',
    age: 18,
  }
})
```

#### 3.2.7 timeout 参数

##### 3.2.7.1 参数说明

该参数为请求的超时时间（以毫秒为单位），类型为`number`。 请求过程中超过该配置时间`horizon-request`请求组件会自动中断请求并发送请求超时的错误消息。

##### 3.2.7.2 代码示例

```typescript
hr.get('https://www.example.com', {
  timeout: 5000
})
```

#### 3.2.8 timeoutErrorMessage 参数

##### 3.2.8.1 参数说明

该参数为请求超时时的错误消息，类型为`string`，该参数需配合`timeout`参数同时使用 。

##### 3.2.8.2 代码示例

```typescript
hr.get('https://www.example.com', {
  timeout: 5000,
  timeoutErrorMessage: '请求超时，请重试。',
})
```

#### 3.2.9 withCredentials 参数

##### 3.2.9.1 参数说明

该参数控制是否在跨域请求时包含凭据信息（如果存在），类型为`boolean`。默认情况下，该值为`false`，浏览器不会在跨域请求中发送凭据 。

##### 3.2.9.2 代码示例

```typescript
hr.get('https://www.example.com', {
  withCredentials: true
})
```

#### 3.2.10 responseType 参数

##### 3.2.10.1 参数说明

该参数用于设置请求的响应类型，其类型定义如下：

```typescript
type ResponseType = 'text' | 'json' | 'blob' | 'arraybuffer';
```

##### 3.2.10.2 代码示例

```typescript
hr.get('https://www.example.com', {
  responseType: 'json'
})
```

#### 3.2.11 onUploadProgress 参数

##### 3.2.11.1 参数说明

该参数用于设置上传进度事件回调函数。 配置该参数后horizon-request请求组件将自动检测上传进度，并将进度信息作为参数传递给 `onUploadProgress` 回调函数。这个参数可以帮助您在 UI 中显示进度条或其他形式的进度指示器，以使用户能够了解文件上传的进展情况。

##### 3.2.11.2 代码示例

```typescript
hr.post('https://www.example.com/upload', formData, {
  onUploadProgress: function(progressEvent) {
    // 计算上传进度的百分比
    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);

    // 更新用户界面上的进度条等元素
    console.log('上传进度：' + percentCompleted + '%');
  }
})
```

#### 3.2.12 onDownloadProgress  参数

##### 3.2.12.1 参数说明

该参数用于设置下载进度事件回调函数。 配置该参数后horizon-request请求组件将自动检测下载进度，并将进度信息作为参数传递给 `onDownloadProgress  ` 回调函数。这个参数可以帮助您在 UI 中显示进度条或其他形式的进度指示器，以使用户能够了解文件下载的进展情况。

##### 3.2.12.2 参数说明

```typescript
hr.get('https://www.example.com/download', {
  onDownloadProgress: function(progressEvent) {
    // 计算下载进度的百分比
    var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);

    // 更新用户界面上的进度条等元素
    console.log('下载进度：' + percentCompleted + '%');
  }
})
```

#### 3.2.13 cancelToken 参数(不推荐)

##### 3.2.13.1 参数说明

该参数用于取消请求操作，它是一个特殊的标记对象，允许您在发送请求之前或请求过程中取消该请求。使用 `cancelToken` 参数可以避免不必要的网络请求，尤其是当您发送多个并发请求时。如果你想在某个请求完成之前取消其中一个或全部请求，便可以使用 `cancelToken`。

##### 3.2.13.2 代码示例

```typescript
// 首先创建一个 cancelToken 对象
const CancelToken = hr.CancelToken;
const source = CancelToken.source();

// 将 cancelToken 对象作为配置对象的属性传递给请求组件
hr.get('https://www.example.com/data', {
  cancelToken: source.token
})

// 在某个时刻您需要取消请求则调用 cancel() 方法
source.cancel('请求被取消');
```

#### 3.2.14 signal 参数（推荐）

##### 3.2.14.1 参数说明

该参数用于设置一个 `AbortSignal` 对象，用于取消正在进行的请求。`AbortSignal` 是 Web API 的一部分，在现代浏览器中提供了一种用于取消网络请求的机制。

##### 3.2.14.2 代码示例

```typescript
// 创建一个 AbortController 对象和对应的 AbortSignal
const controller = new AbortController();
const signal = controller.signal;

// 发起请求并传入 signal 参数
hr.get('https://www.example.com/data', { signal })
  .then(response => {
    // 请求成功处理逻辑
  })
  .catch(error => {
    if (hr.isCancel(error)) {
      console.log('请求已取消', error.message);
    } else {
      console.log('请求发生错误', error.message);
    }
  });

// 在某个时刻您需要取消请求则调用 abort() 方法
controller.abort();
```

#### 3.2.15 transitional  参数

##### 3.2.15.1 参数说明

该参数可以用来定义一些转换规则，其接口类型定义如下：

```typescript
interface TransitionalOptions {
  // 是否忽略 JSON parse 的错误配置
  silentJSONParsing?: boolean;

  // 强制解析为 JSON 格式
  forcedJSONParsing?: boolean;

  // 请求超时异常错误配置
  clarifyTimeoutError?: boolean;
}
```

- `silentJSONParsing`用于配置解析 `JSON` 时是否静默处理错误，默认为`true`。配置为`true`时，如果发生 `JSON` 解析错误，将不会抛出异常，而是返回解析前的原始数据。
- `forcedJSONParsing`用于控制是否强制解析 `JSON` 数据，默认为`true`。配置为`true`时，无论数据的 `MIME` 类型（如`text/plain`）是什么，都会尝试将其解析为 `JSON`。
- `clarifyTimeoutError`用于控制是否在超时错误中提供更明确的错误信息，默认为`false`。配置为`true`时，将提供更具体的错误消息，指示发生的超时错误类型。

##### 3.2.15.2 代码示例

```typescript
hr.get('https://www.example.com', {
  transitional: {
  silentJSONParsing: true,
  forcedJSONParsing: false,
  clarifyTimeoutError: false,
  }
})
```

### 4 拦截器

`horizon-request`请求组件的拦截器有两种类型：请求拦截器和响应拦截器。

#### 4.1 请求拦截器

请求拦截器允许您在发送请求之前对其进行修改或添加特定配置。通过请求拦截器，您可以执行以下操作：

- 修改请求头信息，例如添加身份验证令牌。
- 在每个请求中添加通用参数。
- 对请求体进行转换。
- 拦截请求错误并进行相应处理。

##### 4.1.1 接口定义

```typescript
hr.interceptors.request.use(
  fulfilled?: FulfilledFn<HrRequestConfig>,
  rejected?: RejectedFn,
  options?: { synchronous?: boolean; runWhen?: (value: HrRequestConfig) => boolean }
  ): number;

type FulfilledFn<T> = (value: T) => T | Promise<T>;
type RejectedFn = (error: any) => any;
```

- `fulfilled`为请求成功的回调函数，在请求成功时被调用。它接收一个参数类型为 `HrRequestConfig`的配置`config`，表示已经发送请求的配置。
- `rejected`为请求失败的回调函数，用于处理请求失败的情况 。
- `options` 为拦截器的配置参数，用于配置拦截器的行为 。其中`synchronous` 为一个布尔值，指示是否同步地运行拦截器 ；`runWhen` 用于确定是否应该运行拦截器 。
- 返回值为一个数字 ，表示拦截器的唯一标识符，这个标识符可以用于后续操作，如移除拦截器。

##### 4.1.2 代码示例

```typescript
// 定义一个成功回调函数
const fulfilledCallback = (config) => {
  // 修改请求配置或添加通用参数
  config.headers.Authorization = 'new token';
  return config;
};

// 定义一个拒绝回调函数
const rejectedCallback = (error) => {
  console.error('请求失败！', error);
  return Promise.reject(error);
};

// 定义拦截器选项
const options = {
  synchronous: true, // 选择同步执行拦截器，默认为异步执行
  runWhen: (config) => config.method === 'GET', // 只在请求方法为GET时运行拦截器
};

// 注册拦截器
const interceptorId = hr.interceptors.request.use(
  fulfilledCallback,
  rejectedCallback,
  options，
);

// 发起请求
hr.get('https://www.example.com')
  .then((response) => {
    console.log('响应数据：', response.data);
  })
  .catch((error) => {
    console.error('请求出错！', error);
  });

// 取消拦截器
hr.interceptors.request.eject(interceptorId);
```

#### 4.2 响应拦截器

##### 4.2.1 接口定义

```typescript
hr.interceptors.response.use(
  fulfilled?: FulfilledFn<HrResponse<any>>,
  rejected?: RejectedFn,
  options?: { synchronous?: boolean; runWhen?: (value: HrResponse<any>) => boolean }
  ): number;

type FulfilledFn<T> = (value: T) => T | Promise<T>;
type RejectedFn = (error: any) => any;
```

- `fulfilled`为请求成功的回调函数，在请求成功时被调用。它接收一个参数类型为 `HrResponse<any>`的请求响应`response`，表示获取的请求响应。
- `rejected`为请求失败的回调函数，用于处理请求失败的情况 。
- `options` 为拦截器的配置参数，用于配置拦截器的行为 。其中`synchronous` 为一个布尔值，指示是否同步地运行拦截器 ；`runWhen` 用于确定是否应该运行拦截器 。
- 返回值为一个数字 ，表示拦截器的唯一标识符，这个标识符可以用于后续操作，如移除拦截器。

##### 4.2.2 代码示例

```typescript
// 定义成功处理函数
const fulfilledCallback = (response) => {
  // 修改响应内容
  response.status = 404;
  return response;
};

// 定义失败处理函数
const rejectedCallback = (error) => {
  console.error('请求失败:', error);
  return Promise.reject(error);
};

// 定义拦截器选项
const options = {
  synchronous: true, // 选择同步执行拦截器，默认为异步执行
  runWhen: (config) => config.method === 'GET', // 只在请求方法为GET时运行拦截器
};

// 使用hr.interceptors.response.use方法
const interceptorId = hr.interceptors.response.use(
  fulfilledHandler,
  rejectedHandler,
  options，
);

// 发起请求
hr.get('https://www.example.com')
  .then((response) => {
    console.log('请求结果:', response);
  })
  .catch((error) => {
    console.error('请求错误:', error);
  });

// 取消拦截器
hr.interceptors.response.eject(interceptorId);
```

### 5 请求错误

`horizon-request`请求组件提供了`HrError`类用于实例化请求错误对象，其包含了与请求相关的详细信息，以帮助开发者识别和处理错误。

#### 5.1 接口定义

```typescript
class HrError extends Error implements HrErrorInterface;

interface HrErrorInterface {
  // 产生错误的请求配置对象
  config?: HrRequestConfig;
  // 表示请求错误的字符串代码。例如，"ECONNABORTED"表示连接被中止。
  code?: string;
  // 产生错误的原始请求实例。
  request?: HrInstance;
  // 包含错误响应的响应实例。如果请求成功完成，但服务器返回错误状态码（例如404或500），则此属性存在。
  response?: HrResponse;
}
```

#### 5.2 代码示例

```typescript
hr.get('https://www.example.com/users')
  .then(response => {
    // 处理成功响应
    console.log(response.data);
  })
  .catch((error: HrError) => {
    if (error.response) {
      // 请求已发出，但服务器响应状态码不在 2xx 范围内
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      console.log(error.request);
    } else {
      // 在设置请求时触发错误，或者发生了一些其他错误
      console.log('Error', error.message);
    }
    console.log(error.config);
  });
```

- 在上面的示例中，使用hr发送一个GET请求到`https://www.example.com/users`。如果请求成功，打印出返回的数据；如果请求失败，捕获`HrError`并根据错误的类型进行处理。
- 在`catch`块中，可以通过`error.response`访问到服务器返回的响应信息。如果`error.response`存在，则意味着服务器有响应，但状态码不在2xx范围内。我们可以访问`error.response.data`获取服务器返回的数据，`error.response.status`获取状态码，以及`error.response.headers`获取响应头信息。
- 如果`error.response`不存在，而`error.request`存在，则表示请求已发送但未收到响应。在这种情况下，可以直接访问`error.request`获取请求对象。
- 如果以上两种情况都不满足，说明在设置请求时出现了错误，或者其他一些未知的错误，可以通过`error.message`打印错误信息。

### 6 请求取消

在`horizon-request`请求组件中，提供两种取消请求方式：`cancelToken`和`AbortController`。其中`cancelToken`的方式已过时，推荐使用`AbortController`的取消请求方式。具体使用方式参见3.2.13和3.2.14章节。

### 7 请求实时数据流

`horizon-reques`t请求组件提供支持动态轮询的实时数据流能力，帮助您在使用`horizon`框架进行页面开发时拥有更加便捷的请求体验！

#### 7.1 接口定义

```typescript
hr.useHR: <T=unknow>(url: string, config?: HrRequestConfig, options?: QueryOptions) => {data?: T, error?: any}

// 轮询查询配置 轮询间隔（毫秒）
interface QueryOptions {
  pollingInterval?: number;
  // 是否启用动态轮询策略
  enablePollingOptimization?: boolean;
  // 配置动态轮询策略后生效
  limitation?: Limitation;
  // 动态轮询策略分析历史数据容量，默认100
  capacity?: number;
  // 动态轮询策略窗口大小，默认5
  windowSize?: number;
}

interface Limitation {
  minInterval: number,
  maxInterval: number,
}
```

`url`和`config`参数和`horizon-request`请求组件接口参数一致，用于配置网络请求。

`options`参数为动态轮询配置参数，其中：

- 配置`pollingInterval`参数后将开启实时数据流功能，`horizon-request`请求组件会根据`pollingInterval`的间隔轮询请求服务端，当请求的服务端数据发生改变时会通知组件拿到最新数据并重新渲染；
- `enablePollingOptimization`参数用于开启动态轮询策略，该参数配置为`true`时，会启动动态轮询策略，`horizon-request`请求组件将分析历史请求数据，动态更新轮询间隔（若服务器数据变化频繁则会缩短轮询间隔时间，反之增加轮询间隔时间，最大保证用户体验一致性的同时减缓服务器压力），动态轮询间隔会有一个默认的最大间隔时间`60000ms`和最小间隔时间`100ms`；
- 您也可以通过`limitation`中的`maxInterval`参数来配置最大间隔时间，`minInterval`参数配置最小间隔时间；
- 您也可以自定义动态轮询策略的配置参数，通过`capacity`参数来设置分析的历史数据容量，通过`windowSize`设置动态轮询策略滑动窗口大小。

通过以上参数，您可以更加灵活的配置实时数据流特性以满足您在不同场景下的使用需求。

#### 7.2 代码示例

```typescript
import { useHR } from 'horizon-request';

const App = () => {
  const options = {
    pollingInterval: 3000,
    enablePollingOptimization: true,
    limitation: {minInterval: 500, maxInterval: 4000}
  };
  const { data, error } = useHR('https://www.example.com', null, options);

  return (
    <div>
      <pre>{error ? error.message : data }</pre>
    </div>
  );
}
```

在上面的示例中，`App`组件使用`useHR`获取了服务端的实时数据，并配置了动态轮询策略。若请求成功则会将服务端数据显示在`pre`标签中，当服务器数据发生变化，`pre`标签中也会同步刷新最新数据，当请求发生错误，将会显示错误信息。
