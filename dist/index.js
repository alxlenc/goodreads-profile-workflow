var __commonJS = (cb, mod) => () => (mod || cb((mod = {exports: {}}).exports, mod), mod.exports);

// node_modules/@actions/core/lib/utils.js
var require_utils = __commonJS((exports2) => {
  "use strict";
  Object.defineProperty(exports2, "__esModule", {value: true});
  function toCommandValue(input) {
    if (input === null || input === void 0) {
      return "";
    } else if (typeof input === "string" || input instanceof String) {
      return input;
    }
    return JSON.stringify(input);
  }
  exports2.toCommandValue = toCommandValue;
});

// node_modules/@actions/core/lib/command.js
var require_command = __commonJS((exports2) => {
  "use strict";
  var __importStar = exports2 && exports2.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (Object.hasOwnProperty.call(mod, k))
          result[k] = mod[k];
    }
    result["default"] = mod;
    return result;
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  var os = __importStar(require("os"));
  var utils_1 = require_utils();
  function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
  }
  exports2.issueCommand = issueCommand;
  function issue(name, message = "") {
    issueCommand(name, {}, message);
  }
  exports2.issue = issue;
  var CMD_STRING = "::";
  var Command = class {
    constructor(command, properties, message) {
      if (!command) {
        command = "missing.command";
      }
      this.command = command;
      this.properties = properties;
      this.message = message;
    }
    toString() {
      let cmdStr = CMD_STRING + this.command;
      if (this.properties && Object.keys(this.properties).length > 0) {
        cmdStr += " ";
        let first = true;
        for (const key in this.properties) {
          if (this.properties.hasOwnProperty(key)) {
            const val = this.properties[key];
            if (val) {
              if (first) {
                first = false;
              } else {
                cmdStr += ",";
              }
              cmdStr += `${key}=${escapeProperty(val)}`;
            }
          }
        }
      }
      cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
      return cmdStr;
    }
  };
  function escapeData(s) {
    return utils_1.toCommandValue(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
  }
  function escapeProperty(s) {
    return utils_1.toCommandValue(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A").replace(/:/g, "%3A").replace(/,/g, "%2C");
  }
});

// node_modules/@actions/core/lib/file-command.js
var require_file_command = __commonJS((exports2) => {
  "use strict";
  var __importStar = exports2 && exports2.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (Object.hasOwnProperty.call(mod, k))
          result[k] = mod[k];
    }
    result["default"] = mod;
    return result;
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  var fs2 = __importStar(require("fs"));
  var os = __importStar(require("os"));
  var utils_1 = require_utils();
  function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
      throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs2.existsSync(filePath)) {
      throw new Error(`Missing file at path: ${filePath}`);
    }
    fs2.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
      encoding: "utf8"
    });
  }
  exports2.issueCommand = issueCommand;
});

// node_modules/@actions/core/lib/core.js
var require_core = __commonJS((exports2) => {
  "use strict";
  var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var __importStar = exports2 && exports2.__importStar || function(mod) {
    if (mod && mod.__esModule)
      return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod)
        if (Object.hasOwnProperty.call(mod, k))
          result[k] = mod[k];
    }
    result["default"] = mod;
    return result;
  };
  Object.defineProperty(exports2, "__esModule", {value: true});
  var command_1 = require_command();
  var file_command_1 = require_file_command();
  var utils_1 = require_utils();
  var os = __importStar(require("os"));
  var path = __importStar(require("path"));
  var ExitCode;
  (function(ExitCode2) {
    ExitCode2[ExitCode2["Success"] = 0] = "Success";
    ExitCode2[ExitCode2["Failure"] = 1] = "Failure";
  })(ExitCode = exports2.ExitCode || (exports2.ExitCode = {}));
  function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env["GITHUB_ENV"] || "";
    if (filePath) {
      const delimiter = "_GitHubActionsFileCommandDelimeter_";
      const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
      file_command_1.issueCommand("ENV", commandValue);
    } else {
      command_1.issueCommand("set-env", {name}, convertedVal);
    }
  }
  exports2.exportVariable = exportVariable;
  function setSecret(secret) {
    command_1.issueCommand("add-mask", {}, secret);
  }
  exports2.setSecret = setSecret;
  function addPath(inputPath) {
    const filePath = process.env["GITHUB_PATH"] || "";
    if (filePath) {
      file_command_1.issueCommand("PATH", inputPath);
    } else {
      command_1.issueCommand("add-path", {}, inputPath);
    }
    process.env["PATH"] = `${inputPath}${path.delimiter}${process.env["PATH"]}`;
  }
  exports2.addPath = addPath;
  function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, "_").toUpperCase()}`] || "";
    if (options && options.required && !val) {
      throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
  }
  exports2.getInput = getInput;
  function setOutput(name, value) {
    command_1.issueCommand("set-output", {name}, value);
  }
  exports2.setOutput = setOutput;
  function setCommandEcho(enabled) {
    command_1.issue("echo", enabled ? "on" : "off");
  }
  exports2.setCommandEcho = setCommandEcho;
  function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
  }
  exports2.setFailed = setFailed;
  function isDebug() {
    return process.env["RUNNER_DEBUG"] === "1";
  }
  exports2.isDebug = isDebug;
  function debug(message) {
    command_1.issueCommand("debug", {}, message);
  }
  exports2.debug = debug;
  function error(message) {
    command_1.issue("error", message instanceof Error ? message.toString() : message);
  }
  exports2.error = error;
  function warning(message) {
    command_1.issue("warning", message instanceof Error ? message.toString() : message);
  }
  exports2.warning = warning;
  function info(message) {
    process.stdout.write(message + os.EOL);
  }
  exports2.info = info;
  function startGroup(name) {
    command_1.issue("group", name);
  }
  exports2.startGroup = startGroup;
  function endGroup() {
    command_1.issue("endgroup");
  }
  exports2.endGroup = endGroup;
  function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
      startGroup(name);
      let result;
      try {
        result = yield fn();
      } finally {
        endGroup();
      }
      return result;
    });
  }
  exports2.group = group;
  function saveState(name, value) {
    command_1.issueCommand("save-state", {name}, value);
  }
  exports2.saveState = saveState;
  function getState(name) {
    return process.env[`STATE_${name}`] || "";
  }
  exports2.getState = getState;
});

// node_modules/fast-xml-parser/src/util.js
var require_util = __commonJS((exports2) => {
  "use strict";
  var nameStartChar = ":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
  var nameChar = nameStartChar + "\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
  var nameRegexp = "[" + nameStartChar + "][" + nameChar + "]*";
  var regexName = new RegExp("^" + nameRegexp + "$");
  var getAllMatches = function(string, regex) {
    const matches = [];
    let match = regex.exec(string);
    while (match) {
      const allmatches = [];
      const len = match.length;
      for (let index = 0; index < len; index++) {
        allmatches.push(match[index]);
      }
      matches.push(allmatches);
      match = regex.exec(string);
    }
    return matches;
  };
  var isName = function(string) {
    const match = regexName.exec(string);
    return !(match === null || typeof match === "undefined");
  };
  exports2.isExist = function(v) {
    return typeof v !== "undefined";
  };
  exports2.isEmptyObject = function(obj) {
    return Object.keys(obj).length === 0;
  };
  exports2.merge = function(target, a, arrayMode) {
    if (a) {
      const keys = Object.keys(a);
      const len = keys.length;
      for (let i = 0; i < len; i++) {
        if (arrayMode === "strict") {
          target[keys[i]] = [a[keys[i]]];
        } else {
          target[keys[i]] = a[keys[i]];
        }
      }
    }
  };
  exports2.getValue = function(v) {
    if (exports2.isExist(v)) {
      return v;
    } else {
      return "";
    }
  };
  exports2.buildOptions = function(options, defaultOptions, props) {
    var newOptions = {};
    if (!options) {
      return defaultOptions;
    }
    for (let i = 0; i < props.length; i++) {
      if (options[props[i]] !== void 0) {
        newOptions[props[i]] = options[props[i]];
      } else {
        newOptions[props[i]] = defaultOptions[props[i]];
      }
    }
    return newOptions;
  };
  exports2.isTagNameInArrayMode = function(tagName, arrayMode, parentTagName) {
    if (arrayMode === false) {
      return false;
    } else if (arrayMode instanceof RegExp) {
      return arrayMode.test(tagName);
    } else if (typeof arrayMode === "function") {
      return !!arrayMode(tagName, parentTagName);
    }
    return arrayMode === "strict";
  };
  exports2.isName = isName;
  exports2.getAllMatches = getAllMatches;
  exports2.nameRegexp = nameRegexp;
});

// node_modules/fast-xml-parser/src/node2json.js
var require_node2json = __commonJS((exports2) => {
  "use strict";
  var util = require_util();
  var convertToJson = function(node, options, parentTagName) {
    const jObj = {};
    if ((!node.child || util.isEmptyObject(node.child)) && (!node.attrsMap || util.isEmptyObject(node.attrsMap))) {
      return util.isExist(node.val) ? node.val : "";
    }
    if (util.isExist(node.val) && !(typeof node.val === "string" && (node.val === "" || node.val === options.cdataPositionChar))) {
      const asArray = util.isTagNameInArrayMode(node.tagname, options.arrayMode, parentTagName);
      jObj[options.textNodeName] = asArray ? [node.val] : node.val;
    }
    util.merge(jObj, node.attrsMap, options.arrayMode);
    const keys = Object.keys(node.child);
    for (let index = 0; index < keys.length; index++) {
      const tagName = keys[index];
      if (node.child[tagName] && node.child[tagName].length > 1) {
        jObj[tagName] = [];
        for (let tag in node.child[tagName]) {
          if (node.child[tagName].hasOwnProperty(tag)) {
            jObj[tagName].push(convertToJson(node.child[tagName][tag], options, tagName));
          }
        }
      } else {
        const result = convertToJson(node.child[tagName][0], options, tagName);
        const asArray = options.arrayMode === true && typeof result === "object" || util.isTagNameInArrayMode(tagName, options.arrayMode, parentTagName);
        jObj[tagName] = asArray ? [result] : result;
      }
    }
    return jObj;
  };
  exports2.convertToJson = convertToJson;
});

// node_modules/fast-xml-parser/src/xmlNode.js
var require_xmlNode = __commonJS((exports2, module2) => {
  "use strict";
  module2.exports = function(tagname, parent, val) {
    this.tagname = tagname;
    this.parent = parent;
    this.child = {};
    this.attrsMap = {};
    this.val = val;
    this.addChild = function(child) {
      if (Array.isArray(this.child[child.tagname])) {
        this.child[child.tagname].push(child);
      } else {
        this.child[child.tagname] = [child];
      }
    };
  };
});

// node_modules/fast-xml-parser/src/xmlstr2xmlnode.js
var require_xmlstr2xmlnode = __commonJS((exports2) => {
  "use strict";
  var util = require_util();
  var buildOptions = require_util().buildOptions;
  var xmlNode = require_xmlNode();
  var regx = "<((!\\[CDATA\\[([\\s\\S]*?)(]]>))|((NAME:)?(NAME))([^>]*)>|((\\/)(NAME)\\s*>))([^<]*)".replace(/NAME/g, util.nameRegexp);
  if (!Number.parseInt && window.parseInt) {
    Number.parseInt = window.parseInt;
  }
  if (!Number.parseFloat && window.parseFloat) {
    Number.parseFloat = window.parseFloat;
  }
  var defaultOptions = {
    attributeNamePrefix: "@_",
    attrNodeName: false,
    textNodeName: "#text",
    ignoreAttributes: true,
    ignoreNameSpace: false,
    allowBooleanAttributes: false,
    parseNodeValue: true,
    parseAttributeValue: false,
    arrayMode: false,
    trimValues: true,
    cdataTagName: false,
    cdataPositionChar: "\\c",
    tagValueProcessor: function(a, tagName) {
      return a;
    },
    attrValueProcessor: function(a, attrName) {
      return a;
    },
    stopNodes: []
  };
  exports2.defaultOptions = defaultOptions;
  var props = [
    "attributeNamePrefix",
    "attrNodeName",
    "textNodeName",
    "ignoreAttributes",
    "ignoreNameSpace",
    "allowBooleanAttributes",
    "parseNodeValue",
    "parseAttributeValue",
    "arrayMode",
    "trimValues",
    "cdataTagName",
    "cdataPositionChar",
    "tagValueProcessor",
    "attrValueProcessor",
    "parseTrueNumberOnly",
    "stopNodes"
  ];
  exports2.props = props;
  function processTagValue(tagName, val, options) {
    if (val) {
      if (options.trimValues) {
        val = val.trim();
      }
      val = options.tagValueProcessor(val, tagName);
      val = parseValue(val, options.parseNodeValue, options.parseTrueNumberOnly);
    }
    return val;
  }
  function resolveNameSpace(tagname, options) {
    if (options.ignoreNameSpace) {
      const tags = tagname.split(":");
      const prefix = tagname.charAt(0) === "/" ? "/" : "";
      if (tags[0] === "xmlns") {
        return "";
      }
      if (tags.length === 2) {
        tagname = prefix + tags[1];
      }
    }
    return tagname;
  }
  function parseValue(val, shouldParse, parseTrueNumberOnly) {
    if (shouldParse && typeof val === "string") {
      let parsed;
      if (val.trim() === "" || isNaN(val)) {
        parsed = val === "true" ? true : val === "false" ? false : val;
      } else {
        if (val.indexOf("0x") !== -1) {
          parsed = Number.parseInt(val, 16);
        } else if (val.indexOf(".") !== -1) {
          parsed = Number.parseFloat(val);
          val = val.replace(/\.?0+$/, "");
        } else {
          parsed = Number.parseInt(val, 10);
        }
        if (parseTrueNumberOnly) {
          parsed = String(parsed) === val ? parsed : val;
        }
      }
      return parsed;
    } else {
      if (util.isExist(val)) {
        return val;
      } else {
        return "";
      }
    }
  }
  var attrsRegx = new RegExp(`([^\\s=]+)\\s*(=\\s*(['"])(.*?)\\3)?`, "g");
  function buildAttributesMap(attrStr, options) {
    if (!options.ignoreAttributes && typeof attrStr === "string") {
      attrStr = attrStr.replace(/\r?\n/g, " ");
      const matches = util.getAllMatches(attrStr, attrsRegx);
      const len = matches.length;
      const attrs = {};
      for (let i = 0; i < len; i++) {
        const attrName = resolveNameSpace(matches[i][1], options);
        if (attrName.length) {
          if (matches[i][4] !== void 0) {
            if (options.trimValues) {
              matches[i][4] = matches[i][4].trim();
            }
            matches[i][4] = options.attrValueProcessor(matches[i][4], attrName);
            attrs[options.attributeNamePrefix + attrName] = parseValue(matches[i][4], options.parseAttributeValue, options.parseTrueNumberOnly);
          } else if (options.allowBooleanAttributes) {
            attrs[options.attributeNamePrefix + attrName] = true;
          }
        }
      }
      if (!Object.keys(attrs).length) {
        return;
      }
      if (options.attrNodeName) {
        const attrCollection = {};
        attrCollection[options.attrNodeName] = attrs;
        return attrCollection;
      }
      return attrs;
    }
  }
  var getTraversalObj = function(xmlData, options) {
    xmlData = xmlData.replace(/\r\n?/g, "\n");
    options = buildOptions(options, defaultOptions, props);
    const xmlObj = new xmlNode("!xml");
    let currentNode = xmlObj;
    let textData = "";
    for (let i = 0; i < xmlData.length; i++) {
      const ch = xmlData[i];
      if (ch === "<") {
        if (xmlData[i + 1] === "/") {
          const closeIndex = findClosingIndex(xmlData, ">", i, "Closing Tag is not closed.");
          let tagName = xmlData.substring(i + 2, closeIndex).trim();
          if (options.ignoreNameSpace) {
            const colonIndex = tagName.indexOf(":");
            if (colonIndex !== -1) {
              tagName = tagName.substr(colonIndex + 1);
            }
          }
          if (currentNode) {
            if (currentNode.val) {
              currentNode.val = util.getValue(currentNode.val) + "" + processTagValue(tagName, textData, options);
            } else {
              currentNode.val = processTagValue(tagName, textData, options);
            }
          }
          if (options.stopNodes.length && options.stopNodes.includes(currentNode.tagname)) {
            currentNode.child = [];
            if (currentNode.attrsMap == void 0) {
              currentNode.attrsMap = {};
            }
            currentNode.val = xmlData.substr(currentNode.startIndex + 1, i - currentNode.startIndex - 1);
          }
          currentNode = currentNode.parent;
          textData = "";
          i = closeIndex;
        } else if (xmlData[i + 1] === "?") {
          i = findClosingIndex(xmlData, "?>", i, "Pi Tag is not closed.");
        } else if (xmlData.substr(i + 1, 3) === "!--") {
          i = findClosingIndex(xmlData, "-->", i, "Comment is not closed.");
        } else if (xmlData.substr(i + 1, 2) === "!D") {
          const closeIndex = findClosingIndex(xmlData, ">", i, "DOCTYPE is not closed.");
          const tagExp = xmlData.substring(i, closeIndex);
          if (tagExp.indexOf("[") >= 0) {
            i = xmlData.indexOf("]>", i) + 1;
          } else {
            i = closeIndex;
          }
        } else if (xmlData.substr(i + 1, 2) === "![") {
          const closeIndex = findClosingIndex(xmlData, "]]>", i, "CDATA is not closed.") - 2;
          const tagExp = xmlData.substring(i + 9, closeIndex);
          if (textData) {
            currentNode.val = util.getValue(currentNode.val) + "" + processTagValue(currentNode.tagname, textData, options);
            textData = "";
          }
          if (options.cdataTagName) {
            const childNode = new xmlNode(options.cdataTagName, currentNode, tagExp);
            currentNode.addChild(childNode);
            currentNode.val = util.getValue(currentNode.val) + options.cdataPositionChar;
            if (tagExp) {
              childNode.val = tagExp;
            }
          } else {
            currentNode.val = (currentNode.val || "") + (tagExp || "");
          }
          i = closeIndex + 2;
        } else {
          const result = closingIndexForOpeningTag(xmlData, i + 1);
          let tagExp = result.data;
          const closeIndex = result.index;
          const separatorIndex = tagExp.indexOf(" ");
          let tagName = tagExp;
          let shouldBuildAttributesMap = true;
          if (separatorIndex !== -1) {
            tagName = tagExp.substr(0, separatorIndex).replace(/\s\s*$/, "");
            tagExp = tagExp.substr(separatorIndex + 1);
          }
          if (options.ignoreNameSpace) {
            const colonIndex = tagName.indexOf(":");
            if (colonIndex !== -1) {
              tagName = tagName.substr(colonIndex + 1);
              shouldBuildAttributesMap = tagName !== result.data.substr(colonIndex + 1);
            }
          }
          if (currentNode && textData) {
            if (currentNode.tagname !== "!xml") {
              currentNode.val = util.getValue(currentNode.val) + "" + processTagValue(currentNode.tagname, textData, options);
            }
          }
          if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
            if (tagName[tagName.length - 1] === "/") {
              tagName = tagName.substr(0, tagName.length - 1);
              tagExp = tagName;
            } else {
              tagExp = tagExp.substr(0, tagExp.length - 1);
            }
            const childNode = new xmlNode(tagName, currentNode, "");
            if (tagName !== tagExp) {
              childNode.attrsMap = buildAttributesMap(tagExp, options);
            }
            currentNode.addChild(childNode);
          } else {
            const childNode = new xmlNode(tagName, currentNode);
            if (options.stopNodes.length && options.stopNodes.includes(childNode.tagname)) {
              childNode.startIndex = closeIndex;
            }
            if (tagName !== tagExp && shouldBuildAttributesMap) {
              childNode.attrsMap = buildAttributesMap(tagExp, options);
            }
            currentNode.addChild(childNode);
            currentNode = childNode;
          }
          textData = "";
          i = closeIndex;
        }
      } else {
        textData += xmlData[i];
      }
    }
    return xmlObj;
  };
  function closingIndexForOpeningTag(data, i) {
    let attrBoundary;
    let tagExp = "";
    for (let index = i; index < data.length; index++) {
      let ch = data[index];
      if (attrBoundary) {
        if (ch === attrBoundary)
          attrBoundary = "";
      } else if (ch === '"' || ch === "'") {
        attrBoundary = ch;
      } else if (ch === ">") {
        return {
          data: tagExp,
          index
        };
      } else if (ch === "	") {
        ch = " ";
      }
      tagExp += ch;
    }
  }
  function findClosingIndex(xmlData, str, i, errMsg) {
    const closingIndex = xmlData.indexOf(str, i);
    if (closingIndex === -1) {
      throw new Error(errMsg);
    } else {
      return closingIndex + str.length - 1;
    }
  }
  exports2.getTraversalObj = getTraversalObj;
});

