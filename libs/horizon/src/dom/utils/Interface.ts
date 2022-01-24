export interface IProperty {
  [propName: string]: any;
}

export interface HorizonSelect extends HTMLSelectElement {
  _multiple: boolean;
}

export type HorizonDom = Element | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
