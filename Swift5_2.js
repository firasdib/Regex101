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

  _escapeSwiftString(input) {
    // Simple search for a line break
    let isMultiline = input.match(/\n/g)
    // Wrap the string literal around # for each # found in the input string, plus 1 extra #
    var hashes = "#"
    while (input.search("#") != -1) {
      hashes += "#"
    }

    var result = hashes
    if (isMultiline) {
      result += "\"\"\"\n"
    } else {
      result += "\""
    }
    result += input
    if (isMultiline) {
      result += "\n\"\"\""
    } else {
      result += "\""
    }
    result += hashes

    return result
  }

  // Removes the value from the given array, if existent, and return whether a value was removed.
  // Requires the first argument to be an instance of array.
  _removeValueFromArray(array, value) {
    let indexOfValue = array.indexOf(value)
    if (indexOfValue > -1) {
      array.splice(indexOfValue, 1)
      return true
    } else {
      return false
    }
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

    const codeString = new CodeString()

    var options = []
    this._removeValueFromArray(flags, "g")
    if (this._removeValueFromArray(flags, "m")) {
      options.push(".anchorsMatchLines")
    }
    if (this._removeValueFromArray(flags, "i")) {
      options.push(".caseInsensitive")
    }
    if (this._removeValueFromArray(flags, "x")) {
      options.push(".allowCommentsAndWhitespace")
    }
    if (this._removeValueFromArray(flags, "s")) {
      options.push(".dotMatchesLineSeparators")
    }
    var formattedOptions = ""
    if (options.length == 1) {
      formattedOptions += ", options: "
      formattedOptions += options[0]
    } else if (options.length > 1) {
      formattedOptions += ", options: ["
      formattedOptions += options.join(", ")
      formattedOptions += "]"
    }

    // Generate code string
    codeString.append(`import Foundation`)
    codeString.append()
    codeString.append(`let pattern = ${this._escapeSwiftString(regex.toString())}`)
    codeString.append(`let regex = try! NSRegularExpression(pattern: pattern${formattedOptions})`)
    codeString.append(`let testString = ${this._escapeSwiftString(testString)}`)
    codeString.append(`let stringRange = NSRange(location: 0, length: testString.utf16.count)`)

    if (isSubstituting) {
      codeString.append(`let substitutionString = ${this._escapeSwiftString(substString)}`)
      if (isGlobal) {
        codeString.append(`let result = regex.stringByReplacingMatches(in: testString, range: stringRange, withTemplate: substitutionString)`)
        codeString.append(`print(result)`)
      } else {
        codeString.append(`let lookupRange = (testString as NSString).range(of: pattern, options: .regularExpression, range: stringRange)`)
        codeString.append(`if lookupRange.intersection(stringRange) != nil {`, 4)
        codeString.append(`let result = regex.stringByReplacingMatches(in: testString, range: lookupRange, withTemplate: substitutionString)`)
        codeString.append(`print(result)`, 0)
        codeString.append(`} else {`, 4)
        codeString.append(`print("No matches were found.")`, 0)
        codeString.append(`}`)
      }
    } else {
        if (isGlobal) {
          codeString.append(`let matches = regex.matches(in: testString, range: stringRange)`)
          codeString.append(`var result: [[String]] = []`)
          codeString.append(`for match in matches {`, 4)
          codeString.append(`var groups: [String] = []`)
          codeString.append(`for rangeIndex in 1 ..< match.numberOfRanges {`, 8)
          codeString.append(`groups.append((testString as NSString).substring(with: match.range(at: rangeIndex)))`, 4)
          codeString.append(`}`)
          codeString.append(`if !groups.isEmpty {`, 8)
          codeString.append(`result.append(groups)`, 4)
          codeString.append(`}`, 0)
          codeString.append(`}`)
          codeString.append(`print(result)`)
        } else {
          codeString.append(`if let firstMatch = regex.firstMatch(in: testString, range: stringRange) {`, 4)
          codeString.append(`let result: [String] = (1 ..< firstMatch.numberOfRanges).map { (testString as NSString).substring(with: firstMatch.range(at: $0)) }`)
          codeString.append(`print(result)`, 0)
          codeString.append(`} else {`, 4)
          codeString.append(`print("No matches were found.")`, 0)
          codeString.append(`}`)
        }
    }
    return codeString.toString()
  }
}

export default Swift5_2;