// node_modules/fast-xml-parser/src/validator.js
var require_validator = __commonJS((exports2) => {
  "use strict";
  var util = require_util();
  var defaultOptions = {
    allowBooleanAttributes: false
  };
  var props = ["allowBooleanAttributes"];
  exports2.validate = function(xmlData, options) {
    options = util.buildOptions(options, defaultOptions, props);
    const tags = [];
    let tagFound = false;
    let reachedRoot = false;
    if (xmlData[0] === "\uFEFF") {
      xmlData = xmlData.substr(1);
    }
    for (let i = 0; i < xmlData.length; i++) {
      if (xmlData[i] === "<" && xmlData[i + 1] === "?") {
        i += 2;
        i = readPI(xmlData, i);
        if (i.err)
          return i;
      } else if (xmlData[i] === "<") {
        i++;
        if (xmlData[i] === "!") {
          i = readCommentAndCDATA(xmlData, i);
          continue;
        } else {
          let closingTag = false;
          if (xmlData[i] === "/") {
            closingTag = true;
            i++;
          }
          let tagName = "";
          for (; i < xmlData.length && xmlData[i] !== ">" && xmlData[i] !== " " && xmlData[i] !== "	" && xmlData[i] !== "\n" && xmlData[i] !== "\r"; i++) {
            tagName += xmlData[i];
          }
          tagName = tagName.trim();
          if (tagName[tagName.length - 1] === "/") {
            tagName = tagName.substring(0, tagName.length - 1);
            i--;
          }
          if (!validateTagName(tagName)) {
            let msg;
            if (tagName.trim().length === 0) {
              msg = "There is an unnecessary space between tag name and backward slash '</ ..'.";
            } else {
              msg = "Tag '" + tagName + "' is an invalid name.";
            }
            return getErrorObject("InvalidTag", msg, getLineNumberForPosition(xmlData, i));
          }
          const result = readAttributeStr(xmlData, i);
          if (result === false) {
            return getErrorObject("InvalidAttr", "Attributes for '" + tagName + "' have open quote.", getLineNumberForPosition(xmlData, i));
          }
          let attrStr = result.value;
          i = result.index;
          if (attrStr[attrStr.length - 1] === "/") {
            attrStr = attrStr.substring(0, attrStr.length - 1);
            const isValid = validateAttributeString(attrStr, options);
            if (isValid === true) {
              tagFound = true;
            } else {
              return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, i - attrStr.length + isValid.err.line));
            }
          } else if (closingTag) {
            if (!result.tagClosed) {
              return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' doesn't have proper closing.", getLineNumberForPosition(xmlData, i));
            } else if (attrStr.trim().length > 0) {
              return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' can't have attributes or invalid starting.", getLineNumberForPosition(xmlData, i));
            } else {
              const otg = tags.pop();
              if (tagName !== otg) {
                return getErrorObject("InvalidTag", "Closing tag '" + otg + "' is expected inplace of '" + tagName + "'.", getLineNumberForPosition(xmlData, i));
              }
              if (tags.length == 0) {
                reachedRoot = true;
              }
            }
          } else {
            const isValid = validateAttributeString(attrStr, options);
            if (isValid !== true) {
              return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, i - attrStr.length + isValid.err.line));
            }
            if (reachedRoot === true) {
              return getErrorObject("InvalidXml", "Multiple possible root nodes found.", getLineNumberForPosition(xmlData, i));
            } else {
              tags.push(tagName);
            }
            tagFound = true;
          }
          for (i++; i < xmlData.length; i++) {
            if (xmlData[i] === "<") {
              if (xmlData[i + 1] === "!") {
                i++;
                i = readCommentAndCDATA(xmlData, i);
                continue;
              } else if (xmlData[i + 1] === "?") {
                i = readPI(xmlData, ++i);
                if (i.err)
                  return i;
              } else {
                break;
              }
            } else if (xmlData[i] === "&") {
              const afterAmp = validateAmpersand(xmlData, i);
              if (afterAmp == -1)
                return getErrorObject("InvalidChar", "char '&' is not expected.", getLineNumberForPosition(xmlData, i));
              i = afterAmp;
            }
          }
          if (xmlData[i] === "<") {
            i--;
          }
        }
      } else {
        if (xmlData[i] === " " || xmlData[i] === "	" || xmlData[i] === "\n" || xmlData[i] === "\r") {
          continue;
        }
        return getErrorObject("InvalidChar", "char '" + xmlData[i] + "' is not expected.", getLineNumberForPosition(xmlData, i));
      }
    }
    if (!tagFound) {
      return getErrorObject("InvalidXml", "Start tag expected.", 1);
    } else if (tags.length > 0) {
      return getErrorObject("InvalidXml", "Invalid '" + JSON.stringify(tags, null, 4).replace(/\r?\n/g, "") + "' found.", 1);
    }
    return true;
  };
  function readPI(xmlData, i) {
    var start = i;
    for (; i < xmlData.length; i++) {
      if (xmlData[i] == "?" || xmlData[i] == " ") {
        var tagname = xmlData.substr(start, i - start);
        if (i > 5 && tagname === "xml") {
          return getErrorObject("InvalidXml", "XML declaration allowed only at the start of the document.", getLineNumberForPosition(xmlData, i));
        } else if (xmlData[i] == "?" && xmlData[i + 1] == ">") {
          i++;
          break;
        } else {
          continue;
        }
      }
    }
    return i;
  }
  function readCommentAndCDATA(xmlData, i) {
    if (xmlData.length > i + 5 && xmlData[i + 1] === "-" && xmlData[i + 2] === "-") {
      for (i += 3; i < xmlData.length; i++) {
        if (xmlData[i] === "-" && xmlData[i + 1] === "-" && xmlData[i + 2] === ">") {
          i += 2;
          break;
        }
      }
    } else if (xmlData.length > i + 8 && xmlData[i + 1] === "D" && xmlData[i + 2] === "O" && xmlData[i + 3] === "C" && xmlData[i + 4] === "T" && xmlData[i + 5] === "Y" && xmlData[i + 6] === "P" && xmlData[i + 7] === "E") {
      let angleBracketsCount = 1;
      for (i += 8; i < xmlData.length; i++) {
        if (xmlData[i] === "<") {
          angleBracketsCount++;
        } else if (xmlData[i] === ">") {
          angleBracketsCount--;
          if (angleBracketsCount === 0) {
            break;
          }
        }
      }
    } else if (xmlData.length > i + 9 && xmlData[i + 1] === "[" && xmlData[i + 2] === "C" && xmlData[i + 3] === "D" && xmlData[i + 4] === "A" && xmlData[i + 5] === "T" && xmlData[i + 6] === "A" && xmlData[i + 7] === "[") {
      for (i += 8; i < xmlData.length; i++) {
        if (xmlData[i] === "]" && xmlData[i + 1] === "]" && xmlData[i + 2] === ">") {
          i += 2;
          break;
        }
      }
    }
    return i;
  }
  var doubleQuote = '"';
  var singleQuote = "'";
  function readAttributeStr(xmlData, i) {
    let attrStr = "";
    let startChar = "";
    let tagClosed = false;
    for (; i < xmlData.length; i++) {
      if (xmlData[i] === doubleQuote || xmlData[i] === singleQuote) {
        if (startChar === "") {
          startChar = xmlData[i];
        } else if (startChar !== xmlData[i]) {
          continue;
        } else {
          startChar = "";
        }
      } else if (xmlData[i] === ">") {
        if (startChar === "") {
          tagClosed = true;
          break;
        }
      }
      attrStr += xmlData[i];
    }
    if (startChar !== "") {
      return false;
    }
    return {
      value: attrStr,
      index: i,
      tagClosed
    };
  }
  var validAttrStrRegxp = new RegExp(`(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['"])(([\\s\\S])*?)\\5)?`, "g");
  function validateAttributeString(attrStr, options) {
    const matches = util.getAllMatches(attrStr, validAttrStrRegxp);
    const attrNames = {};
    for (let i = 0; i < matches.length; i++) {
      if (matches[i][1].length === 0) {
        return getErrorObject("InvalidAttr", "Attribute '" + matches[i][2] + "' has no space in starting.", getPositionFromMatch(attrStr, matches[i][0]));
      } else if (matches[i][3] === void 0 && !options.allowBooleanAttributes) {
        return getErrorObject("InvalidAttr", "boolean attribute '" + matches[i][2] + "' is not allowed.", getPositionFromMatch(attrStr, matches[i][0]));
      }
      const attrName = matches[i][2];
      if (!validateAttrName(attrName)) {
        return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is an invalid name.", getPositionFromMatch(attrStr, matches[i][0]));
      }
      if (!attrNames.hasOwnProperty(attrName)) {
        attrNames[attrName] = 1;
      } else {
        return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is repeated.", getPositionFromMatch(attrStr, matches[i][0]));
      }
    }
    return true;
  }
  function validateNumberAmpersand(xmlData, i) {
    let re = /\d/;
    if (xmlData[i] === "x") {
      i++;
      re = /[\da-fA-F]/;
    }
    for (; i < xmlData.length; i++) {
      if (xmlData[i] === ";")
        return i;
      if (!xmlData[i].match(re))
        break;
    }
    return -1;
  }
  function validateAmpersand(xmlData, i) {
    i++;
    if (xmlData[i] === ";")
      return -1;
    if (xmlData[i] === "#") {
      i++;
      return validateNumberAmpersand(xmlData, i);
    }
    let count = 0;
    for (; i < xmlData.length; i++, count++) {
      if (xmlData[i].match(/\w/) && count < 20)
        continue;
      if (xmlData[i] === ";")
        break;
      return -1;
    }
    return i;
  }
  function getErrorObject(code, message, lineNumber) {
    return {
      err: {
        code,
        msg: message,
        line: lineNumber
      }
    };
  }
  function validateAttrName(attrName) {
    return util.isName(attrName);
  }
  function validateTagName(tagname) {
    return util.isName(tagname);
  }
  function getLineNumberForPosition(xmlData, index) {
    var lines = xmlData.substring(0, index).split(/\r?\n/);
    return lines.length;
  }
  function getPositionFromMatch(attrStr, match) {
    return attrStr.indexOf(match) + match.length;
  }
});

