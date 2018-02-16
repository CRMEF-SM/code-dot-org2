import xml from './xml';

const ATTRIBUTES_TO_CLEAN = [
  'uservisible',
  'deletable',
  'movable',
];

/**
 * Create the xml for a level's toolbox
 * @param {string} blocks The xml of the blocks to go in the toolbox
 */
exports.createToolbox = function (blocks) {
  return '<xml id="toolbox" style="display: none;">' + blocks + '</xml>';
};

/**
 * Create the xml for a block of the given type
 * @param {string} type The type of the block
 * @param {Object.<string,string>} [titles] Dictionary of titles mapping name to value
 * @param {Object} [values] Dictionary of values mapping name to value
 * @param {string} values.type Type of the value input
 * @param {string} values.titleName Name of the title block
 * @param {string} values.titleValue Input value
 */
exports.blockOfType = function (type, titles, values) {
  let inputText = '';
  if (titles) {
    for (let key in titles) {
      inputText += `<title name="${key}">${titles[key]}</title>`;
    }
  }
  if (values) {
    for (let key in values) {
      inputText += `<value name="${key}">
        <block type="${values[key].type}">
          <title name="${values[key].titleName}">${values[key].titleValue}</title>
        </block>
      </value>`;
    }
  }
  return `<block type="${type}">${inputText}</block>`;
};

/*
 * Creates an XML node for an individual block. See blockOfType for params
 */
exports.blockAsXmlNode = function (type, inputs = {}) {
  return xml
    .parseElement(exports.blockOfType(type, inputs.titles, inputs.values))
    .firstChild;
};

/**
 * Create the xml for a block of the given type, with the provided child nested
 * in a next block
 * @param {string} type The type of the block
 * @param {Object.<string,string>} [titles] Dictionary of titles mapping name to value
 * @param {string} child Xml for the child block
 */
exports.blockWithNext = function (type, titles, child) {
  var titleText = '';
  if (titles) {
    for (var key in titles) {
      titleText += '<title name="' + key + '">' + titles[key] + '</title>';
    }
  }
  return '<block type="' + type + '">' + titleText + '<next>' + child + '</next></block>';
};

/**
 * Give a list of types, returns the xml assuming each block is a child of
 * the previous block.
 */
exports.blocksFromList = function (types) {
  if (types.length === 1) {
    return this.blockOfType(types[0]);
  }

  return this.blockWithNext(types[0], {}, this.blocksFromList(types.slice(1)));
};

/**
 * Create the xml for a category in a toolbox
 */
exports.createCategory = function (name, blocks, custom) {
  return '<category name="' + name + '"' +
          (custom ? ' custom="' + custom + '"' : '') +
          '>' + blocks + '</category>';
};

/**
 * Generate a simple block with a plain title and next/previous connectors.
 */
exports.generateSimpleBlock = function (blockly, generator, options) {
  ['name', 'title', 'tooltip', 'functionName'].forEach(function (param) {
    if (!options[param]) {
      throw new Error('generateSimpleBlock requires param "' + param + '"');
    }
  });

  var name = options.name;
  var helpUrl = options.helpUrl || ""; // optional param
  var title = options.title;
  var titleImage = options.titleImage;
  var tooltip = options.tooltip;
  var functionName = options.functionName;

  blockly.Blocks[name] = {
    helpUrl: helpUrl,
    init: function () {
      // Note: has a fixed HSV.  Could make this customizable if need be
      this.setHSV(184, 1.00, 0.74);
      var input = this.appendDummyInput();
      if (title) {
        input.appendTitle(title);
      }
      if (titleImage) {
        input.appendTitle(new blockly.FieldImage(titleImage));
      }
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setTooltip(tooltip);
    }
  };

  generator[name] = function () {
    // Generate JavaScript for putting dirt on to a tile.
    return functionName + '(\'block_id_' + this.id + '\');\n';
  };
};

/**
 * Generates a single block from a <block/> DOM element, adding it to the main workspace
 * @param blockDOM {Element}
 * @returns {*}
 */
exports.domToBlock = function (blockDOM) {
  return Blockly.Xml.domToBlock(Blockly.mainBlockSpace, blockDOM);
};

/**
 * Generates a single block from a block XML string—e.g., <block type="testBlock"></block>,
 * and adds it to the main workspace
 * @param blockDOMString
 * @returns {*}
 */
