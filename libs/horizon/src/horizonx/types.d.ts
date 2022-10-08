/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openGauss is licensed under Mulan PSL v2.
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

export interface IObserver {

  useProp: (key: string | symbol) => void;

  addListener: (listener: () => void) => void;

  removeListener: (listener: () => void) => void;

  setProp: (key: string | symbol) => void;

  triggerChangeListeners: () => void;

  triggerUpdate: (vNode: any) => void;

  allChange: () => void;

  clearByVNode: (vNode: any) => void;
}

type RemoveFirstFromTuple<T extends any[]> =
  T['length'] extends 0 ? [] :
  (((...b: T) => void) extends (a, ...b: infer I) => void ? I : [])


type UserActions<S extends object> = { [K:string]: ActionFunction<S> };
type UserComputedValues<S extends object> = { [K:string]: ComputedFunction<S> };

type ActionFunction<S extends object> = (state: S, ...args: any[]) => any;
type ComputedFunction<S extends object> = (state: S) => any;
type Action<T extends UserActions<?>> = (...args:RemoveFirstFromTuple<Parameters<T>>)=>ReturnType<T>
type AsyncAction<T extends UserActions<?>> = (...args:RemoveFirstFromTuple<Parameters<T>>)=>Promise<ReturnType<T>>

type StoreActions<S extends object,A extends UserActions<S>> = { [K in keyof A]: Action<A[K]> };
type QueuedStoreActions<S extends object,A extends UserActions<S>> = { [K in keyof A]: AsyncAction<A[K]> };
type ComputedValues<S extends object,C extends UserComputedValues<S>> = { [K in keyof C]: ReturnType<C[K]> };
type PostponedAction = (state: object, ...args: any[]) => Promise<any>;
type PostponedActions = { [key:string]: PostponedAction }

export type StoreHandler<S extends object,A extends UserActions<S>,C extends UserComputedValues<S>> =
  {$subscribe: ((listener: () => void) => void),
  $unsubscribe: ((listener: () => void) => void),
  $state: S,
  $config: StoreConfig<S,A,C>,
  $queue: QueuedStoreActions<S,A>,
  $actions: StoreActions<S,A>,
  $computed: ComputedValues<S,C>,
  reduxHandler?:ReduxStoreHandler}
  &
  {[K in keyof S]: S[K]}
  &
  {[K in keyof A]: Action<A[K]>}
  &
  {[K in keyof C]: ReturnType<C[K]>}

export type StoreConfig<S extends object,A extends UserActions<S>,C extends UserComputedValues<S>> = {
  state?: S,
  options?:{suppressHooks?: boolean},
  actions?: A,
  id?: string,
  computed?: C
}

type ReduxStoreHandler = {
  reducer:(state:any,action:{type:string})=>any,
  dispatch:(action:{type:string})=>void,
  getState:()=>any,
  subscribe:(listener:()=>void)=>((listener:()=>void)=>void)
  replaceReducer: (reducer: (state:any,action:{type:string})=>any)=>void
  _horizonXstore: StoreHandler
}

type ReduxAction = {
  type:string
}

type ReduxMiddleware = (store:ReduxStoreHandler, extraArgument?:any) =>
  (next:((action:ReduxAction)=>any)) =>
  (action:(
    ReduxAction|
    ((dispatch:(action:ReduxAction)=>void,store:ReduxStoreHandler,extraArgument?:any)=>any)
  )) => ReduxStoreHandler