// node_modules/fast-xml-parser/src/nimndata.js
var require_nimndata = __commonJS((exports2) => {
  "use strict";
  var char = function(a) {
    return String.fromCharCode(a);
  };
  var chars = {
    nilChar: char(176),
    missingChar: char(201),
    nilPremitive: char(175),
    missingPremitive: char(200),
    emptyChar: char(178),
    emptyValue: char(177),
    boundryChar: char(179),
    objStart: char(198),
    arrStart: char(204),
    arrayEnd: char(185)
  };
  var charsArr = [
    chars.nilChar,
    chars.nilPremitive,
    chars.missingChar,
    chars.missingPremitive,
    chars.boundryChar,
    chars.emptyChar,
    chars.emptyValue,
    chars.arrayEnd,
    chars.objStart,
    chars.arrStart
  ];
  var _e = function(node, e_schema, options) {
    if (typeof e_schema === "string") {
      if (node && node[0] && node[0].val !== void 0) {
        return getValue(node[0].val, e_schema);
      } else {
        return getValue(node, e_schema);
      }
    } else {
      const hasValidData = hasData(node);
      if (hasValidData === true) {
        let str = "";
        if (Array.isArray(e_schema)) {
          str += chars.arrStart;
          const itemSchema = e_schema[0];
          const arr_len = node.length;
          if (typeof itemSchema === "string") {
            for (let arr_i = 0; arr_i < arr_len; arr_i++) {
              const r = getValue(node[arr_i].val, itemSchema);
              str = processValue(str, r);
            }
          } else {
            for (let arr_i = 0; arr_i < arr_len; arr_i++) {
              const r = _e(node[arr_i], itemSchema, options);
              str = processValue(str, r);
            }
          }
          str += chars.arrayEnd;
        } else {
          str += chars.objStart;
          const keys = Object.keys(e_schema);
          if (Array.isArray(node)) {
            node = node[0];
          }
          for (let i in keys) {
            const key = keys[i];
            let r;
            if (!options.ignoreAttributes && node.attrsMap && node.attrsMap[key]) {
              r = _e(node.attrsMap[key], e_schema[key], options);
            } else if (key === options.textNodeName) {
              r = _e(node.val, e_schema[key], options);
            } else {
              r = _e(node.child[key], e_schema[key], options);
            }
            str = processValue(str, r);
          }
        }
        return str;
      } else {
        return hasValidData;
      }
    }
  };
  var getValue = function(a) {
    switch (a) {
      case void 0:
        return chars.missingPremitive;
      case null:
        return chars.nilPremitive;
      case "":
        return chars.emptyValue;
      default:
        return a;
    }
  };
  var processValue = function(str, r) {
    if (!isAppChar(r[0]) && !isAppChar(str[str.length - 1])) {
      str += chars.boundryChar;
    }
    return str + r;
  };
  var isAppChar = function(ch) {
    return charsArr.indexOf(ch) !== -1;
  };
  function hasData(jObj) {
    if (jObj === void 0) {
      return chars.missingChar;
    } else if (jObj === null) {
      return chars.nilChar;
    } else if (jObj.child && Object.keys(jObj.child).length === 0 && (!jObj.attrsMap || Object.keys(jObj.attrsMap).length === 0)) {
      return chars.emptyChar;
    } else {
      return true;
    }
  }
  var x2j = require_xmlstr2xmlnode();
  var buildOptions = require_util().buildOptions;
  var convert2nimn = function(node, e_schema, options) {
    options = buildOptions(options, x2j.defaultOptions, x2j.props);
    return _e(node, e_schema, options);
  };
  exports2.convert2nimn = convert2nimn;
});

// node_modules/fast-xml-parser/src/node2json_str.js
var require_node2json_str = __commonJS((exports2) => {
  "use strict";
  var util = require_util();
  var buildOptions = require_util().buildOptions;
  var x2j = require_xmlstr2xmlnode();
  var convertToJsonString = function(node, options) {
    options = buildOptions(options, x2j.defaultOptions, x2j.props);
    options.indentBy = options.indentBy || "";
    return _cToJsonStr(node, options, 0);
  };
  var _cToJsonStr = function(node, options, level) {
    let jObj = "{";
    const keys = Object.keys(node.child);
    for (let index = 0; index < keys.length; index++) {
      var tagname = keys[index];
      if (node.child[tagname] && node.child[tagname].length > 1) {
        jObj += '"' + tagname + '" : [ ';
        for (var tag in node.child[tagname]) {
          jObj += _cToJsonStr(node.child[tagname][tag], options) + " , ";
        }
        jObj = jObj.substr(0, jObj.length - 1) + " ] ";
      } else {
        jObj += '"' + tagname + '" : ' + _cToJsonStr(node.child[tagname][0], options) + " ,";
      }
    }
    util.merge(jObj, node.attrsMap);
    if (util.isEmptyObject(jObj)) {
      return util.isExist(node.val) ? node.val : "";
    } else {
      if (util.isExist(node.val)) {
        if (!(typeof node.val === "string" && (node.val === "" || node.val === options.cdataPositionChar))) {
          jObj += '"' + options.textNodeName + '" : ' + stringval(node.val);
        }
      }
    }
    if (jObj[jObj.length - 1] === ",") {
      jObj = jObj.substr(0, jObj.length - 2);
    }
    return jObj + "}";
  };
  function stringval(v) {
    if (v === true || v === false || !isNaN(v)) {
      return v;
    } else {
      return '"' + v + '"';
    }
  }
  exports2.convertToJsonString = convertToJsonString;
});