exports.domStringToBlock = function (blockDOMString) {
  return exports.domToBlock(xml.parseElement(blockDOMString).firstChild);
};

/**
 * Takes a set of start blocks, and returns them with a particular top level
 * block inserted in front of the first non-function block.  If we already have
 * this block, does nothing.
 */
exports.forceInsertTopBlock = function (input, blockType) {
  input = input || '';

  if (blockType === null || input.indexOf(blockType) !== -1) {
    return input;
  }

  var root = xml.parseElement(input);

  // Extract the document from the root. The reason I do this instead of just
  // using document.createElement elsewhere is
  var doc = root.parentNode;

  var topBlock = doc.createElement('block');
  topBlock.setAttribute('type', blockType);
  topBlock.setAttribute('movable', 'false');
  topBlock.setAttribute('deletable', 'false');

  var numChildren = root.childNodes ? root.childNodes.length : 0;

  // find the first non-function definition block and extract it
  var firstBlock = null, i = 0;
  while (i < numChildren && firstBlock === null) {
    var child = root.childNodes[i];
    // only look at element nodes
    if (child.nodeType === 1) {
      var type = child.getAttribute('type');
      if (type !== 'procedures_defnoreturn' && type !== 'procedures_defreturn') {
        firstBlock = root.removeChild(child);
        numChildren--;
      }
    }
    i++;
  }

  if (firstBlock !== null) {
    // when run -> next -> firstBlock
    var next;
    if (/^functional/.test(blockType)) {
      next = doc.createElement('functional_input');
      next.setAttribute('name', 'ARG1');
    } else {
      next = doc.createElement('next');
    }
    next.appendChild(firstBlock);
    topBlock.appendChild(next);
  }

  if (numChildren > 0) {
    root.insertBefore(topBlock, root.childNodes[0]);
  } else {
    root.appendChild(topBlock);
  }
  return xml.serialize(root);
};

/**
 * Generate the xml for a block for the calc app.
 * @param {string} type Type for this block
 * @param {number[]|string[]} args List of args, where each arg is either the
 *   xml for a child block, a number, or the name of a variable.
 */
exports.calcBlockXml = function (type, args) {
  var str = '<block type="' + type + '" inline="false">';
  for (var i = 1; i <= args.length; i++) {
    str += '<functional_input name="ARG' + i + '">';
    var arg = args[i - 1];
    if (typeof(arg) === "number") {
      arg = '<block type="functional_math_number"><title name="NUM">' + arg +
        '</title></block>';
    } else if (/^<block/.test(arg)) {
      // we have xml, dont make any changes
    } else {
      // we think we have a variable
      arg = exports.calcBlockGetVar(arg);
    }
    str += arg;
    str += '</functional_input>';
  }
  str += '</block>';

  return str;
};

/**
 * @returns the xml for a functional_parameters_get block with the given
 *   variableName
 */
exports.calcBlockGetVar = function (variableName) {
  return '' +
    '<block type="functional_parameters_get" uservisible="false">' +
    '  <mutation>' +
    '    <outputtype>Number</outputtype>' +
    '  </mutation>' +
    '  <title name="VAR">' + variableName + '</title>' +
    '</block>';
};

/**
 * Generate the xml for a math block (either calc or eval apps).
 * @param {string} type Type for this block
 * @param {Object.<string,string} inputs Dictionary mapping input name to the
     xml for that input
 * @param {Object.<string.string>} [titles] Dictionary of titles mapping name to value
 */
exports.mathBlockXml = function (type, inputs, titles) {
  var str = '<block type="' + type + '" inline="false">';
  for (var title in titles) {
    str += '<title name="' + title + '">' + titles[title] + '</title>';
  }

  for (var input in inputs) {
    str += '<functional_input name="' + input + '">' + inputs[input] + '</functional_input>';
  }

  str += '</block>';

  return str;
};

/**
 * Generate xml for a functional defintion
 * @param {string} name The name of the function
 * @param {string} outputType Function's output type
 * @param {Object<string, string>[]} argList Name and type for each arg
 * @param {string} blockXml Xml for the blocks that actually define the function
 */
