import { createForNode } from "../src"
import { compBuilder, createCompNode } from "../src/Nodes/CompNode/node"
import { delegateEvent } from "../src/Nodes/HTMLNode/html"
import { setHTMLProp } from "../src/Nodes/HTMLNode/html"
import { createTemplate, createTemplateNode, templateGetElement } from "../src/Nodes/HTMLNode/template"
import { render } from "../src/render"

let idCounter = 1

const adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"]
const colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"]
const nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"]

function _random(max: number) { return Math.round(Math.random() * 1000) % max };

function buildData(count: number) {
  const data = new Array(count)
  for (let i = 0; i < count; i++) {
    data[i] = {
      id: idCounter++,
      label: `${adjectives[_random(adjectives.length)]} ${colours[_random(colours.length)]} ${nouns[_random(nouns.length)]}`
    }
  }
  return data
}

const TEMPLATE0 = createTemplate(`<div class="col-sm-6 smallpad"><button class="btn btn-primary btn-block" type=button></div>`)
const Button = ({ 
  id, // 0b0001
  text, // 0b0010
  fn, // 0b0100
}: { id: string, text: string, fn: () => void }) => {
  const self = compBuilder()
  self.addProp('id', value => id = value, 0b0001)
  self.addProp('text', value => text = value, 0b0010)
  self.addProp('fn', value => fn = value, 0b0100)

  return self.prepare().init(
    createTemplateNode(TEMPLATE0, (node) => {
      const node0 = templateGetElement(node, 0)
      return () => {
        setHTMLProp(node0, 'id', () => id, [id], 0b0001)
        setHTMLProp(node0, 'textContent', () => text, [text], 0b0010)
        delegateEvent(node0, 'click', fn)
      }
    })
  )
}
  
const TEMPLATE1 = createTemplate(`<div class=container><div class=jumbotron><div class=row><div class=col-md-6><h1>Inula2.0 Keyed</h1></div><div class=col-md-6><div class=row></div></div></div></div><table class="table table-hover table-striped test-data"><tbody></tbody></table><span class="preloadicon glyphicon glyphicon-remove"aria-hidden=true>`)
const TEMPLATE2 = createTemplate(`<tr><td class=col-md-1></td><td class=col-md-4><a> </a></td><td class=col-md-1><a><span class="glyphicon glyphicon-remove"aria-hidden=true></span></a></td><td class=col-md-6>`)
const App = () => {
  const self = compBuilder()

  let data: { id: number, label: string }[] = []; // 0b0001
  let selected: number | null = null; // 0b0010
  const run = () => self.wave(data = buildData(1000), 0b0001)
  const runLots = () => self.wave(data = buildData(10000), 0b0001)
  const add = () => self.wave(data = [...data, ...buildData(1000)], 0b0001)
  const update = () => {
    for (let i = 0; i < data.length; i += 10) {
      self.wave(data[i].label += " !!!", 0b0001)
    }
  }
  const swapRows = () => {
    if (data.length > 998) {
      self.wave([data[1], data[998]] = [data[998], data[1]], 0b0001)
    }
  }
  const clear = () => self.wave(data = [], 0b0001)
  const remove = (id: number) => self.wave(data = data.filter(d => d.id !== id), 0b0001)
  const selectRow = (id: number) => self.wave(selected = id, 0b0010)

  return self.prepare().init(
    createTemplateNode(TEMPLATE1, null, 
      // Buttons
      [0, createCompNode(Button({ id: 'run', text: 'Create 1,000 rows', fn: run }), null), 0, 0, 1, 0],
      [1, createCompNode(Button({ id: 'runlots', text: 'Create 10,000 rows', fn: runLots }), null), 0, 0, 1, 0],
      [2, createCompNode(Button({ id: 'add', text: 'Append 1,000 rows', fn: add }), null), 0, 0, 1, 0],
      [3, createCompNode(Button({ id: 'update', text: 'Update every 10th row', fn: update }), null), 0, 0, 1, 0],
      [4, createCompNode(Button({ id: 'clear', text: 'Clear', fn: clear }), null), 0, 0, 1, 0],
      [5, createCompNode(Button({ id: 'swaprows', text: 'Swap Rows', fn: swapRows }), null), 0, 0, 1, 0],  
      // For
      [0, createForNode(
        () => data, 
        () => data.map(({id}) => id),
        (node, updateItemFuncArr, item, key, idx) => {
          updateItemFuncArr[idx] = (newItem, newIdx) => {
            item = newItem
            idx = newIdx
          }
          return [createTemplateNode(TEMPLATE2, node => {
            const node0 = templateGetElement(node, 0)
            const node1 = templateGetElement(node, 1, 0)
            const node2 = templateGetElement(node, 2, 0)
            return () => {
              setHTMLProp(node, 'className', () => selected === item.id ? 'danger' : '', [selected == item.id, item.id], 0b0010)
              setHTMLProp(node0, 'textContent', () => item.id, [], 0)
              delegateEvent(node1, 'click', selectRow.bind(null, item.id))
              setHTMLProp(node1, 'textContent', () => item.label, [item.label], 0b0001)
              delegateEvent(node2, 'click', remove.bind(null, item.id))
            }
          })]
        },
        0b0001
      ), 
      1, 0],
    )
  )
}

render(App(), document.getElementById("main")!);