// node_modules/fast-xml-parser/src/json2xml.js
var require_json2xml = __commonJS((exports2, module2) => {
  "use strict";
  var buildOptions = require_util().buildOptions;
  var defaultOptions = {
    attributeNamePrefix: "@_",
    attrNodeName: false,
    textNodeName: "#text",
    ignoreAttributes: true,
    cdataTagName: false,
    cdataPositionChar: "\\c",
    format: false,
    indentBy: "  ",
    supressEmptyNode: false,
    tagValueProcessor: function(a) {
      return a;
    },
    attrValueProcessor: function(a) {
      return a;
    }
  };
  var props = [
    "attributeNamePrefix",
    "attrNodeName",
    "textNodeName",
    "ignoreAttributes",
    "cdataTagName",
    "cdataPositionChar",
    "format",
    "indentBy",
    "supressEmptyNode",
    "tagValueProcessor",
    "attrValueProcessor"
  ];
  function Parser(options) {
    this.options = buildOptions(options, defaultOptions, props);
    if (this.options.ignoreAttributes || this.options.attrNodeName) {
      this.isAttribute = function() {
        return false;
      };
    } else {
      this.attrPrefixLen = this.options.attributeNamePrefix.length;
      this.isAttribute = isAttribute;
    }
    if (this.options.cdataTagName) {
      this.isCDATA = isCDATA;
    } else {
      this.isCDATA = function() {
        return false;
      };
    }
    this.replaceCDATAstr = replaceCDATAstr;
    this.replaceCDATAarr = replaceCDATAarr;
    if (this.options.format) {
      this.indentate = indentate;
      this.tagEndChar = ">\n";
      this.newLine = "\n";
    } else {
      this.indentate = function() {
        return "";
      };
      this.tagEndChar = ">";
      this.newLine = "";
    }
    if (this.options.supressEmptyNode) {
      this.buildTextNode = buildEmptyTextNode;
      this.buildObjNode = buildEmptyObjNode;
    } else {
      this.buildTextNode = buildTextValNode;
      this.buildObjNode = buildObjectNode;
    }
    this.buildTextValNode = buildTextValNode;
    this.buildObjectNode = buildObjectNode;
  }
  Parser.prototype.parse = function(jObj) {
    return this.j2x(jObj, 0).val;
  };
  Parser.prototype.j2x = function(jObj, level) {
    let attrStr = "";
    let val = "";
    const keys = Object.keys(jObj);
    const len = keys.length;
    for (let i = 0; i < len; i++) {
      const key = keys[i];
      if (typeof jObj[key] === "undefined") {
      } else if (jObj[key] === null) {
        val += this.indentate(level) + "<" + key + "/" + this.tagEndChar;
      } else if (jObj[key] instanceof Date) {
        val += this.buildTextNode(jObj[key], key, "", level);
      } else if (typeof jObj[key] !== "object") {
        const attr = this.isAttribute(key);
        if (attr) {
          attrStr += " " + attr + '="' + this.options.attrValueProcessor("" + jObj[key]) + '"';
        } else if (this.isCDATA(key)) {
          if (jObj[this.options.textNodeName]) {
            val += this.replaceCDATAstr(jObj[this.options.textNodeName], jObj[key]);
          } else {
            val += this.replaceCDATAstr("", jObj[key]);
          }
        } else {
          if (key === this.options.textNodeName) {
            if (jObj[this.options.cdataTagName]) {
            } else {
              val += this.options.tagValueProcessor("" + jObj[key]);
            }
          } else {
            val += this.buildTextNode(jObj[key], key, "", level);
          }
        }
      } else if (Array.isArray(jObj[key])) {
        if (this.isCDATA(key)) {
          val += this.indentate(level);
          if (jObj[this.options.textNodeName]) {
            val += this.replaceCDATAarr(jObj[this.options.textNodeName], jObj[key]);
          } else {
            val += this.replaceCDATAarr("", jObj[key]);
          }
        } else {
          const arrLen = jObj[key].length;
          for (let j = 0; j < arrLen; j++) {
            const item = jObj[key][j];
            if (typeof item === "undefined") {
            } else if (item === null) {
              val += this.indentate(level) + "<" + key + "/" + this.tagEndChar;
            } else if (typeof item === "object") {
              const result = this.j2x(item, level + 1);
              val += this.buildObjNode(result.val, key, result.attrStr, level);
            } else {
              val += this.buildTextNode(item, key, "", level);
            }
          }
        }
      } else {
        if (this.options.attrNodeName && key === this.options.attrNodeName) {
          const Ks = Object.keys(jObj[key]);
          const L = Ks.length;
          for (let j = 0; j < L; j++) {
            attrStr += " " + Ks[j] + '="' + this.options.attrValueProcessor("" + jObj[key][Ks[j]]) + '"';
          }
        } else {
          const result = this.j2x(jObj[key], level + 1);
          val += this.buildObjNode(result.val, key, result.attrStr, level);
        }
      }
    }
    return {attrStr, val};
  };
  function replaceCDATAstr(str, cdata) {
    str = this.options.tagValueProcessor("" + str);
    if (this.options.cdataPositionChar === "" || str === "") {
      return str + "<![CDATA[" + cdata + "]]" + this.tagEndChar;
    } else {
      return str.replace(this.options.cdataPositionChar, "<![CDATA[" + cdata + "]]" + this.tagEndChar);
    }
  }
  function replaceCDATAarr(str, cdata) {
    str = this.options.tagValueProcessor("" + str);
    if (this.options.cdataPositionChar === "" || str === "") {
      return str + "<![CDATA[" + cdata.join("]]><![CDATA[") + "]]" + this.tagEndChar;
    } else {
      for (let v in cdata) {
        str = str.replace(this.options.cdataPositionChar, "<![CDATA[" + cdata[v] + "]]>");
      }
      return str + this.newLine;
    }
  }
  function buildObjectNode(val, key, attrStr, level) {
    if (attrStr && !val.includes("<")) {
      return this.indentate(level) + "<" + key + attrStr + ">" + val + "</" + key + this.tagEndChar;
    } else {
      return this.indentate(level) + "<" + key + attrStr + this.tagEndChar + val + this.indentate(level) + "</" + key + this.tagEndChar;
    }
  }
  function buildEmptyObjNode(val, key, attrStr, level) {
    if (val !== "") {
      return this.buildObjectNode(val, key, attrStr, level);
    } else {
      return this.indentate(level) + "<" + key + attrStr + "/" + this.tagEndChar;
    }
  }
  function buildTextValNode(val, key, attrStr, level) {
    return this.indentate(level) + "<" + key + attrStr + ">" + this.options.tagValueProcessor(val) + "</" + key + this.tagEndChar;
  }
  function buildEmptyTextNode(val, key, attrStr, level) {
    if (val !== "") {
      return this.buildTextValNode(val, key, attrStr, level);
    } else {
      return this.indentate(level) + "<" + key + attrStr + "/" + this.tagEndChar;
    }
  }
  function indentate(level) {
    return this.options.indentBy.repeat(level);
  }
  function isAttribute(name) {
    if (name.startsWith(this.options.attributeNamePrefix)) {
      return name.substr(this.attrPrefixLen);
    } else {
      return false;
    }
  }
  function isCDATA(name) {
    return name === this.options.cdataTagName;
  }
  module2.exports = Parser;
});

// node_modules/fast-xml-parser/src/parser.js
var require_parser = __commonJS((exports2) => {
  "use strict";
  var nodeToJson = require_node2json();
  var xmlToNodeobj = require_xmlstr2xmlnode();
  var x2xmlnode = require_xmlstr2xmlnode();
  var buildOptions = require_util().buildOptions;
  var validator = require_validator();
  exports2.parse = function(xmlData, options, validationOption) {
    if (validationOption) {
      if (validationOption === true)
        validationOption = {};
      const result = validator.validate(xmlData, validationOption);
      if (result !== true) {
        throw Error(result.err.msg);
      }
    }
    options = buildOptions(options, x2xmlnode.defaultOptions, x2xmlnode.props);
    const traversableObj = xmlToNodeobj.getTraversalObj(xmlData, options);
    return nodeToJson.convertToJson(traversableObj, options);
  };
  exports2.convertTonimn = require_nimndata().convert2nimn;
  exports2.getTraversalObj = xmlToNodeobj.getTraversalObj;
  exports2.convertToJson = nodeToJson.convertToJson;
  exports2.convertToJsonString = require_node2json_str().convertToJsonString;
  exports2.validate = validator.validate;
  exports2.j2xParser = require_json2xml();
  exports2.parseToNimn = function(xmlData, schema, options) {
    return exports2.convertTonimn(exports2.getTraversalObj(xmlData, options), schema, options);
  };
});

// exec.js
var require_exec = __commonJS((exports2, module2) => {
  var {spawn} = require("child_process");
  var exec2 = (cmd, args = [], options = {}) => new Promise((resolve, reject) => {
    let outputData = "";
    const optionsToCLI = {
      ...options
    };
    if (!optionsToCLI.stdio) {
      Object.assign(optionsToCLI, {stdio: ["inherit", "inherit", "inherit"]});
    }
    const app = spawn(cmd, args, optionsToCLI);
    if (app.stdout) {
      app.stdout.on("data", function(data) {
        outputData += data.toString();
      });
    }
    app.on("close", (code) => {
      if (code !== 0) {
        return reject({code, outputData});
      }
      return resolve({code, outputData});
    });
    app.on("error", () => reject({code: 1, outputData}));
  });
  module2.exports = exec2;
});

// node_modules/lodash/_arrayMap.js
var require_arrayMap = __commonJS((exports2, module2) => {
  function arrayMap(array, iteratee) {
    var index = -1, length = array == null ? 0 : array.length, result = Array(length);
    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }
  module2.exports = arrayMap;
});

// node_modules/lodash/isArray.js
var require_isArray = __commonJS((exports2, module2) => {
  var isArray = Array.isArray;
  module2.exports = isArray;
});

// node_modules/lodash/_freeGlobal.js
var require_freeGlobal = __commonJS((exports2, module2) => {
  var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
  module2.exports = freeGlobal;
});

// node_modules/lodash/_root.js
var require_root = __commonJS((exports2, module2) => {
  var freeGlobal = require_freeGlobal();
  var freeSelf = typeof self == "object" && self && self.Object === Object && self;
  var root = freeGlobal || freeSelf || Function("return this")();
  module2.exports = root;
});

// node_modules/lodash/_Symbol.js
var require_Symbol = __commonJS((exports2, module2) => {
  var root = require_root();
  var Symbol = root.Symbol;
  module2.exports = Symbol;
});

// node_modules/lodash/_getRawTag.js
var require_getRawTag = __commonJS((exports2, module2) => {
  var Symbol = require_Symbol();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var nativeObjectToString = objectProto.toString;
  var symToStringTag = Symbol ? Symbol.toStringTag : void 0;
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
    try {
      value[symToStringTag] = void 0;
      var unmasked = true;
    } catch (e) {
    }
    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }
  module2.exports = getRawTag;
});

// node_modules/lodash/_objectToString.js
var require_objectToString = __commonJS((exports2, module2) => {
  var objectProto = Object.prototype;
  var nativeObjectToString = objectProto.toString;
  function objectToString(value) {
    return nativeObjectToString.call(value);
  }
  module2.exports = objectToString;
});

// node_modules/lodash/_baseGetTag.js
var require_baseGetTag = __commonJS((exports2, module2) => {
  var Symbol = require_Symbol();
  var getRawTag = require_getRawTag();
  var objectToString = require_objectToString();
  var nullTag = "[object Null]";
  var undefinedTag = "[object Undefined]";
  var symToStringTag = Symbol ? Symbol.toStringTag : void 0;
  function baseGetTag(value) {
    if (value == null) {
      return value === void 0 ? undefinedTag : nullTag;
    }
    return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
  }
  module2.exports = baseGetTag;
});

// node_modules/lodash/isObjectLike.js
var require_isObjectLike = __commonJS((exports2, module2) => {
  function isObjectLike(value) {
    return value != null && typeof value == "object";
  }
  module2.exports = isObjectLike;
});

// node_modules/lodash/isSymbol.js
var require_isSymbol = __commonJS((exports2, module2) => {
  var baseGetTag = require_baseGetTag();
  var isObjectLike = require_isObjectLike();
  var symbolTag = "[object Symbol]";
  function isSymbol(value) {
    return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
  }
  module2.exports = isSymbol;
});

// node_modules/lodash/_isKey.js
var require_isKey = __commonJS((exports2, module2) => {
  var isArray = require_isArray();
  var isSymbol = require_isSymbol();
  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
  var reIsPlainProp = /^\w*$/;
  function isKey(value, object) {
    if (isArray(value)) {
      return false;
    }
    var type = typeof value;
    if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
      return true;
    }
    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
  }
  module2.exports = isKey;
});

// node_modules/lodash/isObject.js
var require_isObject = __commonJS((exports2, module2) => {
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == "object" || type == "function");
  }
  module2.exports = isObject;
});

// node_modules/lodash/isFunction.js
var require_isFunction = __commonJS((exports2, module2) => {
  var baseGetTag = require_baseGetTag();
  var isObject = require_isObject();
  var asyncTag = "[object AsyncFunction]";
  var funcTag = "[object Function]";
  var genTag = "[object GeneratorFunction]";
  var proxyTag = "[object Proxy]";
  function isFunction(value) {
    if (!isObject(value)) {
      return false;
    }
    var tag = baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }
  module2.exports = isFunction;
});

// node_modules/lodash/_coreJsData.js
var require_coreJsData = __commonJS((exports2, module2) => {
  var root = require_root();
  var coreJsData = root["__core-js_shared__"];
  module2.exports = coreJsData;
});

// node_modules/lodash/_isMasked.js
var require_isMasked = __commonJS((exports2, module2) => {
  var coreJsData = require_coreJsData();
  var maskSrcKey = function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
    return uid ? "Symbol(src)_1." + uid : "";
  }();
  function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
  }
  module2.exports = isMasked;
});

// node_modules/lodash/_toSource.js
var require_toSource = __commonJS((exports2, module2) => {
  var funcProto = Function.prototype;
  var funcToString = funcProto.toString;
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {
      }
      try {
        return func + "";
      } catch (e) {
      }
    }
    return "";
  }
  module2.exports = toSource;
});

// node_modules/lodash/_baseIsNative.js
var require_baseIsNative = __commonJS((exports2, module2) => {
  var isFunction = require_isFunction();
  var isMasked = require_isMasked();
  var isObject = require_isObject();
  var toSource = require_toSource();
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  var funcProto = Function.prototype;
  var objectProto = Object.prototype;
  var funcToString = funcProto.toString;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }
  module2.exports = baseIsNative;
});

