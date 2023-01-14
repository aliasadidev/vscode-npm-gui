import { Helper } from "./xml-helper.module";

var currentElement: any, currentElementName: any;
var h = new Helper();

function validateOptions(userOptions: any) {
  var options = h.copyOptions(userOptions);
  h.ensureFlagExists('ignoreDeclaration', options);
  h.ensureFlagExists('ignoreInstruction', options);
  h.ensureFlagExists('ignoreAttributes', options);
  h.ensureFlagExists('ignoreText', options);
  h.ensureFlagExists('ignoreComment', options);
  h.ensureFlagExists('ignoreCdata', options);
  h.ensureFlagExists('ignoreDoctype', options);
  h.ensureFlagExists('compact', options);
  h.ensureFlagExists('indentText', options);
  h.ensureFlagExists('indentCdata', options);
  h.ensureFlagExists('indentAttributes', options);
  h.ensureFlagExists('indentInstruction', options);
  h.ensureFlagExists('fullTagEmptyElement', options);
  h.ensureFlagExists('noQuotesForNativeAttributes', options);
  h.ensureSpacesExists(options);
  if (typeof options.spaces === 'number') {
    options.spaces = Array(options.spaces + 1).join(' ');
  }
  h.ensureKeyExists('declaration', options);
  h.ensureKeyExists('instruction', options);
  h.ensureKeyExists('attributes', options);
  h.ensureKeyExists('text', options);
  h.ensureKeyExists('comment', options);
  h.ensureKeyExists('cdata', options);
  h.ensureKeyExists('doctype', options);
  h.ensureKeyExists('type', options);
  h.ensureKeyExists('name', options);
  h.ensureKeyExists('elements', options);
  h.checkFnExists('doctype', options);
  h.checkFnExists('instruction', options);
  h.checkFnExists('cdata', options);
  h.checkFnExists('comment', options);
  h.checkFnExists('text', options);
  h.checkFnExists('instructionName', options);
  h.checkFnExists('elementName', options);
  h.checkFnExists('attributeName', options);
  h.checkFnExists('attributeValue', options);
  h.checkFnExists('attributes', options);
  h.checkFnExists('fullTagEmptyElement', options);
  return options;
}

function writeIndentation(options: any, depth: any, firstLine: any) {
  return (!firstLine && options.spaces ? '\n' : '') + Array(depth + 1).join(options.spaces);
}

