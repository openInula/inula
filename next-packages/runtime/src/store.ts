// import { Store } from "@inula/store"
const Store: any = {}

if (!("global" in Store)) {
  if (globalThis) {
    Store.global = globalThis
  } else {
    Store.global = {}
  }
}

if (!("document" in Store)) {
  if (typeof document !== "undefined") {
    Store.document = document
  }
}

export const InulaStore: {
  global: Record<string, any>
  document: Document
  delegatedEvents: Set<string>
} = { ...Store, delegatedEvents: new Set() }

export function setGlobal(globalObj: Record<string, any>) {
  InulaStore.global = globalObj
}

export function setDocument(customDocument: Document) {
  InulaStore.document = customDocument
}