// node_modules/lodash/_getValue.js
var require_getValue = __commonJS((exports2, module2) => {
  function getValue(object, key) {
    return object == null ? void 0 : object[key];
  }
  module2.exports = getValue;
});

// node_modules/lodash/_getNative.js
var require_getNative = __commonJS((exports2, module2) => {
  var baseIsNative = require_baseIsNative();
  var getValue = require_getValue();
  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : void 0;
  }
  module2.exports = getNative;
});

// node_modules/lodash/_nativeCreate.js
var require_nativeCreate = __commonJS((exports2, module2) => {
  var getNative = require_getNative();
  var nativeCreate = getNative(Object, "create");
  module2.exports = nativeCreate;
});

// node_modules/lodash/_hashClear.js
var require_hashClear = __commonJS((exports2, module2) => {
  var nativeCreate = require_nativeCreate();
  function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
    this.size = 0;
  }
  module2.exports = hashClear;
});

// node_modules/lodash/_hashDelete.js
var require_hashDelete = __commonJS((exports2, module2) => {
  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }
  module2.exports = hashDelete;
});

// node_modules/lodash/_hashGet.js
var require_hashGet = __commonJS((exports2, module2) => {
  var nativeCreate = require_nativeCreate();
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? void 0 : result;
    }
    return hasOwnProperty.call(data, key) ? data[key] : void 0;
  }
  module2.exports = hashGet;
});

// node_modules/lodash/_hashHas.js
var require_hashHas = __commonJS((exports2, module2) => {
  var nativeCreate = require_nativeCreate();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
  }
  module2.exports = hashHas;
});

// node_modules/lodash/_hashSet.js
var require_hashSet = __commonJS((exports2, module2) => {
  var nativeCreate = require_nativeCreate();
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
    return this;
  }
  module2.exports = hashSet;
});

// node_modules/lodash/_Hash.js
var require_Hash = __commonJS((exports2, module2) => {
  var hashClear = require_hashClear();
  var hashDelete = require_hashDelete();
  var hashGet = require_hashGet();
  var hashHas = require_hashHas();
  var hashSet = require_hashSet();
  function Hash(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  Hash.prototype.clear = hashClear;
  Hash.prototype["delete"] = hashDelete;
  Hash.prototype.get = hashGet;
  Hash.prototype.has = hashHas;
  Hash.prototype.set = hashSet;
  module2.exports = Hash;
});

// node_modules/lodash/_listCacheClear.js
var require_listCacheClear = __commonJS((exports2, module2) => {
  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }
  module2.exports = listCacheClear;
});

// node_modules/lodash/eq.js
var require_eq = __commonJS((exports2, module2) => {
  function eq(value, other) {
    return value === other || value !== value && other !== other;
  }
  module2.exports = eq;
});

// node_modules/lodash/_assocIndexOf.js
var require_assocIndexOf = __commonJS((exports2, module2) => {
  var eq = require_eq();
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }
  module2.exports = assocIndexOf;
});

// node_modules/lodash/_listCacheDelete.js
var require_listCacheDelete = __commonJS((exports2, module2) => {
  var assocIndexOf = require_assocIndexOf();
  var arrayProto = Array.prototype;
  var splice = arrayProto.splice;
  function listCacheDelete(key) {
    var data = this.__data__, index = assocIndexOf(data, key);
    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    --this.size;
    return true;
  }
  module2.exports = listCacheDelete;
});

// node_modules/lodash/_listCacheGet.js
var require_listCacheGet = __commonJS((exports2, module2) => {
  var assocIndexOf = require_assocIndexOf();
  function listCacheGet(key) {
    var data = this.__data__, index = assocIndexOf(data, key);
    return index < 0 ? void 0 : data[index][1];
  }
  module2.exports = listCacheGet;
});

// node_modules/lodash/_listCacheHas.js
var require_listCacheHas = __commonJS((exports2, module2) => {
  var assocIndexOf = require_assocIndexOf();
  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
  }
  module2.exports = listCacheHas;
});

// node_modules/lodash/_listCacheSet.js
var require_listCacheSet = __commonJS((exports2, module2) => {
  var assocIndexOf = require_assocIndexOf();
  function listCacheSet(key, value) {
    var data = this.__data__, index = assocIndexOf(data, key);
    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }
  module2.exports = listCacheSet;
});

// node_modules/lodash/_ListCache.js
var require_ListCache = __commonJS((exports2, module2) => {
  var listCacheClear = require_listCacheClear();
  var listCacheDelete = require_listCacheDelete();
  var listCacheGet = require_listCacheGet();
  var listCacheHas = require_listCacheHas();
  var listCacheSet = require_listCacheSet();
  function ListCache(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  ListCache.prototype.clear = listCacheClear;
  ListCache.prototype["delete"] = listCacheDelete;
  ListCache.prototype.get = listCacheGet;
  ListCache.prototype.has = listCacheHas;
  ListCache.prototype.set = listCacheSet;
  module2.exports = ListCache;
});

// node_modules/lodash/_Map.js
var require_Map = __commonJS((exports2, module2) => {
  var getNative = require_getNative();
  var root = require_root();
  var Map = getNative(root, "Map");
  module2.exports = Map;
});

// node_modules/lodash/_mapCacheClear.js
var require_mapCacheClear = __commonJS((exports2, module2) => {
  var Hash = require_Hash();
  var ListCache = require_ListCache();
  var Map = require_Map();
  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      hash: new Hash(),
      map: new (Map || ListCache)(),
      string: new Hash()
    };
  }
  module2.exports = mapCacheClear;
});

// node_modules/lodash/_isKeyable.js
var require_isKeyable = __commonJS((exports2, module2) => {
  function isKeyable(value) {
    var type = typeof value;
    return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
  }
  module2.exports = isKeyable;
});

// node_modules/lodash/_getMapData.js
var require_getMapData = __commonJS((exports2, module2) => {
  var isKeyable = require_isKeyable();
  function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
  }
  module2.exports = getMapData;
});

// node_modules/lodash/_mapCacheDelete.js
var require_mapCacheDelete = __commonJS((exports2, module2) => {
  var getMapData = require_getMapData();
  function mapCacheDelete(key) {
    var result = getMapData(this, key)["delete"](key);
    this.size -= result ? 1 : 0;
    return result;
  }
  module2.exports = mapCacheDelete;
});

// node_modules/lodash/_mapCacheGet.js
var require_mapCacheGet = __commonJS((exports2, module2) => {
  var getMapData = require_getMapData();
  function mapCacheGet(key) {
    return getMapData(this, key).get(key);
  }
  module2.exports = mapCacheGet;
});

// node_modules/lodash/_mapCacheHas.js
var require_mapCacheHas = __commonJS((exports2, module2) => {
  var getMapData = require_getMapData();
  function mapCacheHas(key) {
    return getMapData(this, key).has(key);
  }
  module2.exports = mapCacheHas;
});

// node_modules/lodash/_mapCacheSet.js
var require_mapCacheSet = __commonJS((exports2, module2) => {
  var getMapData = require_getMapData();
  function mapCacheSet(key, value) {
    var data = getMapData(this, key), size = data.size;
    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }
  module2.exports = mapCacheSet;
});

// node_modules/lodash/_MapCache.js
var require_MapCache = __commonJS((exports2, module2) => {
  var mapCacheClear = require_mapCacheClear();
  var mapCacheDelete = require_mapCacheDelete();
  var mapCacheGet = require_mapCacheGet();
  var mapCacheHas = require_mapCacheHas();
  var mapCacheSet = require_mapCacheSet();
  function MapCache(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  MapCache.prototype.clear = mapCacheClear;
  MapCache.prototype["delete"] = mapCacheDelete;
  MapCache.prototype.get = mapCacheGet;
  MapCache.prototype.has = mapCacheHas;
  MapCache.prototype.set = mapCacheSet;
  module2.exports = MapCache;
});

// node_modules/lodash/memoize.js
var require_memoize = __commonJS((exports2, module2) => {
  var MapCache = require_MapCache();
  var FUNC_ERROR_TEXT = "Expected a function";
  function memoize(func, resolver) {
    if (typeof func != "function" || resolver != null && typeof resolver != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function() {
      var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result) || cache;
      return result;
    };
    memoized.cache = new (memoize.Cache || MapCache)();
    return memoized;
  }
  memoize.Cache = MapCache;
  module2.exports = memoize;
});

// node_modules/lodash/_memoizeCapped.js
var require_memoizeCapped = __commonJS((exports2, module2) => {
  var memoize = require_memoize();
  var MAX_MEMOIZE_SIZE = 500;
  function memoizeCapped(func) {
    var result = memoize(func, function(key) {
      if (cache.size === MAX_MEMOIZE_SIZE) {
        cache.clear();
      }
      return key;
    });
    var cache = result.cache;
    return result;
  }
  module2.exports = memoizeCapped;
});

// node_modules/lodash/_stringToPath.js
var require_stringToPath = __commonJS((exports2, module2) => {
  var memoizeCapped = require_memoizeCapped();
  var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
  var reEscapeChar = /\\(\\)?/g;
  var stringToPath = memoizeCapped(function(string) {
    var result = [];
    if (string.charCodeAt(0) === 46) {
      result.push("");
    }
    string.replace(rePropName, function(match, number, quote, subString) {
      result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
    });
    return result;
  });
  module2.exports = stringToPath;
});

// node_modules/lodash/_baseToString.js
var require_baseToString = __commonJS((exports2, module2) => {
  var Symbol = require_Symbol();
  var arrayMap = require_arrayMap();
  var isArray = require_isArray();
  var isSymbol = require_isSymbol();
  var INFINITY = 1 / 0;
  var symbolProto = Symbol ? Symbol.prototype : void 0;
  var symbolToString = symbolProto ? symbolProto.toString : void 0;
  function baseToString(value) {
    if (typeof value == "string") {
      return value;
    }
    if (isArray(value)) {
      return arrayMap(value, baseToString) + "";
    }
    if (isSymbol(value)) {
      return symbolToString ? symbolToString.call(value) : "";
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
  }
  module2.exports = baseToString;
});

// node_modules/lodash/toString.js
var require_toString = __commonJS((exports2, module2) => {
  var baseToString = require_baseToString();
  function toString(value) {
    return value == null ? "" : baseToString(value);
  }
  module2.exports = toString;
});

// node_modules/lodash/_castPath.js
var require_castPath = __commonJS((exports2, module2) => {
  var isArray = require_isArray();
  var isKey = require_isKey();
  var stringToPath = require_stringToPath();
  var toString = require_toString();
  function castPath(value, object) {
    if (isArray(value)) {
      return value;
    }
    return isKey(value, object) ? [value] : stringToPath(toString(value));
  }
  module2.exports = castPath;
});

// node_modules/lodash/_toKey.js
var require_toKey = __commonJS((exports2, module2) => {
  var isSymbol = require_isSymbol();
  var INFINITY = 1 / 0;
  function toKey(value) {
    if (typeof value == "string" || isSymbol(value)) {
      return value;
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
  }
  module2.exports = toKey;
});

// node_modules/lodash/_baseGet.js
var require_baseGet = __commonJS((exports2, module2) => {
  var castPath = require_castPath();
  var toKey = require_toKey();
  function baseGet(object, path) {
    path = castPath(path, object);
    var index = 0, length = path.length;
    while (object != null && index < length) {
      object = object[toKey(path[index++])];
    }
    return index && index == length ? object : void 0;
  }
  module2.exports = baseGet;
});

// node_modules/lodash/_stackClear.js
var require_stackClear = __commonJS((exports2, module2) => {
  var ListCache = require_ListCache();
  function stackClear() {
    this.__data__ = new ListCache();
    this.size = 0;
  }
  module2.exports = stackClear;
});

// node_modules/lodash/_stackDelete.js
var require_stackDelete = __commonJS((exports2, module2) => {
  function stackDelete(key) {
    var data = this.__data__, result = data["delete"](key);
    this.size = data.size;
    return result;
  }
  module2.exports = stackDelete;
});

// node_modules/lodash/_stackGet.js
var require_stackGet = __commonJS((exports2, module2) => {
  function stackGet(key) {
    return this.__data__.get(key);
  }
  module2.exports = stackGet;
});

// node_modules/lodash/_stackHas.js
var require_stackHas = __commonJS((exports2, module2) => {
  function stackHas(key) {
    return this.__data__.has(key);
  }
  module2.exports = stackHas;
});

// node_modules/lodash/_stackSet.js
var require_stackSet = __commonJS((exports2, module2) => {
  var ListCache = require_ListCache();
  var Map = require_Map();
  var MapCache = require_MapCache();
  var LARGE_ARRAY_SIZE = 200;
  function stackSet(key, value) {
    var data = this.__data__;
    if (data instanceof ListCache) {
      var pairs = data.__data__;
      if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
        pairs.push([key, value]);
        this.size = ++data.size;
        return this;
      }
      data = this.__data__ = new MapCache(pairs);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
  }
  module2.exports = stackSet;
});

// node_modules/lodash/_Stack.js
var require_Stack = __commonJS((exports2, module2) => {
  var ListCache = require_ListCache();
  var stackClear = require_stackClear();
  var stackDelete = require_stackDelete();
  var stackGet = require_stackGet();
  var stackHas = require_stackHas();
  var stackSet = require_stackSet();
  function Stack(entries) {
    var data = this.__data__ = new ListCache(entries);
    this.size = data.size;
  }
  Stack.prototype.clear = stackClear;
  Stack.prototype["delete"] = stackDelete;
  Stack.prototype.get = stackGet;
  Stack.prototype.has = stackHas;
  Stack.prototype.set = stackSet;
  module2.exports = Stack;
});

// node_modules/lodash/_setCacheAdd.js
var require_setCacheAdd = __commonJS((exports2, module2) => {
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  function setCacheAdd(value) {
    this.__data__.set(value, HASH_UNDEFINED);
    return this;
  }
  module2.exports = setCacheAdd;
});

// node_modules/lodash/_setCacheHas.js
var require_setCacheHas = __commonJS((exports2, module2) => {
  function setCacheHas(value) {
    return this.__data__.has(value);
  }
  module2.exports = setCacheHas;
});

// node_modules/lodash/_SetCache.js
var require_SetCache = __commonJS((exports2, module2) => {
  var MapCache = require_MapCache();
  var setCacheAdd = require_setCacheAdd();
  var setCacheHas = require_setCacheHas();
  function SetCache(values) {
    var index = -1, length = values == null ? 0 : values.length;
    this.__data__ = new MapCache();
    while (++index < length) {
      this.add(values[index]);
    }
  }
  SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
  SetCache.prototype.has = setCacheHas;
  module2.exports = SetCache;
});

// node_modules/lodash/_arraySome.js
var require_arraySome = __commonJS((exports2, module2) => {
  function arraySome(array, predicate) {
    var index = -1, length = array == null ? 0 : array.length;
    while (++index < length) {
      if (predicate(array[index], index, array)) {
        return true;
      }
    }
    return false;
  }
  module2.exports = arraySome;
});

// node_modules/lodash/_cacheHas.js
var require_cacheHas = __commonJS((exports2, module2) => {
  function cacheHas(cache, key) {
    return cache.has(key);
  }
  module2.exports = cacheHas;
});

// node_modules/lodash/_equalArrays.js
var require_equalArrays = __commonJS((exports2, module2) => {
  var SetCache = require_SetCache();
  var arraySome = require_arraySome();
  var cacheHas = require_cacheHas();
  var COMPARE_PARTIAL_FLAG = 1;
  var COMPARE_UNORDERED_FLAG = 2;
  function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
    if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
      return false;
    }
    var arrStacked = stack.get(array);
    var othStacked = stack.get(other);
    if (arrStacked && othStacked) {
      return arrStacked == other && othStacked == array;
    }
    var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : void 0;
    stack.set(array, other);
    stack.set(other, array);
    while (++index < arrLength) {
      var arrValue = array[index], othValue = other[index];
      if (customizer) {
        var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
      }
      if (compared !== void 0) {
        if (compared) {
          continue;
        }
        result = false;
        break;
      }
      if (seen) {
        if (!arraySome(other, function(othValue2, othIndex) {
          if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
            return seen.push(othIndex);
          }
        })) {
          result = false;
          break;
        }
      } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
        result = false;
        break;
      }
    }
    stack["delete"](array);
    stack["delete"](other);
    return result;
  }
  module2.exports = equalArrays;
});