function writeAttributes(attributes: any, options: any, depth: any) {
  if (options.ignoreAttributes) {
    return '';
  }
  if ('attributesFn' in options) {
    attributes = options.attributesFn(attributes, currentElementName, currentElement);
  }
  var key, attr, attrName, quote, result = [];
  for (key in attributes) {
    if (attributes.hasOwnProperty(key) && attributes[key] !== null && attributes[key] !== undefined) {
      quote = options.noQuotesForNativeAttributes && typeof attributes[key] !== 'string' ? '' : '"';
      attr = '' + attributes[key]; // ensure number and boolean are converted to String
      attr = attr.replace(/"/g, '&quot;');
      attrName = 'attributeNameFn' in options ? options.attributeNameFn(key, attr, currentElementName, currentElement) : key;
      result.push((options.spaces && options.indentAttributes ? writeIndentation(options, depth + 1, false) : ' '));
      result.push(attrName + '=' + quote + ('attributeValueFn' in options ? options.attributeValueFn(attr, key, currentElementName, currentElement) : attr) + quote);
    }
  }
  if (attributes && Object.keys(attributes).length && options.spaces && options.indentAttributes) {
    result.push(writeIndentation(options, depth, false));
  }
  return result.join('');
}

function writeDeclaration(declaration: any, options: any, depth: any) {
  currentElement = declaration;
  currentElementName = 'xml';
  return options.ignoreDeclaration ? '' : '<?' + 'xml' + writeAttributes(declaration[options.attributesKey], options, depth) + '?>';
}

function writeInstruction(instruction: any, options: any, depth: any) {
  if (options.ignoreInstruction) {
    return '';
  }
  var key: any;
  for (key in instruction) {
    if (instruction.hasOwnProperty(key)) {
      break;
    }
  }
  var instructionName = 'instructionNameFn' in options ? options.instructionNameFn(key, instruction[key], currentElementName, currentElement) : key;
  if (typeof instruction[key] === 'object') {
    currentElement = instruction;
    currentElementName = instructionName;
    return '<?' + instructionName + writeAttributes(instruction[key][options.attributesKey], options, depth) + '?>';
  } else {
    var instructionValue = instruction[key] ? instruction[key] : '';
    if ('instructionFn' in options) {
      instructionValue = options.instructionFn(instructionValue, key, currentElementName, currentElement);
    }
    return '<?' + instructionName + (instructionValue ? ' ' + instructionValue : '') + '?>';
  }
}

function writeComment(comment: any, options: any) {
  return options.ignoreComment ? '' : '<!--' + ('commentFn' in options ? options.commentFn(comment, currentElementName, currentElement) : comment) + '-->';
}

function writeCdata(cdata: any, options: any) {
  return options.ignoreCdata ? '' : '<![CDATA[' + ('cdataFn' in options ? options.cdataFn(cdata, currentElementName, currentElement) : cdata.replace(']]>', ']]]]><![CDATA[>')) + ']]>';
}

function writeDoctype(doctype: any, options: any) {
  return options.ignoreDoctype ? '' : '<!DOCTYPE ' + ('doctypeFn' in options ? options.doctypeFn(doctype, currentElementName, currentElement) : doctype) + '>';
}

function writeText(text: any, options: any) {
  if (options.ignoreText) {
    return '';
  }
  text = '' + text; // ensure Number and Boolean are converted to String
  text = text.replace(/&amp;/g, '&'); // desanitize to avoid double sanitization
  text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return 'textFn' in options ? options.textFn(text, currentElementName, currentElement) : text;
}

function hasContent(element: any, options: any) {
  var i;
  if (element.elements && element.elements.length) {
    for (i = 0; i < element.elements.length; ++i) {
      switch (element.elements[i][options.typeKey]) {
        case 'text':
          if (options.indentText) {
            return true;
          }
          break; // skip to next key
        case 'cdata':
          if (options.indentCdata) {
            return true;
          }
          break; // skip to next key
        case 'instruction':
          if (options.indentInstruction) {
            return true;
          }
          break; // skip to next key
        case 'doctype':
        case 'comment':
        case 'element':
          return true;
        default:
          return true;
      }
    }
  }
  return false;
}

function writeElement(element: any, options: any, depth: any) {
  currentElement = element;
  currentElementName = element.name;
  var xml = [], elementName = 'elementNameFn' in options ? options.elementNameFn(element.name, element) : element.name;
  xml.push('<' + elementName);
  if (element[options.attributesKey]) {
    xml.push(writeAttributes(element[options.attributesKey], options, depth));
  }
  var withClosingTag = element[options.elementsKey] &&
    element[options.elementsKey].length ||
    element[options.attributesKey] &&
    element[options.attributesKey]['xml:space'] === 'preserve' ||
    element["isSelfClosing"] === false;

  if (!withClosingTag) {
    if ('fullTagEmptyElementFn' in options) {
      withClosingTag = options.fullTagEmptyElementFn(element.name, element);
    } else {
      withClosingTag = options.fullTagEmptyElement;
    }
  }
  if (withClosingTag) {
    xml.push('>');
    if (element[options.elementsKey] && element[options.elementsKey].length) {
      xml.push(writeElements(element[options.elementsKey], options, depth + 1));
      currentElement = element;
      currentElementName = element.name;
    }
    xml.push(options.spaces && hasContent(element, options) ? '\n' + Array(depth + 1).join(options.spaces) : '');
    xml.push('</' + elementName + '>');
  } else {
    xml.push(' />');
  }
  return xml.join('');
}

function writeElements(elements: any, options: any, depth: any, firstLine?: any) {
  return elements.reduce(function (xml: any, element: any) {
    var indent = writeIndentation(options, depth, firstLine && !xml);
    switch (element.type) {
      case 'element': return xml + indent + writeElement(element, options, depth);
      case 'comment': return xml + indent + writeComment(element[options.commentKey], options);
      case 'doctype': return xml + indent + writeDoctype(element[options.doctypeKey], options);
      case 'cdata': return xml + (options.indentCdata ? indent : '') + writeCdata(element[options.cdataKey], options);
      case 'text': return xml + (options.indentText ? indent : '') + writeText(element[options.textKey], options);
      case 'instruction':
        var instruction: any = {};
        instruction[element[options.nameKey]] = element[options.attributesKey] ? element : element[options.instructionKey];
        return xml + (options.indentInstruction ? indent : '') + writeInstruction(instruction, options, depth);
    }
  }, '');
}

function hasContentCompact(element: any, options: any, anyContent?: any) {
  var key;
  for (key in element) {
    if (element.hasOwnProperty(key)) {
      switch (key) {
        case options.parentKey:
        case options.attributesKey:
          break; // skip to next key
        case options.textKey:
          if (options.indentText || anyContent) {
            return true;
          }
          break; // skip to next key
        case options.cdataKey:
          if (options.indentCdata || anyContent) {
            return true;
          }
          break; // skip to next key
        case options.instructionKey:
          if (options.indentInstruction || anyContent) {
            return true;
          }
          break; // skip to next key
        case options.doctypeKey:
        case options.commentKey:
          return true;
        default:
          return true;
      }
    }
  }
  return false;
}

function writeElementCompact(element: any, name: any, options: any, depth: any, indent: any): any {
  currentElement = element;
  currentElementName = name;
  var elementName = 'elementNameFn' in options ? options.elementNameFn(name, element) : name;
  if (typeof element === 'undefined' || element === null || element === '') {
    return 'fullTagEmptyElementFn' in options && options.fullTagEmptyElementFn(name, element) || options.fullTagEmptyElement ? '<' + elementName + '></' + elementName + '>' : '<' + elementName + '/>';
  }
  var xml = [];
  if (name) {
    xml.push('<' + elementName);
    if (typeof element !== 'object') {
      xml.push('>' + writeText(element, options) + '</' + elementName + '>');
      return xml.join('');
    }
    if (element[options.attributesKey]) {
      xml.push(writeAttributes(element[options.attributesKey], options, depth));
    }
    var withClosingTag = hasContentCompact(element, options, true) || element[options.attributesKey] && element[options.attributesKey]['xml:space'] === 'preserve';
    if (!withClosingTag) {
      if ('fullTagEmptyElementFn' in options) {
        withClosingTag = options.fullTagEmptyElementFn(name, element);
      } else {
        withClosingTag = options.fullTagEmptyElement;
      }
    }
    if (withClosingTag) {
      xml.push('>');
    } else {
      xml.push('/>');
      return xml.join('');
    }
  }
  xml.push(writeElementsCompact(element, options, depth + 1, false));
  currentElement = element;
  currentElementName = name;
  if (name) {
    xml.push((indent ? writeIndentation(options, depth, false) : '') + '</' + elementName + '>');
  }
  return xml.join('');
}

function writeElementsCompact(element: any, options: any, depth: any, firstLine: any): any {
  var i, key, nodes, xml = [];
  for (key in element) {
    if (element.hasOwnProperty(key)) {
      nodes = h.isArray(element[key]) ? element[key] : [element[key]];
      for (i = 0; i < nodes.length; ++i) {
        switch (key) {
          case options.declarationKey: xml.push(writeDeclaration(nodes[i], options, depth)); break;
          case options.instructionKey: xml.push((options.indentInstruction ? writeIndentation(options, depth, firstLine) : '') + writeInstruction(nodes[i], options, depth)); break;
          case options.attributesKey: case options.parentKey: break; // skip
          case options.textKey: xml.push((options.indentText ? writeIndentation(options, depth, firstLine) : '') + writeText(nodes[i], options)); break;
          case options.cdataKey: xml.push((options.indentCdata ? writeIndentation(options, depth, firstLine) : '') + writeCdata(nodes[i], options)); break;
          case options.doctypeKey: xml.push(writeIndentation(options, depth, firstLine) + writeDoctype(nodes[i], options)); break;
          case options.commentKey: xml.push(writeIndentation(options, depth, firstLine) + writeComment(nodes[i], options)); break;
          default: xml.push(writeIndentation(options, depth, firstLine) + writeElementCompact(nodes[i], key, options, depth, hasContentCompact(nodes[i], options)));
        }
        firstLine = firstLine && !xml.length;
      }
    }
  }
  return xml.join('');
}

export function js2xml(js: any, options: any) {
  options = validateOptions(options);
  var xml = [];
  currentElement = js;
  currentElementName = '_root_';
  if (options.compact) {
    xml.push(writeElementsCompact(js, options, 0, true));
  } else {
    if (js[options.declarationKey]) {
      xml.push(writeDeclaration(js[options.declarationKey], options, 0));
    }
    if (js[options.elementsKey] && js[options.elementsKey].length) {
      xml.push(writeElements(js[options.elementsKey], options, 0, !xml.length));
    }
  }
  return xml.join('');
};


