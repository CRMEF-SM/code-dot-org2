import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {RubricUnderstandingLevels} from '@cdo/apps/util/sharedConstants';
import EditorAnnotator from '@cdo/apps/EditorAnnotator';
import LearningGoals, {
  clearAnnotations,
  annotateLines,
} from '@cdo/apps/templates/rubrics/LearningGoals';

describe('LearningGoals', () => {
  let annotatorStub,
    annotateLineStub,
    highlightLineStub,
    clearAnnotationsStub,
    clearHighlightedLinesStub;
  const studentLevelInfo = {name: 'Grace Hopper', timeSpent: 706};

  const learningGoals = [
    {
      id: 2,
      key: 'abcd',
      learningGoal: 'Testing 1',
      aiEnabled: true,
      evidenceLevels: [{id: 1, understanding: 1, teacherDescription: 'test'}],
      tips: 'Tips',
    },
    {
      key: 'efgh',
      learningGoal: 'Testing 2',
      aiEnabled: false,
      evidenceLevels: [{id: 1, understanding: 1, teacherDescription: 'test'}],
      tips: 'Tips',
    },
  ];

  const submittedEvaluation = {
    feedback: 'test feedback',
    understanding: RubricUnderstandingLevels.LIMITED,
  };

  const aiEvaluations = [
    {
      id: 2,
      learning_goal_id: 2,
      understanding: 2,
      ai_confidence: 50,
      observations:
        'Line 3-5: The sprite is defined here. `var sprite = createSprite(100, 120)`',
    },
  ];

  const code = `// code
    var x = 5;
    var y = 6;
    // add them together
    /*
    var z = x + y;
    */
    draw();
  `;

  // Stub out our references to the singleton and editor
  beforeEach(() => {
    let annotatorInstanceStub = sinon.stub();
    annotatorInstanceStub.getCode = sinon.stub().returns(code);
    annotatorStub = sinon
      .stub(EditorAnnotator, 'annotator')
      .returns(annotatorInstanceStub);
    annotateLineStub = sinon.stub(EditorAnnotator, 'annotateLine');
    clearAnnotationsStub = sinon.stub(EditorAnnotator, 'clearAnnotations');
    highlightLineStub = sinon.stub(EditorAnnotator, 'highlightLine');
    clearHighlightedLinesStub = sinon.stub(
      EditorAnnotator,
      'clearHighlightedLines'
    );
  });
  afterEach(() => {
    annotatorStub.restore();
    annotateLineStub.restore();
    clearAnnotationsStub.restore();
    highlightLineStub.restore();
    clearHighlightedLinesStub.restore();
  });

  describe('annotateLines', () => {
    it('should do nothing if the AI observation does not reference any lines', () => {
      // The AI tends to misreport the line number, so we shouldn't rely on it
      annotateLines('This is just a basic observation.');
      expect(annotateLineStub.notCalled).to.be.true;
    });

    it('should annotate a single line of code referenced by the AI', () => {
      // The AI tends to misreport the line number, so we shouldn't rely on it
      annotateLines('Line 1: This is a line of code `var x = 5;`');
      sinon.assert.calledWith(annotateLineStub, 2, 'This is a line of code');
    });

    it('should annotate the first line of code referenced by the AI', () => {
      annotateLines('Line 1: This is a line of code `var x = 5; var y = 6;`');
      sinon.assert.calledWith(annotateLineStub, 2, 'This is a line of code');
    });

    it('should highlight a single line of code referenced by the AI', () => {
      // The AI tends to misreport the line number, so we shouldn't rely on it
      annotateLines('Line 1: This is a line of code `var x = 5; var y = 6;`');
      sinon.assert.calledWith(highlightLineStub, 2);
    });

    it('should highlight all lines of code referenced by the AI', () => {
      annotateLines('Line 1: This is a line of code `var x = 5; var y = 6;`');
      sinon.assert.calledWith(highlightLineStub, 2);
      sinon.assert.calledWith(highlightLineStub, 3);
    });

    it('should just highlight the lines the AI thinks if the referenced code does not exist', () => {
      annotateLines('Line 45: This is a line of code `var z = 0`');
      sinon.assert.calledWith(annotateLineStub, 45, 'This is a line of code');
      sinon.assert.calledWith(highlightLineStub, 45);
    });

    it('should just highlight all of the lines the AI thinks if the referenced code does not exist', () => {
      annotateLines('Line 42-44: This is a line of code `var z = 0`');
      sinon.assert.calledWith(annotateLineStub, 42, 'This is a line of code');
      sinon.assert.calledWith(highlightLineStub, 42);
      sinon.assert.calledWith(highlightLineStub, 43);
      sinon.assert.calledWith(highlightLineStub, 44);
    });

    it('should annotate the last line of code when referenced by the AI', () => {
      annotateLines('Line 55: This is a line of code `draw();`');
      sinon.assert.calledWith(annotateLineStub, 8, 'This is a line of code');
    });

    it('should highlight the last line of code when referenced by the AI', () => {
      annotateLines('Line 55: This is a line of code `draw();`');
      sinon.assert.calledWith(highlightLineStub, 8);
    });

    it('should ignore code snippets that are empty', () => {
      annotateLines('Line 42: This is totally a thing ` `');
      sinon.assert.notCalled(highlightLineStub);
    });
  });

  describe('clearAnnotations', () => {
    it('should clear annotations and clear highlighted lines', () => {
      clearAnnotations();
      sinon.assert.called(clearAnnotationsStub);
      sinon.assert.called(clearHighlightedLinesStub);
    });
  });

  it('renders EvidenceLevels', () => {
    const wrapper = shallow(
      <LearningGoals learningGoals={learningGoals} teacherHasEnabledAi />
    );
    expect(wrapper.find('EvidenceLevels')).to.have.lengthOf(1);
    expect(wrapper.find('EvidenceLevels').props().evidenceLevels).to.deep.equal(
      [{id: 1, understanding: 1, teacherDescription: 'test'}]
    );
    expect(wrapper.find('SafeMarkdown')).to.have.lengthOf(1);
  });

  it('changes learning goal when left and right buttons are pressed', () => {
    const wrapper = shallow(
      <LearningGoals learningGoals={learningGoals} teacherHasEnabledAi />
    );
    expect(wrapper.find('Heading6').props().children).to.equal(
      learningGoals[0].learningGoal
    );
    wrapper.find('button').first().simulate('click');
    expect(wrapper.find('Heading6').props().children).to.equal(
      learningGoals[1].learningGoal
    );
    wrapper.find('button').at(1).simulate('click');
    expect(wrapper.find('Heading6').props().children).to.equal(
      learningGoals[0].learningGoal
    );
  });

  it('renders AiAssessment when teacher has AiEnabled and the learning goal can be tested by AI', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi={true}
        aiConfidence={50}
        aiUnderstanding={3}
        studentLevelInfo={studentLevelInfo}
        aiEvaluations={aiEvaluations}
      />
    );
    expect(wrapper.find('AiAssessment')).to.have.lengthOf(1);
    expect(wrapper.find('AiAssessment').props().studentName).to.equal(
      studentLevelInfo.name
    );
    expect(wrapper.find('AiAssessment').props().aiConfidence).to.equal(50);
    expect(wrapper.find('AiAssessment').props().aiUnderstandingLevel).to.equal(
      2
    );
    expect(wrapper.find('AiAssessment').props().isAiAssessed).to.equal(true);
  });

  it('does not renders AiAssessment when teacher has disabled ai', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi={false}
        studentLevelInfo={studentLevelInfo}
      />
    );
    expect(wrapper.find('AiAssessment')).to.have.lengthOf(0);
  });

  it('renders tips for teachers', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi
        isStudent={false}
      />
    );
    expect(wrapper.find('details')).to.have.lengthOf(1);
    expect(wrapper.find('SafeMarkdown')).to.have.lengthOf(1);
    expect(wrapper.find('SafeMarkdown').props().markdown).to.equal('Tips');
  });

  it('does not render tips for students', () => {
    const wrapper = shallow(
      <LearningGoals learningGoals={learningGoals} isStudent={true} />
    );
    expect(wrapper.find('details')).to.have.lengthOf(0);
  });

  it('shows AI token when AI is enabled', () => {
    const wrapper = shallow(
      <LearningGoals learningGoals={learningGoals} teacherHasEnabledAi />
    );
    expect(wrapper.find('Heading6').props().children).to.equal(
      learningGoals[0].learningGoal
    );
    expect(wrapper.find('AiToken')).to.have.lengthOf(1);
  });

  it('does not show AI token when AI is disabled', () => {
    const wrapper = shallow(
      <LearningGoals learningGoals={learningGoals} teacherHasEnabledAi />
    );
    wrapper.find('button').first().simulate('click');
    expect(wrapper.find('Heading6').props().children).to.equal(
      learningGoals[1].learningGoal
    );
    expect(wrapper.find('AiToken')).to.have.lengthOf(0);
  });

  it('does not show AI token when teacher has disabled AI', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi={false}
      />
    );
    expect(wrapper.find('Heading6').props().children).to.equal(
      learningGoals[0].learningGoal
    );
    expect(wrapper.find('AiToken')).to.have.lengthOf(0);
  });

  it('does not show AI token after teacher has submitted evaluation', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        submittedEvaluation={{
          feedback: 'test feedback',
          understanding: RubricUnderstandingLevels.LIMITED,
        }}
      />
    );
    expect(wrapper.find('AiToken')).to.have.lengthOf(0);
  });

  it('sends event when new learning goal is selected', () => {
    const sendEventSpy = sinon.spy(analyticsReporter, 'sendEvent');

    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        reportingData={{unitName: 'test-2023', levelName: 'test-level'}}
      />
    );
    wrapper.find('button').first().simulate('click');
    expect(sendEventSpy).to.have.been.calledWith(
      EVENTS.TA_RUBRIC_LEARNING_GOAL_SELECTED,
      {
        unitName: 'test-2023',
        levelName: 'test-level',
        learningGoalKey: 'efgh',
        learningGoal: 'Testing 2',
      }
    );
    wrapper.find('button').first().simulate('click');
    expect(sendEventSpy).to.have.been.calledWith(
      EVENTS.TA_RUBRIC_LEARNING_GOAL_SELECTED,
      {
        unitName: 'test-2023',
        levelName: 'test-level',
        learningGoalKey: 'abcd',
        learningGoal: 'Testing 1',
      }
    );
    sendEventSpy.restore();
  });

  it('displays Evaluate when AI is disabled and no understanding has been selected', () => {
    const wrapper = mount(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi
        canProvideFeedback
      />
    );
    wrapper.update();
    wrapper.find('button').at(1).simulate('click');
    expect(wrapper.find('BodyThreeText').at(1).text()).to.include('Evaluate');
    wrapper.unmount();
  });

  it('displays Approve when AI is enabled and no understanding has been selected', () => {
    const wrapper = mount(
      <LearningGoals
        learningGoals={learningGoals}
        teacherHasEnabledAi
        canProvideFeedback
      />
    );
    wrapper.update();
    expect(wrapper.find('BodyThreeText').at(1).text()).to.include('Approve');
    wrapper.unmount();
  });

  it('shows feedback in disabled textbox when available', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        submittedEvaluation={{
          feedback: 'test feedback',
          understanding: 1,
        }}
      />
    );
    expect(wrapper.find('textarea').props().value).to.equal('test feedback');
    expect(wrapper.find('textarea').props().disabled).to.equal(true);
    expect(wrapper.find('FontAwesome').at(1).props().icon).to.equal('message');
  });

  it('shows editable textbox for feedback when the teacher can provide feedback', () => {
    const wrapper = shallow(
      <LearningGoals
        canProvideFeedback={true}
        studentLevelInfo={studentLevelInfo}
        learningGoals={learningGoals}
      />
    );
    expect(wrapper.find('textarea').props().disabled).to.equal(false);
  });

  it('shows understanding in header if submittedEvaluation contains understand', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        submittedEvaluation={{
          feedback: 'test feedback',
          understanding: RubricUnderstandingLevels.LIMITED,
        }}
      />
    );
    expect(wrapper.find('BodyThreeText').at(1).props().children).to.equal(
      'Limited Evidence'
    );
  });

  it('shows No Evidence understanding in header if submittedEvaluation contains understand', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        submittedEvaluation={{
          feedback: 'test feedback',
          understanding: RubricUnderstandingLevels.NONE,
        }}
      />
    );
    expect(wrapper.find('BodyThreeText').at(1).props().children).to.equal(
      'No Evidence'
    );
  });

  it('passes isStudent down to EvidenceLevels', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        submittedEvaluation={submittedEvaluation}
        isStudent
      />
    );
    expect(wrapper.find('EvidenceLevels').props().isStudent).to.equal(true);
    expect(wrapper.find('EvidenceLevels').props().submittedEvaluation).to.equal(
      submittedEvaluation
    );
    expect(wrapper.find('EvidenceLevels').props().evidenceLevels).to.equal(
      learningGoals[0]['evidenceLevels']
    );
  });

  it('displays progress ring', () => {
    const wrapper = shallow(
      <LearningGoals
        learningGoals={learningGoals}
        submittedEvaluation={submittedEvaluation}
      />
    );
    expect(wrapper.find('ProgressRing')).to.have.lengthOf(1);
  });
});