// node_modules/lodash/_Uint8Array.js
var require_Uint8Array = __commonJS((exports2, module2) => {
  var root = require_root();
  var Uint8Array2 = root.Uint8Array;
  module2.exports = Uint8Array2;
});

// node_modules/lodash/_mapToArray.js
var require_mapToArray = __commonJS((exports2, module2) => {
  function mapToArray(map) {
    var index = -1, result = Array(map.size);
    map.forEach(function(value, key) {
      result[++index] = [key, value];
    });
    return result;
  }
  module2.exports = mapToArray;
});

// node_modules/lodash/_setToArray.js
var require_setToArray = __commonJS((exports2, module2) => {
  function setToArray(set) {
    var index = -1, result = Array(set.size);
    set.forEach(function(value) {
      result[++index] = value;
    });
    return result;
  }
  module2.exports = setToArray;
});

// node_modules/lodash/_equalByTag.js
var require_equalByTag = __commonJS((exports2, module2) => {
  var Symbol = require_Symbol();
  var Uint8Array2 = require_Uint8Array();
  var eq = require_eq();
  var equalArrays = require_equalArrays();
  var mapToArray = require_mapToArray();
  var setToArray = require_setToArray();
  var COMPARE_PARTIAL_FLAG = 1;
  var COMPARE_UNORDERED_FLAG = 2;
  var boolTag = "[object Boolean]";
  var dateTag = "[object Date]";
  var errorTag = "[object Error]";
  var mapTag = "[object Map]";
  var numberTag = "[object Number]";
  var regexpTag = "[object RegExp]";
  var setTag = "[object Set]";
  var stringTag = "[object String]";
  var symbolTag = "[object Symbol]";
  var arrayBufferTag = "[object ArrayBuffer]";
  var dataViewTag = "[object DataView]";
  var symbolProto = Symbol ? Symbol.prototype : void 0;
  var symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
  function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
    switch (tag) {
      case dataViewTag:
        if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
          return false;
        }
        object = object.buffer;
        other = other.buffer;
      case arrayBufferTag:
        if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array2(object), new Uint8Array2(other))) {
          return false;
        }
        return true;
      case boolTag:
      case dateTag:
      case numberTag:
        return eq(+object, +other);
      case errorTag:
        return object.name == other.name && object.message == other.message;
      case regexpTag:
      case stringTag:
        return object == other + "";
      case mapTag:
        var convert = mapToArray;
      case setTag:
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
        convert || (convert = setToArray);
        if (object.size != other.size && !isPartial) {
          return false;
        }
        var stacked = stack.get(object);
        if (stacked) {
          return stacked == other;
        }
        bitmask |= COMPARE_UNORDERED_FLAG;
        stack.set(object, other);
        var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
        stack["delete"](object);
        return result;
      case symbolTag:
        if (symbolValueOf) {
          return symbolValueOf.call(object) == symbolValueOf.call(other);
        }
    }
    return false;
  }
  module2.exports = equalByTag;
});

// node_modules/lodash/_arrayPush.js
var require_arrayPush = __commonJS((exports2, module2) => {
  function arrayPush(array, values) {
    var index = -1, length = values.length, offset = array.length;
    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }
  module2.exports = arrayPush;
});

// node_modules/lodash/_baseGetAllKeys.js
var require_baseGetAllKeys = __commonJS((exports2, module2) => {
  var arrayPush = require_arrayPush();
  var isArray = require_isArray();
  function baseGetAllKeys(object, keysFunc, symbolsFunc) {
    var result = keysFunc(object);
    return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
  }
  module2.exports = baseGetAllKeys;
});

// node_modules/lodash/_arrayFilter.js
var require_arrayFilter = __commonJS((exports2, module2) => {
  function arrayFilter(array, predicate) {
    var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[resIndex++] = value;
      }
    }
    return result;
  }
  module2.exports = arrayFilter;
});

// node_modules/lodash/stubArray.js
var require_stubArray = __commonJS((exports2, module2) => {
  function stubArray() {
    return [];
  }
  module2.exports = stubArray;
});

// node_modules/lodash/_getSymbols.js
var require_getSymbols = __commonJS((exports2, module2) => {
  var arrayFilter = require_arrayFilter();
  var stubArray = require_stubArray();
  var objectProto = Object.prototype;
  var propertyIsEnumerable = objectProto.propertyIsEnumerable;
  var nativeGetSymbols = Object.getOwnPropertySymbols;
  var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
    if (object == null) {
      return [];
    }
    object = Object(object);
    return arrayFilter(nativeGetSymbols(object), function(symbol) {
      return propertyIsEnumerable.call(object, symbol);
    });
  };
  module2.exports = getSymbols;
});

// node_modules/lodash/_baseTimes.js
var require_baseTimes = __commonJS((exports2, module2) => {
  function baseTimes(n, iteratee) {
    var index = -1, result = Array(n);
    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }
  module2.exports = baseTimes;
});

// node_modules/lodash/_baseIsArguments.js
var require_baseIsArguments = __commonJS((exports2, module2) => {
  var baseGetTag = require_baseGetTag();
  var isObjectLike = require_isObjectLike();
  var argsTag = "[object Arguments]";
  function baseIsArguments(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag;
  }
  module2.exports = baseIsArguments;
});

// node_modules/lodash/isArguments.js
var require_isArguments = __commonJS((exports2, module2) => {
  var baseIsArguments = require_baseIsArguments();
  var isObjectLike = require_isObjectLike();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var propertyIsEnumerable = objectProto.propertyIsEnumerable;
  var isArguments = baseIsArguments(function() {
    return arguments;
  }()) ? baseIsArguments : function(value) {
    return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
  };
  module2.exports = isArguments;
});

// node_modules/lodash/stubFalse.js
var require_stubFalse = __commonJS((exports2, module2) => {
  function stubFalse() {
    return false;
  }
  module2.exports = stubFalse;
});

// node_modules/lodash/isBuffer.js
var require_isBuffer = __commonJS((exports2, module2) => {
  var root = require_root();
  var stubFalse = require_stubFalse();
  var freeExports = typeof exports2 == "object" && exports2 && !exports2.nodeType && exports2;
  var freeModule = freeExports && typeof module2 == "object" && module2 && !module2.nodeType && module2;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var Buffer2 = moduleExports ? root.Buffer : void 0;
  var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
  var isBuffer = nativeIsBuffer || stubFalse;
  module2.exports = isBuffer;
});

// node_modules/lodash/_isIndex.js
var require_isIndex = __commonJS((exports2, module2) => {
  var MAX_SAFE_INTEGER = 9007199254740991;
  var reIsUint = /^(?:0|[1-9]\d*)$/;
  function isIndex(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER : length;
    return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
  }
  module2.exports = isIndex;
});

// node_modules/lodash/isLength.js
var require_isLength = __commonJS((exports2, module2) => {
  var MAX_SAFE_INTEGER = 9007199254740991;
  function isLength(value) {
    return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }
  module2.exports = isLength;
});

// node_modules/lodash/_baseIsTypedArray.js
var require_baseIsTypedArray = __commonJS((exports2, module2) => {
  var baseGetTag = require_baseGetTag();
  var isLength = require_isLength();
  var isObjectLike = require_isObjectLike();
  var argsTag = "[object Arguments]";
  var arrayTag = "[object Array]";
  var boolTag = "[object Boolean]";
  var dateTag = "[object Date]";
  var errorTag = "[object Error]";
  var funcTag = "[object Function]";
  var mapTag = "[object Map]";
  var numberTag = "[object Number]";
  var objectTag = "[object Object]";
  var regexpTag = "[object RegExp]";
  var setTag = "[object Set]";
  var stringTag = "[object String]";
  var weakMapTag = "[object WeakMap]";
  var arrayBufferTag = "[object ArrayBuffer]";
  var dataViewTag = "[object DataView]";
  var float32Tag = "[object Float32Array]";
  var float64Tag = "[object Float64Array]";
  var int8Tag = "[object Int8Array]";
  var int16Tag = "[object Int16Array]";
  var int32Tag = "[object Int32Array]";
  var uint8Tag = "[object Uint8Array]";
  var uint8ClampedTag = "[object Uint8ClampedArray]";
  var uint16Tag = "[object Uint16Array]";
  var uint32Tag = "[object Uint32Array]";
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
  function baseIsTypedArray(value) {
    return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
  }
  module2.exports = baseIsTypedArray;
});

// node_modules/lodash/_baseUnary.js
var require_baseUnary = __commonJS((exports2, module2) => {
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }
  module2.exports = baseUnary;
});

// node_modules/lodash/_nodeUtil.js
var require_nodeUtil = __commonJS((exports2, module2) => {
  var freeGlobal = require_freeGlobal();
  var freeExports = typeof exports2 == "object" && exports2 && !exports2.nodeType && exports2;
  var freeModule = freeExports && typeof module2 == "object" && module2 && !module2.nodeType && module2;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var freeProcess = moduleExports && freeGlobal.process;
  var nodeUtil = function() {
    try {
      var types = freeModule && freeModule.require && freeModule.require("util").types;
      if (types) {
        return types;
      }
      return freeProcess && freeProcess.binding && freeProcess.binding("util");
    } catch (e) {
    }
  }();
  module2.exports = nodeUtil;
});

