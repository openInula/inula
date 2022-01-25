import {
  getPropDetails,
  PROPERTY_TYPE,
} from '../validators/PropertiesData';
import {isInvalidValue} from '../validators/ValidateProps';
import {getNamespaceCtx} from '../../renderer/ContextSaver';
import {NSS} from '../utils/DomCreator';
import {getDomTag} from '../utils/Common';

const svgHumpAttr = new Set(['allowReorder', 'autoReverse', 'baseFrequency', 'baseProfile', 'calcMode', 'clipPathUnits',
      'contentScriptType', 'contentStyleType', 'diffuseConstant', 'edgeMode', 'externalResourcesRequired', 'filterRes',
      'filterUnits', 'glyphRef', 'gradientTransform', 'gradientUnits', 'kernelMatrix', 'kernelUnitLength', 'keyPoints',
      'keySplines', 'keyTimes', 'lengthAdjust', 'limitingConeAngle', 'markerHeight', 'markerUnits', 'markerWidth',
      'maskContentUnits', 'maskUnits', 'numOctaves', 'pathLength', 'patternContentUnits', 'patternTransform,',
      'patternUnits', 'pointsAtX', 'pointsAtY', 'pointsAtZ', 'preserveAlpha', 'preserveAspectRatio', 'primitiveUnits',
      'referrerPolicy', 'refX', 'refY', 'repeatCount', 'repeatDur', 'requiredExtensions', 'requiredFeatures',
      'specularConstant', 'specularExponent', 'spreadMethod', 'startOffset', 'stdDeviation',
      'stitchTiles', 'surfaceScale','systemLanguage', 'tableValues', 'targetX', 'targetY',
      'textLength','viewBox', 'viewTarget', 'xChannelSelector','yChannelSelector', 'zoomAndPan']);

// 驼峰 变 “-”
function convertToLowerCase(str) {
  const replacer = (match, char) => `-${char.toLowerCase()}`;
  
  return str.replace(/([A-Z])/g, replacer);
}

/**
 * 给 dom 设置属性
 * attrName 指代码中属性设置的属性名称（如 class）
 * 多数情况 attrName 仅用作初始 DOM 节点对象使用，而 property 更多用于页面交互
 */
export function updateCommonProp(dom: Element, attrName: string, value: any, isNativeTag: boolean = true) {
  const propDetails = getPropDetails(attrName);

  if (isInvalidValue(attrName, value, propDetails, isNativeTag)) {
    value = null;
  }

  if (!isNativeTag || propDetails === null) {
    // 特殊处理svg的属性，把驼峰式的属性名称转成'-'
    if (getDomTag(dom) === 'svg' || getNamespaceCtx() === NSS.svg) {
      if (!svgHumpAttr.has(attrName)) {
        attrName = convertToLowerCase(attrName);
      }
    }

    if (value === null) {
      dom.removeAttribute(attrName);
    } else {
      dom.setAttribute(attrName, String(value));
    }
  } else if (['checked', 'multiple', 'muted', 'selected'].includes(propDetails.attrName)) {
    if (value === null) { // 必填属性设置默认值
      dom[propDetails.attrName] = false;
    } else {
      dom[propDetails.attrName] = value;
    }
  } else { // 处理其他普通属性
    if (value === null) {
      dom.removeAttribute(propDetails.attrName);
    } else {
      const {type, attrNS} = propDetails; // 数据类型、固有属性命名空间
      const attributeName = propDetails.attrName; // 固有属性名
      let attributeValue;
      if (type === PROPERTY_TYPE.BOOLEAN) { // 即可以用作标志又可以是属性值的属性
        attributeValue = '';
      } else {
        attributeValue = String(value);
      }

      if (attrNS) {
        dom.setAttributeNS(attrNS, attributeName, attributeValue);
      } else {
        dom.setAttribute(attributeName, attributeValue);
      }
    }
  }
}