exports.functionalDefinitionXml = function (name, outputType, argList, blockXml) {
  var mutation = '<mutation>';
  argList.forEach(function (argInfo) {
    mutation += '<arg name="' + argInfo.name + '" type="' + argInfo.type + '"></arg>';
  });
  mutation += '<outputtype>' + outputType + '</outputtype></mutation>';

  return '<block type="functional_definition" inline="false">'+
      mutation +
      '<title name="NAME">' + name + '</title>' +
     '<functional_input name="STACK">' + blockXml + '</functional_input>' +
    '</block>';
};

/**
 * Generate xml for a calling a functional function
 * @param {string} name The name of the function
 * @param {Object<string, string>[]} argList Name and type for each arg
 */
exports.functionalCallXml = function (name, argList, inputContents) {
  if (argList.length !== inputContents.length) {
    throw new Error('must define contents for each arg');
  }

  var mutation = '<mutation name="' + name + '">';
  argList.forEach(function (argInfo) {
    mutation += '<arg name="' + argInfo.name + '" type="' + argInfo.type + '"></arg>';
  });
  mutation += '</mutation>';

  var contents = '';
  inputContents.forEach(function (blockXml, index) {
    contents += '<functional_input name="ARG' + index + '">' + blockXml + '</functional_input>';
  });

  return '<block type="functional_call">' +
      mutation +
      contents +
    '</block>';
};

/**
 * Removes all the deletable, movable, and uservisible attributes from the
 * blocks in blocksDom.
 */
exports.cleanBlocks = function (blocksDom) {
  xml.visitAll(blocksDom, block => {
    if (!block.getAttribute) {
      return;
    }
    ATTRIBUTES_TO_CLEAN.forEach(attr => block.removeAttribute(attr));
  });
};

const DROPDOWN_INPUT = 'dropdown';
const VALUE_INPUT = 'value';
const DUMMY_INPUT = 'dummy';

/**
 * Given block text with input names specified in curly braces, returns a list
 * of labeled inputs that should be added to the block.
 *
 * @param {string} text The complete message shown on the block with inputs in
 *   curly braces, e.g. "Move the {SPRITE} {PIXELS} to the {DIR}"
 * @param {Object[]} args Define the type/options of the block's inputs.
 * @param {string} args[].name Input name, conventionally all-caps
 * @param {string[][]} args[].options For dropdowns, the list of options. Each
 *   entry is a 2-element string array with the display name first, and the
 *   codegen-compatible (i.e. strings should be doubly-quoted) value second.
 * @param {BlockValueType} args[].type For value inputs, the type required. Use
 *   BlockValueType.NONE to accept any block.
 *
 * @returns {Object[]} a list of labeled inputs. Each one has the same fields
 *   as 'args', but additionally includes:
 * @returns {string} return[].mode Either 'dropdown', 'value', or 'dummy'
 * @returns {string} return[].label Text to display to the left of the input
 */
exports.determineInputs = function (text, args) {
  const tokens = text.split(/[{}]/);
  if (tokens[tokens.length - 1] === '') {
    tokens.pop();
  }
  const inputs = [];
  for (let i = 0; i < tokens.length; i += 2) {
    const label = tokens[i];
    const input = tokens[i + 1];
    if (input) {
      const arg = args.find(arg => arg.name === input);
      if (arg.options) {
        inputs.push({
          mode: DROPDOWN_INPUT,
          name: arg.name,
          options: arg.options,
          label,
        });
      } else if (arg.type) {
        inputs.push({
          mode: VALUE_INPUT,
          name: arg.name,
          type: arg.type,
          label,
        });
      }
    } else {
      inputs.push({
        mode: DUMMY_INPUT,
        label,
      });
    }
  }
  return inputs;
};

/**
 * Adds the specified inputs to the block
 * @param {Blockly} blockly The Blockly object provided to install()
 * @param {Block} block The block to add the inputs to
 * @param {Object[]} inputs The list of inputs. See determineInputs() for
 *   the fields in each input.
 */
exports.interpolateInputs = function (blockly, block, inputs) {
  inputs.map(input => {
    let dropdown;
    switch (input.mode) {
      case DROPDOWN_INPUT:
        dropdown = new blockly.FieldDropdown(
          input.options.map(option => [input.label + option[0], option[1]])
        );
        block.appendDummyInput().appendTitle(dropdown, input.name);
        break;
      case VALUE_INPUT:
        block.appendValueInput(input.name)
          .setCheck(input.type)
          .appendTitle(input.label);
        break;
      case DUMMY_INPUT:
        block.appendDummyInput()
          .appendTitle(input.label);
        break;
    }
  });
};