// node_modules/lodash/isTypedArray.js
var require_isTypedArray = __commonJS((exports2, module2) => {
  var baseIsTypedArray = require_baseIsTypedArray();
  var baseUnary = require_baseUnary();
  var nodeUtil = require_nodeUtil();
  var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
  var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
  module2.exports = isTypedArray;
});

// node_modules/lodash/_arrayLikeKeys.js
var require_arrayLikeKeys = __commonJS((exports2, module2) => {
  var baseTimes = require_baseTimes();
  var isArguments = require_isArguments();
  var isArray = require_isArray();
  var isBuffer = require_isBuffer();
  var isIndex = require_isIndex();
  var isTypedArray = require_isTypedArray();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
    for (var key in value) {
      if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == "length" || isBuff && (key == "offset" || key == "parent") || isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || isIndex(key, length)))) {
        result.push(key);
      }
    }
    return result;
  }
  module2.exports = arrayLikeKeys;
});

// node_modules/lodash/_isPrototype.js
var require_isPrototype = __commonJS((exports2, module2) => {
  var objectProto = Object.prototype;
  function isPrototype(value) {
    var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
    return value === proto;
  }
  module2.exports = isPrototype;
});

// node_modules/lodash/_overArg.js
var require_overArg = __commonJS((exports2, module2) => {
  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }
  module2.exports = overArg;
});

// node_modules/lodash/_nativeKeys.js
var require_nativeKeys = __commonJS((exports2, module2) => {
  var overArg = require_overArg();
  var nativeKeys = overArg(Object.keys, Object);
  module2.exports = nativeKeys;
});

// node_modules/lodash/_baseKeys.js
var require_baseKeys = __commonJS((exports2, module2) => {
  var isPrototype = require_isPrototype();
  var nativeKeys = require_nativeKeys();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function baseKeys(object) {
    if (!isPrototype(object)) {
      return nativeKeys(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty.call(object, key) && key != "constructor") {
        result.push(key);
      }
    }
    return result;
  }
  module2.exports = baseKeys;
});

// node_modules/lodash/isArrayLike.js
var require_isArrayLike = __commonJS((exports2, module2) => {
  var isFunction = require_isFunction();
  var isLength = require_isLength();
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }
  module2.exports = isArrayLike;
});

// node_modules/lodash/keys.js
var require_keys = __commonJS((exports2, module2) => {
  var arrayLikeKeys = require_arrayLikeKeys();
  var baseKeys = require_baseKeys();
  var isArrayLike = require_isArrayLike();
  function keys(object) {
    return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
  }
  module2.exports = keys;
});

// node_modules/lodash/_getAllKeys.js
var require_getAllKeys = __commonJS((exports2, module2) => {
  var baseGetAllKeys = require_baseGetAllKeys();
  var getSymbols = require_getSymbols();
  var keys = require_keys();
  function getAllKeys(object) {
    return baseGetAllKeys(object, keys, getSymbols);
  }
  module2.exports = getAllKeys;
});

// node_modules/lodash/_equalObjects.js
var require_equalObjects = __commonJS((exports2, module2) => {
  var getAllKeys = require_getAllKeys();
  var COMPARE_PARTIAL_FLAG = 1;
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
    if (objLength != othLength && !isPartial) {
      return false;
    }
    var index = objLength;
    while (index--) {
      var key = objProps[index];
      if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
        return false;
      }
    }
    var objStacked = stack.get(object);
    var othStacked = stack.get(other);
    if (objStacked && othStacked) {
      return objStacked == other && othStacked == object;
    }
    var result = true;
    stack.set(object, other);
    stack.set(other, object);
    var skipCtor = isPartial;
    while (++index < objLength) {
      key = objProps[index];
      var objValue = object[key], othValue = other[key];
      if (customizer) {
        var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
      }
      if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
        result = false;
        break;
      }
      skipCtor || (skipCtor = key == "constructor");
    }
    if (result && !skipCtor) {
      var objCtor = object.constructor, othCtor = other.constructor;
      if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
        result = false;
      }
    }
    stack["delete"](object);
    stack["delete"](other);
    return result;
  }
  module2.exports = equalObjects;
});

// node_modules/lodash/_DataView.js
var require_DataView = __commonJS((exports2, module2) => {
  var getNative = require_getNative();
  var root = require_root();
  var DataView = getNative(root, "DataView");
  module2.exports = DataView;
});

// node_modules/lodash/_Promise.js
var require_Promise = __commonJS((exports2, module2) => {
  var getNative = require_getNative();
  var root = require_root();
  var Promise2 = getNative(root, "Promise");
  module2.exports = Promise2;
});

// node_modules/lodash/_Set.js
var require_Set = __commonJS((exports2, module2) => {
  var getNative = require_getNative();
  var root = require_root();
  var Set = getNative(root, "Set");
  module2.exports = Set;
});

// node_modules/lodash/_WeakMap.js
var require_WeakMap = __commonJS((exports2, module2) => {
  var getNative = require_getNative();
  var root = require_root();
  var WeakMap = getNative(root, "WeakMap");
  module2.exports = WeakMap;
});

// node_modules/lodash/_getTag.js
var require_getTag = __commonJS((exports2, module2) => {
  var DataView = require_DataView();
  var Map = require_Map();
  var Promise2 = require_Promise();
  var Set = require_Set();
  var WeakMap = require_WeakMap();
  var baseGetTag = require_baseGetTag();
  var toSource = require_toSource();
  var mapTag = "[object Map]";
  var objectTag = "[object Object]";
  var promiseTag = "[object Promise]";
  var setTag = "[object Set]";
  var weakMapTag = "[object WeakMap]";
  var dataViewTag = "[object DataView]";
  var dataViewCtorString = toSource(DataView);
  var mapCtorString = toSource(Map);
  var promiseCtorString = toSource(Promise2);
  var setCtorString = toSource(Set);
  var weakMapCtorString = toSource(WeakMap);
  var getTag = baseGetTag;
  if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set && getTag(new Set()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
    getTag = function(value) {
      var result = baseGetTag(value), Ctor = result == objectTag ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString:
            return dataViewTag;
          case mapCtorString:
            return mapTag;
          case promiseCtorString:
            return promiseTag;
          case setCtorString:
            return setTag;
          case weakMapCtorString:
            return weakMapTag;
        }
      }
      return result;
    };
  }
  module2.exports = getTag;
});

// node_modules/lodash/_baseIsEqualDeep.js
var require_baseIsEqualDeep = __commonJS((exports2, module2) => {
  var Stack = require_Stack();
  var equalArrays = require_equalArrays();
  var equalByTag = require_equalByTag();
  var equalObjects = require_equalObjects();
  var getTag = require_getTag();
  var isArray = require_isArray();
  var isBuffer = require_isBuffer();
  var isTypedArray = require_isTypedArray();
  var COMPARE_PARTIAL_FLAG = 1;
  var argsTag = "[object Arguments]";
  var arrayTag = "[object Array]";
  var objectTag = "[object Object]";
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
    var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
    objTag = objTag == argsTag ? objectTag : objTag;
    othTag = othTag == argsTag ? objectTag : othTag;
    var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
    if (isSameTag && isBuffer(object)) {
      if (!isBuffer(other)) {
        return false;
      }
      objIsArr = true;
      objIsObj = false;
    }
    if (isSameTag && !objIsObj) {
      stack || (stack = new Stack());
      return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
    }
    if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
      var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
      if (objIsWrapped || othIsWrapped) {
        var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
        stack || (stack = new Stack());
        return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
      }
    }
    if (!isSameTag) {
      return false;
    }
    stack || (stack = new Stack());
    return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
  }
  module2.exports = baseIsEqualDeep;
});

// node_modules/lodash/_baseIsEqual.js
var require_baseIsEqual = __commonJS((exports2, module2) => {
  var baseIsEqualDeep = require_baseIsEqualDeep();
  var isObjectLike = require_isObjectLike();
  function baseIsEqual(value, other, bitmask, customizer, stack) {
    if (value === other) {
      return true;
    }
    if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
      return value !== value && other !== other;
    }
    return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
  }
  module2.exports = baseIsEqual;
});

// node_modules/lodash/_baseIsMatch.js
var require_baseIsMatch = __commonJS((exports2, module2) => {
  var Stack = require_Stack();
  var baseIsEqual = require_baseIsEqual();
  var COMPARE_PARTIAL_FLAG = 1;
  var COMPARE_UNORDERED_FLAG = 2;
  function baseIsMatch(object, source, matchData, customizer) {
    var index = matchData.length, length = index, noCustomizer = !customizer;
    if (object == null) {
      return !length;
    }
    object = Object(object);
    while (index--) {
      var data = matchData[index];
      if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
        return false;
      }
    }
    while (++index < length) {
      data = matchData[index];
      var key = data[0], objValue = object[key], srcValue = data[1];
      if (noCustomizer && data[2]) {
        if (objValue === void 0 && !(key in object)) {
          return false;
        }
      } else {
        var stack = new Stack();
        if (customizer) {
          var result = customizer(objValue, srcValue, key, object, source, stack);
        }
        if (!(result === void 0 ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result)) {
          return false;
        }
      }
    }
    return true;
  }
  module2.exports = baseIsMatch;
});

// node_modules/lodash/_isStrictComparable.js
var require_isStrictComparable = __commonJS((exports2, module2) => {
  var isObject = require_isObject();
  function isStrictComparable(value) {
    return value === value && !isObject(value);
  }
  module2.exports = isStrictComparable;
});

// node_modules/lodash/_getMatchData.js
var require_getMatchData = __commonJS((exports2, module2) => {
  var isStrictComparable = require_isStrictComparable();
  var keys = require_keys();
  function getMatchData(object) {
    var result = keys(object), length = result.length;
    while (length--) {
      var key = result[length], value = object[key];
      result[length] = [key, value, isStrictComparable(value)];
    }
    return result;
  }
  module2.exports = getMatchData;
});

// node_modules/lodash/_matchesStrictComparable.js
var require_matchesStrictComparable = __commonJS((exports2, module2) => {
  function matchesStrictComparable(key, srcValue) {
    return function(object) {
      if (object == null) {
        return false;
      }
      return object[key] === srcValue && (srcValue !== void 0 || key in Object(object));
    };
  }
  module2.exports = matchesStrictComparable;
});

// node_modules/lodash/_baseMatches.js
var require_baseMatches = __commonJS((exports2, module2) => {
  var baseIsMatch = require_baseIsMatch();
  var getMatchData = require_getMatchData();
  var matchesStrictComparable = require_matchesStrictComparable();
  function baseMatches(source) {
    var matchData = getMatchData(source);
    if (matchData.length == 1 && matchData[0][2]) {
      return matchesStrictComparable(matchData[0][0], matchData[0][1]);
    }
    return function(object) {
      return object === source || baseIsMatch(object, source, matchData);
    };
  }
  module2.exports = baseMatches;
});

// node_modules/lodash/get.js
var require_get = __commonJS((exports2, module2) => {
  var baseGet = require_baseGet();
  function get(object, path, defaultValue) {
    var result = object == null ? void 0 : baseGet(object, path);
    return result === void 0 ? defaultValue : result;
  }
  module2.exports = get;
});

// node_modules/lodash/_baseHasIn.js
var require_baseHasIn = __commonJS((exports2, module2) => {
  function baseHasIn(object, key) {
    return object != null && key in Object(object);
  }
  module2.exports = baseHasIn;
});

// node_modules/lodash/_hasPath.js
var require_hasPath = __commonJS((exports2, module2) => {
  var castPath = require_castPath();
  var isArguments = require_isArguments();
  var isArray = require_isArray();
  var isIndex = require_isIndex();
  var isLength = require_isLength();
  var toKey = require_toKey();
  function hasPath(object, path, hasFunc) {
    path = castPath(path, object);
    var index = -1, length = path.length, result = false;
    while (++index < length) {
      var key = toKey(path[index]);
      if (!(result = object != null && hasFunc(object, key))) {
        break;
      }
      object = object[key];
    }
    if (result || ++index != length) {
      return result;
    }
    length = object == null ? 0 : object.length;
    return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
  }
  module2.exports = hasPath;
});

// node_modules/lodash/hasIn.js
var require_hasIn = __commonJS((exports2, module2) => {
  var baseHasIn = require_baseHasIn();
  var hasPath = require_hasPath();
  function hasIn(object, path) {
    return object != null && hasPath(object, path, baseHasIn);
  }
  module2.exports = hasIn;
});

