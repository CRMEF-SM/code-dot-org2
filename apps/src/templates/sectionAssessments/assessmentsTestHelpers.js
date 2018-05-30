import i18n from '@cdo/locale';

export const studentData = [
  {
    id: '012896',
    name: 'Caley',
    studentAnswers: [
      {question: 1, answers: ['']},
      {question: 2, answers: ['B', 'D']},
      {question: 3, answers: ['E']},
      {question: 4, answers: ['C']},
      {question: 5, answers: ['A']},
      {question: 6, answers: ['']},
    ],
  },
];

export const multipleChoiceData = [
  {
    id: 1,
    question: '1. What is a variable?',
    answers:  [
      {multipleChoiceOption: i18n.answerOptionA(), percentAnswered: 40, isCorrectAnswer: true},
      {multipleChoiceOption: i18n.answerOptionB(), percentAnswered: 20, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionC(), percentAnswered: 20, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionD(), percentAnswered: 20, isCorrectAnswer: false},
    ],
    notAnswered: 10,
  },
  {
    id: 2,
    question: '2. What is a 4-bit number for the decimal number Ten(10)?',
    answers:  [
      {multipleChoiceOption: i18n.answerOptionA(), percentAnswered: 30, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionB(), percentAnswered: 10, isCorrectAnswer: true},
      {multipleChoiceOption: i18n.answerOptionC(), percentAnswered: 10, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionD(), percentAnswered: 10, isCorrectAnswer: true},
      {multipleChoiceOption: i18n.answerOptionE(), percentAnswered: 20, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionF(), percentAnswered: 10, isCorrectAnswer: false},
    ],
    notAnswered: 30,
  },
  {
    id: 3,
    question: '3. What is the minimum number of bits you will need to encode the 26 letters of the alphabet plus a space?',
    answers:  [
      {multipleChoiceOption: i18n.answerOptionA(), percentAnswered: 50, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionB(), percentAnswered: 15, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionC(), percentAnswered: 20, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionD(), percentAnswered: 5, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionE(), percentAnswered: 5, isCorrectAnswer: true},
    ],
    notAnswered: 5,
  },
  {
    id: 4,
    question: '4. What is the best explanation for why digital data is represented in computers in binary?',
    answers:  [
      {multipleChoiceOption: i18n.answerOptionA(), percentAnswered: 15, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionB(), percentAnswered: 18, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionC(), percentAnswered: 10, isCorrectAnswer: true},
      {multipleChoiceOption: i18n.answerOptionD(), percentAnswered: 9, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionE(), percentAnswered: 5, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionF(), percentAnswered: 32, isCorrectAnswer: true},
      {multipleChoiceOption: i18n.answerOptionG(), percentAnswered: 5, isCorrectAnswer: false},
    ],
    notAnswered: 33,
  },
  {
    id: 5,
    question: '5. What is a function?',
    answers:  [
      {multipleChoiceOption: i18n.answerOptionA(), percentAnswered: 15, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionB(), percentAnswered: 18, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionC(), percentAnswered: 10, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionD(), percentAnswered: 9, isCorrectAnswer: false},
      {multipleChoiceOption: i18n.answerOptionE(), percentAnswered: 5, isCorrectAnswer: true},
    ],
    notAnswered: 25,
  },
];

export const questionOne = [
  {
    id: 1,
    studentId: '210',
    name: 'Caley',
    response: ' ',
  },
  {
    id: 2,
    studentId: '211',
    name: 'Maddie',
    response: `Trees live in your fan brush, but you have to scare them out. Use absolutely no pressure. Just like an angel's wing. You can't have light without dark. You can't know happiness unless you've known sorrow. If you didn't have baby clouds, you wouldn't have big clouds. It is a lot of fun. We'll put all the little clouds in and let them dance around and have fun. And right there you got an almighty cloud. We don't have to be committed. We are just playing here. A tree cannot be straight if it has a crooked trunk. Let your heart take you to wherever you want to be. No worries. No cares. Just float and wait for the wind to blow you around. Put light against light - you have nothing. Put dark against dark - you have nothing. It's the contrast of light and dark that each give the other one meaning. This is truly an almighty mountain. The only thing worse than yellow snow is green snow. Paint anything you want on the canvas. Create your own world. You don't have to be crazy to do this but it does help. Tree trunks grow however makes them happy. Now let's put some happy little clouds in here. In your imagination you can go anywhere you want. It's so important to do something every day that will make you happy. Almost everything is going to happen for you automatically - you don't have to spend any time working or worrying. I'm a water fanatic. I love water.
    We wash our brush with odorless thinner. A beautiful little sunset. All you have to learn here is how to have fun. Let's go up in here, and start having some fun Trees get lonely too, so we'll give him a little friend. There are no limits in this world. See. We take the corner of the brush and let it play back-and-forth. The little tiny Tim easels will let you down. Steve wants reflections, so let's give him reflections. It's beautiful - and we haven't even done anything to it yet. Just think about these things in your mind - then bring them into your world. We start with a vision in our heart, and we put it on canvas. I can't think of anything more rewarding than being able to express yourself to others through painting,`
  },
  {
    id: 3,
    studentId: '212',
    name: 'Erin',
    response: 'Go out on a limb - that is where the fruit is.',
  },
  {
    id: 4,
    studentId: '213',
    name: 'BrendanBrendanBrendanBrendan',
    response: `We do not make mistakes we just have happy little accidents. Once you learn the technique,
        ohhh! Turn you loose on the world; you become a tiger.,`
  },
];

export const questionTwo = [
  {
    id: 1,
    studentId: '210',
    name: 'Caley',
    response: 'In every walk with nature, one receives far more than one seeks',
  },
];

export const questionThree = [
  {
    id: 1,
    studentId: '210',
    name: 'Maddie',
    response: ' ',
  },
];
