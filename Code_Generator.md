---
name: Code Generator
about: Submit a new Code Generator
labels: code generator swift

---

## Code Generator For Swift 5.2


### Code Snippet

```js

class Swift5_2 extends PureComponent {

  //
  // Proptypes

  static propTypes = {
    regex: PropTypes.string.isRequired,
    flags: PropTypes.string.isRequired,
    delimiter: PropTypes.string.isRequired,
    testString: PropTypes.string.isRequired,
    isSubstituting: PropTypes.bool.isRequired,
    isGlobal: PropTypes.bool.isRequired,
    substString: PropTypes.string
  };

  //
  // Control

  _escapeSwiftString(str, multiline) {
    let multiline = str.search(/\n/g) != -1
    
    var hashes = '#';
    while (str.search(hashes) != -1) {
      hashes += '#';
    }
    
    var escapedStr = hashes
    if (multiline) escapedStr += '"""\n'
    else escapedStr += '"'
    escapedStr += str
    if (multiline) escapedStr += '\n"""'
    else escapedStr += '"'
    escapedStr += hashes
    
    return escapedStr;
  }

  //
  // Render functions

  render() {
    return (
      <Highlight lang="swift">
        {this._renderCode()}
      </Highlight>
    );
  }

  _renderCode() {
    const { regex, flags, delimiter, testString, isSubstituting, substString, isGlobal } = this.props;

    const codeString = new CodeString();
    const isMultiline = flags.indexOf('x') != -1;

    codeString.append('import Foundation');
    codeString.append('');

    codeString.append(`let pattern = ${this._escapeSwiftString(regex)}`);
    codeString.append(`let testString = ${this._escapeSwiftString(testString)}`);
    codeString.append('');
    
    if (isSubstituting) {
      codeString.append(`let substString = ${this._escapeSwiftString(substString)}`);
      codeString.append('let result = testString.replacingOccurrences(of: pattern, with: substString, options: [.regularExpression' + (isGlobal ? ', .anchored' : '') + '])');
      codeString.append('print(result)');
        
    } else {
      codeString.append('let regex = try NSRegularExpression(pattern: pattern, options: ' + (isMultiline ? '.anchorsMatchLines' : '[]') + ')');
      codeString.append(`let nsrange = NSRange(testString.startIndex..<testString.endIndex, in: testString)`);
      codeString.append('');
      codeString.append('let matches = regex.matches(in: testString, options: ' + (isGlobal ? '.anchored' : '[]') + ', range: nsrange)');
      codeString.append('for match in matches {');
      codeString.append('guard let full = Range(match.range(at: 0), in: testString) else {', 1);
      codeString.append('continue', 2);
      codeString.append('}', 1);
      codeString.append(`print("Full match: \(testString[full])")`, 1);
      codeString.append('');
      codeString.append(`for i in 1..<match.numberOfRanges {`, 1);
      codeString.append(`guard let group = Range(match.range(at: 1), in: testString) else {`, 2);
      codeString.append('continue', 3);
      codeString.append('}', 2);
      codeString.append(`print("\tGroup \(i): \(testString[group])")`, 2);
      codeString.append('}', 1);
      codeString.append('}');
        
    }
    
    return codeString.toString();
  }

}

export default Swift5_2;

```