// node_modules/lodash/_baseMatchesProperty.js
var require_baseMatchesProperty = __commonJS((exports2, module2) => {
  var baseIsEqual = require_baseIsEqual();
  var get = require_get();
  var hasIn = require_hasIn();
  var isKey = require_isKey();
  var isStrictComparable = require_isStrictComparable();
  var matchesStrictComparable = require_matchesStrictComparable();
  var toKey = require_toKey();
  var COMPARE_PARTIAL_FLAG = 1;
  var COMPARE_UNORDERED_FLAG = 2;
  function baseMatchesProperty(path, srcValue) {
    if (isKey(path) && isStrictComparable(srcValue)) {
      return matchesStrictComparable(toKey(path), srcValue);
    }
    return function(object) {
      var objValue = get(object, path);
      return objValue === void 0 && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
    };
  }
  module2.exports = baseMatchesProperty;
});

// node_modules/lodash/identity.js
var require_identity = __commonJS((exports2, module2) => {
  function identity(value) {
    return value;
  }
  module2.exports = identity;
});

// node_modules/lodash/_baseProperty.js
var require_baseProperty = __commonJS((exports2, module2) => {
  function baseProperty(key) {
    return function(object) {
      return object == null ? void 0 : object[key];
    };
  }
  module2.exports = baseProperty;
});

// node_modules/lodash/_basePropertyDeep.js
var require_basePropertyDeep = __commonJS((exports2, module2) => {
  var baseGet = require_baseGet();
  function basePropertyDeep(path) {
    return function(object) {
      return baseGet(object, path);
    };
  }
  module2.exports = basePropertyDeep;
});

// node_modules/lodash/property.js
var require_property = __commonJS((exports2, module2) => {
  var baseProperty = require_baseProperty();
  var basePropertyDeep = require_basePropertyDeep();
  var isKey = require_isKey();
  var toKey = require_toKey();
  function property(path) {
    return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
  }
  module2.exports = property;
});

// node_modules/lodash/_baseIteratee.js
var require_baseIteratee = __commonJS((exports2, module2) => {
  var baseMatches = require_baseMatches();
  var baseMatchesProperty = require_baseMatchesProperty();
  var identity = require_identity();
  var isArray = require_isArray();
  var property = require_property();
  function baseIteratee(value) {
    if (typeof value == "function") {
      return value;
    }
    if (value == null) {
      return identity;
    }
    if (typeof value == "object") {
      return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
    }
    return property(value);
  }
  module2.exports = baseIteratee;
});

// node_modules/lodash/_createBaseFor.js
var require_createBaseFor = __commonJS((exports2, module2) => {
  function createBaseFor(fromRight) {
    return function(object, iteratee, keysFunc) {
      var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
      while (length--) {
        var key = props[fromRight ? length : ++index];
        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }
      return object;
    };
  }
  module2.exports = createBaseFor;
});

// node_modules/lodash/_baseFor.js
var require_baseFor = __commonJS((exports2, module2) => {
  var createBaseFor = require_createBaseFor();
  var baseFor = createBaseFor();
  module2.exports = baseFor;
});

// node_modules/lodash/_baseForOwn.js
var require_baseForOwn = __commonJS((exports2, module2) => {
  var baseFor = require_baseFor();
  var keys = require_keys();
  function baseForOwn(object, iteratee) {
    return object && baseFor(object, iteratee, keys);
  }
  module2.exports = baseForOwn;
});

// node_modules/lodash/_createBaseEach.js
var require_createBaseEach = __commonJS((exports2, module2) => {
  var isArrayLike = require_isArrayLike();
  function createBaseEach(eachFunc, fromRight) {
    return function(collection, iteratee) {
      if (collection == null) {
        return collection;
      }
      if (!isArrayLike(collection)) {
        return eachFunc(collection, iteratee);
      }
      var length = collection.length, index = fromRight ? length : -1, iterable = Object(collection);
      while (fromRight ? index-- : ++index < length) {
        if (iteratee(iterable[index], index, iterable) === false) {
          break;
        }
      }
      return collection;
    };
  }
  module2.exports = createBaseEach;
});

// node_modules/lodash/_baseEach.js
var require_baseEach = __commonJS((exports2, module2) => {
  var baseForOwn = require_baseForOwn();
  var createBaseEach = require_createBaseEach();
  var baseEach = createBaseEach(baseForOwn);
  module2.exports = baseEach;
});

// node_modules/lodash/_baseMap.js
var require_baseMap = __commonJS((exports2, module2) => {
  var baseEach = require_baseEach();
  var isArrayLike = require_isArrayLike();
  function baseMap(collection, iteratee) {
    var index = -1, result = isArrayLike(collection) ? Array(collection.length) : [];
    baseEach(collection, function(value, key, collection2) {
      result[++index] = iteratee(value, key, collection2);
    });
    return result;
  }
  module2.exports = baseMap;
});

// node_modules/lodash/_baseSortBy.js
var require_baseSortBy = __commonJS((exports2, module2) => {
  function baseSortBy(array, comparer) {
    var length = array.length;
    array.sort(comparer);
    while (length--) {
      array[length] = array[length].value;
    }
    return array;
  }
  module2.exports = baseSortBy;
});

// node_modules/lodash/_compareAscending.js
var require_compareAscending = __commonJS((exports2, module2) => {
  var isSymbol = require_isSymbol();
  function compareAscending(value, other) {
    if (value !== other) {
      var valIsDefined = value !== void 0, valIsNull = value === null, valIsReflexive = value === value, valIsSymbol = isSymbol(value);
      var othIsDefined = other !== void 0, othIsNull = other === null, othIsReflexive = other === other, othIsSymbol = isSymbol(other);
      if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) {
        return 1;
      }
      if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) {
        return -1;
      }
    }
    return 0;
  }
  module2.exports = compareAscending;
});

// node_modules/lodash/_compareMultiple.js
var require_compareMultiple = __commonJS((exports2, module2) => {
  var compareAscending = require_compareAscending();
  function compareMultiple(object, other, orders) {
    var index = -1, objCriteria = object.criteria, othCriteria = other.criteria, length = objCriteria.length, ordersLength = orders.length;
    while (++index < length) {
      var result = compareAscending(objCriteria[index], othCriteria[index]);
      if (result) {
        if (index >= ordersLength) {
          return result;
        }
        var order = orders[index];
        return result * (order == "desc" ? -1 : 1);
      }
    }
    return object.index - other.index;
  }
  module2.exports = compareMultiple;
});

// node_modules/lodash/_baseOrderBy.js
var require_baseOrderBy = __commonJS((exports2, module2) => {
  var arrayMap = require_arrayMap();
  var baseGet = require_baseGet();
  var baseIteratee = require_baseIteratee();
  var baseMap = require_baseMap();
  var baseSortBy = require_baseSortBy();
  var baseUnary = require_baseUnary();
  var compareMultiple = require_compareMultiple();
  var identity = require_identity();
  var isArray = require_isArray();
  function baseOrderBy(collection, iteratees, orders) {
    if (iteratees.length) {
      iteratees = arrayMap(iteratees, function(iteratee) {
        if (isArray(iteratee)) {
          return function(value) {
            return baseGet(value, iteratee.length === 1 ? iteratee[0] : iteratee);
          };
        }
        return iteratee;
      });
    } else {
      iteratees = [identity];
    }
    var index = -1;
    iteratees = arrayMap(iteratees, baseUnary(baseIteratee));
    var result = baseMap(collection, function(value, key, collection2) {
      var criteria = arrayMap(iteratees, function(iteratee) {
        return iteratee(value);
      });
      return {criteria, index: ++index, value};
    });
    return baseSortBy(result, function(object, other) {
      return compareMultiple(object, other, orders);
    });
  }
  module2.exports = baseOrderBy;
});

// node_modules/lodash/orderBy.js
var require_orderBy = __commonJS((exports2, module2) => {
  var baseOrderBy = require_baseOrderBy();
  var isArray = require_isArray();
  function orderBy2(collection, iteratees, orders, guard) {
    if (collection == null) {
      return [];
    }
    if (!isArray(iteratees)) {
      iteratees = iteratees == null ? [] : [iteratees];
    }
    orders = guard ? void 0 : orders;
    if (!isArray(orders)) {
      orders = orders == null ? [] : [orders];
    }
    return baseOrderBy(collection, iteratees, orders);
  }
  module2.exports = orderBy2;
});

// index.js
var https = require("https");
var fs = require("fs");
var core = require_core();
var parser = require_parser();
var exec = require_exec();
var orderBy = require_orderBy();
var GOODREADS_USER_ID = core.getInput("goodreads_user_id");
var SHELF = core.getInput("shelf");
var MAX_BOOKS_COUNT = Number.parseInt(core.getInput("max_books_count"));
var README_FILE_PATH = core.getInput("readme_file_path");
var OUTPUT_ONLY = core.getInput("output_only").toLowerCase() === "true";
var TEMPLATE = core.getInput("template") || "- [$title]($url) by $author (\u2B50\uFE0F$average_rating)";
var COMMIT_MESSAGE = "Synced and updated with user's goodreads book lists";
var COMMITTER_USERNAME = "goodreads-books-bot";
var COMMITTER_EMAIL = "goodreads-books-bot@example.com";
var SORT_BY_FIELDS = core.getInput("sort_by_fields");
requestList(GOODREADS_USER_ID, SHELF).then(async (data) => {
  try {
    if (!data.rss.channel.item) {
      return;
    }
    const items = Array.isArray(data.rss.channel.item) ? data.rss.channel.item : [data.rss.channel.item];
    const sortedBooks = sort(items, SORT_BY_FIELDS);
    const books = sortedBooks.slice(0, MAX_BOOKS_COUNT);
    const readme = fs.readFileSync(README_FILE_PATH, "utf8");
    const updatedReadme = buildReadme(readme, books);
    if (readme !== updatedReadme) {
      core.info(`Writing to ${README_FILE_PATH}`);
      core.startGroup("New books found for update");
      books.forEach((book) => core.info(JSON.stringify(book)));
      core.endGroup();
      fs.writeFileSync(README_FILE_PATH, updatedReadme);
      if (!OUTPUT_ONLY) {
        await commitReadme();
      } else {
        core.setOutput("books", books);
        core.info("OUTPUT_ONLY: set `results` variable. Readme not committed.");
      }
    }
  } catch (err) {
    core.error(err);
    process.exit(1);
  }
}).then(() => {
  process.exit(0);
}).catch((err) => {
  core.error(err);
  process.exit(1);
});
function requestList(userId, shelf) {
  console.log("shelf", shelf);
  return new Promise((resolve, reject) => {
    https.request({
      host: "www.goodreads.com",
      path: `/review/list_rss/${userId}?shelf=${shelf}`
    }, (response) => {
      let data = "";
      response.on("data", (chunk) => data += chunk);
      response.on("end", () => resolve(parser.parse(data)));
      response.on("error", (err) => reject(err));
    }).end();
  });
}
function buildReadme(template2, books) {
  const tagName = core.getInput("comment_tag_name") || "GOODREADS-LIST";
  const startTag = `<!-- ${tagName}:START -->`;
  const endTag = `<!-- ${tagName}:END -->`;
  const hasRequiredComments = [startTag, endTag].every((tag) => template2.match(new RegExp(tag, "gm")));
  if (!hasRequiredComments) {
    core.error(`Cannot find the required comment tags (${startTag} and ${endTag}) to inject book titles.`);
    process.exit(1);
  } else {
    const startIndex = template2.indexOf(startTag);
    const endIndex = template2.indexOf(endTag);
    const replaceContent = buildBookList(books);
    return [
      template2.substring(0, startIndex + startTag.length),
      `
`,
      replaceContent,
      `
`,
      template2.substring(endIndex)
    ].join("");
  }
}
function buildBookList(books) {
  return books.map((book) => {
    return template(TEMPLATE, {
      title: book.title,
      url: book.link,
      author: book.author_name,
      published_year: book.book_published,
      average_rating: book.average_rating,
      my_rating: book.user_rating,
      my_rating_stars: book.user_rating ? "\u2B50".repeat(Number.parseInt(book.user_rating || "0")) : "unrated"
    });
  }).join(`
`);
}
function sort(books, sortString) {
  if (!sortString || sortString.length === 0) {
    return books;
  }
  var tokens = sortString.split(",");
  var sortTerms = tokens.map((v) => v.replace(/<|>/g, (x) => ""));
  var sortDirections = tokens.map((v) => v.indexOf("<") > -1 ? "asc" : "desc");
  return orderBy(books, sortTerms, sortDirections);
}
function template(template2, variables) {
  const regex = /\$([a-zA-Z_]*)/g;
  return template2.replace(regex, (match, content) => variables[content] || "");
}
async function commitReadme() {
  await exec("git", ["config", "--global", "user.email", COMMITTER_EMAIL]);
  await exec("git", ["config", "--global", "user.name", COMMITTER_USERNAME]);
  await exec("git", ["add", README_FILE_PATH]);
  await exec("git", ["commit", "-m", COMMIT_MESSAGE]);
  await exec("git", ["push"]);
  core.info("Readme updated successfully in the upstream repository");
  process.exit(0);
}
