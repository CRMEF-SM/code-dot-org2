var testUtils = require('./util/testUtils');
var assert = testUtils.assert;

describe("CommandHistory", function () {
  var CommandHistory = require('@cdo/apps/CommandHistory');
  var history, inputText;

  beforeEach(function () {
    history = new CommandHistory();
    inputText = '';
  });

  it('moving back through history recounts commands in reverse order', function () {
    history.push('one');
    history.push('two');
    history.push('three');
    inputText = history.goBack(inputText);
    assert.equal('three', inputText);
    inputText = history.goBack(inputText);
    assert.equal('two', inputText);
    inputText = history.goBack(inputText);
    assert.equal('one', inputText);
  });

  it('moving forward through history recounts commands in original order', function () {
    history.push('one');
    history.push('two');
    history.push('three');
    inputText = history.goBack(inputText);
    assert.equal('three', inputText);
    inputText = history.goBack(inputText);
    assert.equal('two', inputText);
    inputText = history.goBack(inputText);
    assert.equal('one', inputText);
    inputText = history.goForward(inputText);
    assert.equal('two', inputText);
    inputText = history.goForward(inputText);
    assert.equal('three', inputText);
  });

  it('trying to move back past beginning of history returns beginning of history', function () {
    history.push('one');
    history.push('two');
    inputText = history.goBack(inputText);
    assert.equal('two', inputText);
    inputText = history.goBack(inputText);
    assert.equal('one', inputText);
    inputText = history.goBack(inputText);
    assert.equal('one', inputText);
  });

  it('moving forward past beginning of history returns empty string', function () {
    history.push('one');
    inputText = history.goBack(inputText);
    assert.equal('one', inputText);
    inputText = history.goForward(inputText);
    assert.equal('', inputText);
    inputText = history.goForward(inputText);
    assert.equal('', inputText);
  });

  it('stores a maximum of 64 commands', function () {
    var i;
    for (i = 0; i < 65; i++) {
      history.push(i.toString());
    }

    // First 64 commands walking backward show up
    for (i = 64; i >= 1; i--) {
      inputText = history.goBack(inputText);
      assert.equal(i.toString(), inputText);
    }

    // 65th command does not
    inputText = history.goBack(inputText);
    assert.equal('1', inputText);
  });
});
