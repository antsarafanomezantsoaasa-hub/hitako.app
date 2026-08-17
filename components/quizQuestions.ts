export type QuizLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type QuizQuestion = {
  level: QuizLevel;
  q: string;
  hint?: string;
  options: string[];
  answer: number; // index of correct option
};

// 100 CEFR-graded questions inspired by the "What is My English Level" full test.
export const QUESTIONS: QuizQuestion[] = [
  // ============ A1 (1-20) ============
  {
    level: "A1",
    q: "Choose the correct sentence.",
    options: [
      "I sometimes watch TV in the evening.",
      "I watch sometimes TV in the evening.",
      "Sometimes I watches TV in the evening.",
      "I am sometimes watch TV in the evening.",
    ],
    answer: 0,
  },
  {
    level: "A1",
    q: "Complete: “She is ___ than her sisters.”",
    options: ["beautifuller", "more beautiful", "most beautiful", "beautifulest"],
    answer: 1,
  },
  {
    level: "A1",
    q: "Complete: “That is ___ car in the world.”",
    options: ["the more expensive", "most expensive", "the most expensive", "expensivest"],
    answer: 2,
  },
  {
    level: "A1",
    q: "Choose the correct future form.",
    options: [
      "I am going to go to school on Monday.",
      "I am go to school on Monday.",
      "I going to school on Monday.",
      "I will going to school Monday.",
    ],
    answer: 0,
  },
  {
    level: "A1",
    q: "Complete: “How ___ water do you drink every day?”",
    options: ["many", "much", "any", "few"],
    answer: 1,
  },
  {
    level: "A1",
    q: "Complete: “I'd like ___ water, please.”",
    options: ["any", "many", "some", "a"],
    answer: 2,
  },
  {
    level: "A1",
    q: "Choose the correct sentence.",
    options: [
      "I really like to read books.",
      "I really like read books.",
      "I really likes to read books.",
      "I am really like reading books.",
    ],
    answer: 0,
  },
  {
    level: "A1",
    q: "Choose the correct negative opinion.",
    options: [
      "I don't think she would cheat on her test.",
      "I think she wouldn't not cheat.",
      "I no think she would cheat.",
      "I don't thinks she cheat.",
    ],
    answer: 0,
  },
  {
    level: "A1",
    q: "Choose the correct past tense.",
    options: [
      "She were sick yesterday.",
      "She was sick yesterday.",
      "She is sick yesterday.",
      "She been sick yesterday.",
    ],
    answer: 1,
  },
  {
    level: "A1",
    q: "Choose the correct possessive.",
    options: [
      "Don't touch the dog's food. That's its food.",
      "Don't touch the dogs food. That's it's food.",
      "Don't touch the dog food. That's its'.",
      "Don't touch dog's food. That its food.",
    ],
    answer: 0,
  },
  {
    level: "A1",
    q: "Choose the correct possessive.",
    options: [
      "The students teacher is nice.",
      "The student's teacher is nice.",
      "The students' teacher is nice.",
      "The student teacher's is nice.",
    ],
    answer: 2,
  },
  {
    level: "A1",
    q: "Complete: “The cat is sleeping ___ the chair.”",
    options: ["on", "under", "in", "at"],
    answer: 1,
  },
  {
    level: "A1",
    q: "Complete: “Let's meet ___ January 15th.”",
    options: ["in", "at", "on", "by"],
    answer: 2,
  },
  {
    level: "A1",
    q: "Complete: “Let's meet ___ the bus stop.”",
    options: ["on", "in", "at", "by"],
    answer: 2,
  },
  {
    level: "A1",
    q: "Complete: “Right now I ___ English.”",
    options: ["study", "am studying", "studies", "will study"],
    answer: 1,
  },
  {
    level: "A1",
    q: "Complete: “She ___ plays tennis.”",
    options: ["often", "always is", "is often", "often is"],
    answer: 0,
  },
  {
    level: "A1",
    q: "Complete: “There ___ many people in the shop.”",
    options: ["is", "are", "has", "have"],
    answer: 1,
  },
  {
    level: "A1",
    q: "Choose the correct question.",
    options: ["Are you happy?", "You are happy?", "Do you happy?", "Is you happy?"],
    answer: 0,
  },
  {
    level: "A1",
    q: "Choose the correct sentence.",
    options: [
      "Elephants isn't small animals.",
      "Elephants aren't small animals.",
      "Elephants not small animals.",
      "Elephants don't small animals.",
    ],
    answer: 1,
  },
  {
    level: "A1",
    q: "Choose the correct past tense.",
    options: [
      "She finish studying at 10 p.m.",
      "She finished studying at 10 p.m.",
      "She was finish studying at 10 p.m.",
      "She finishing at 10 p.m.",
    ],
    answer: 1,
  },

  // ============ A2 (21-40) ============
  {
    level: "A2",
    q: "Complete: “He is ___ his sister.”",
    options: ["taller than", "more tall than", "tallest than", "tall than"],
    answer: 0,
  },
  {
    level: "A2",
    q: "Complete: “She is ___ singer in the world.”",
    options: ["greater", "the greatest", "greatest", "more great"],
    answer: 1,
  },
  {
    level: "A2",
    q: "Choose the correct present simple.",
    options: [
      "She study English every day.",
      "She studies English every day.",
      "She is study English every day.",
      "She studys English every day.",
    ],
    answer: 1,
  },
  {
    level: "A2",
    q: "Choose the correct contraction.",
    options: ["He's an engineer.", "He engineer.", "He is a engineer.", "He's engineer."],
    answer: 0,
  },
  {
    level: "A2",
    q: "Complete: “How ___ brothers and sisters do you have?”",
    options: ["much", "many", "lot", "any"],
    answer: 1,
  },
  {
    level: "A2",
    q: "Choose the correct sentence.",
    options: [
      "She has many pets.",
      "She have many pets.",
      "She has much pets.",
      "She having many pets.",
    ],
    answer: 0,
  },
  {
    level: "A2",
    q: "Choose the correct future.",
    options: [
      "I will see you tomorrow.",
      "I see you tomorrow.",
      "I will seeing you tomorrow.",
      "I am see you tomorrow.",
    ],
    answer: 0,
  },
  {
    level: "A2",
    q: "Complete: “She ___ drink more water.”",
    options: ["should", "shoulds", "should to", "is should"],
    answer: 0,
  },
  {
    level: "A2",
    q: "Complete: “We ___ study hard for our test.”",
    options: ["have", "has to", "have to", "having to"],
    answer: 2,
  },
  {
    level: "A2",
    q: "Choose the correct past continuous.",
    options: [
      "She was walking alone last night.",
      "She were walking alone last night.",
      "She walking alone last night.",
      "She is walking last night.",
    ],
    answer: 0,
  },
  {
    level: "A2",
    q: "Choose the correct past simple.",
    options: [
      "We eat some chicken last Saturday.",
      "We eating some chicken last Saturday.",
      "We ate some chicken last Saturday.",
      "We eaten some chicken last Saturday.",
    ],
    answer: 2,
  },
  {
    level: "A2",
    q: "Choose the correct past.",
    options: [
      "She has a problem last night.",
      "She had a problem last night.",
      "She having a problem last night.",
      "She have a problem last night.",
    ],
    answer: 1,
  },
  {
    level: "A2",
    q: "Choose the correct negative.",
    options: [
      "He doesn't have some toys.",
      "He don't have any toys.",
      "He doesn't have any toys.",
      "He hasn't any toys.",
    ],
    answer: 2,
  },
  {
    level: "A2",
    q: "Choose the correct imperative.",
    options: [
      "Please taking out the trash.",
      "You take out the trash.",
      "Please take out the trash.",
      "Take out please the trash.",
    ],
    answer: 2,
  },
  {
    level: "A2",
    q: "Choose the correct sentence.",
    options: [
      "I get up at 6 a.m.",
      "I gets up at 6 a.m.",
      "I am get up at 6 a.m.",
      "I getting up at 6 a.m.",
    ],
    answer: 0,
  },
  {
    level: "A2",
    q: "Choose the correct possessive.",
    options: [
      "That's Susan new husband.",
      "That's Susan's new husband.",
      "That's the Susan husband.",
      "That's Susans new husband.",
    ],
    answer: 1,
  },
  {
    level: "A2",
    q: "Choose the correct negative imperative.",
    options: ["No turn right.", "Don't turn right.", "Not turn right.", "Doesn't turn right."],
    answer: 1,
  },
  {
    level: "A2",
    q: "Choose the correct sentence.",
    options: [
      "They like eat lunch at noon.",
      "They likes to eat lunch at noon.",
      "They like to eat lunch at noon.",
      "They liking to eat lunch at noon.",
    ],
    answer: 2,
  },
  {
    level: "A2",
    q: "Choose the correct sentence.",
    options: [
      "I do a level test.",
      "I doing a level test.",
      "I am doing a level test.",
      "I am do a level test.",
    ],
    answer: 2,
  },
  {
    level: "A2",
    q: "Choose the correct planned future.",
    options: [
      "Robin has lunch at the restaurant tomorrow.",
      "Robin is having lunch at the restaurant tomorrow.",
      "Robin have lunch at restaurant tomorrow.",
      "Robin will has lunch tomorrow.",
    ],
    answer: 1,
  },

  // ============ B1 (41-55) ============
  {
    level: "B1",
    q: "Complete (present perfect): “I ___ this path before.”",
    options: ["walked", "have walked", "am walking", "was walking"],
    answer: 1,
  },
  {
    level: "B1",
    q: "Complete: “She ___ the flu since Monday.”",
    options: ["has had", "had", "have had", "is having"],
    answer: 0,
  },
  {
    level: "B1",
    q: "Choose the correct question.",
    options: [
      "Do you and your mom like to sing?",
      "Does you and your mom like to sing?",
      "Are you and your mom like sing?",
      "Do your mom and you likes sing?",
    ],
    answer: 0,
  },
  {
    level: "B1",
    q: "Choose the correct question.",
    options: [
      "Does your father works late?",
      "Do your father work late?",
      "Does your father work late?",
      "Is your father work late?",
    ],
    answer: 2,
  },
  {
    level: "B1",
    q: "Choose the correct question.",
    options: [
      "What you did yesterday?",
      "What did you do yesterday?",
      "What did you did yesterday?",
      "What you do yesterday?",
    ],
    answer: 1,
  },
  {
    level: "B1",
    q: "Zero conditional: choose the correct sentence.",
    options: [
      "If you exercise, you will lose weight.",
      "If you exercise, you lose weight.",
      "If you exercised, you lose weight.",
      "If you exercise, you would lose weight.",
    ],
    answer: 1,
  },
  {
    level: "B1",
    q: "Choose the correct sentence.",
    options: [
      "You go to jail if you hit a policeman.",
      "You went to jail if you hit a policeman.",
      "You will go to jail if you hitting a policeman.",
      "You going to jail if you hit policeman.",
    ],
    answer: 0,
  },
  {
    level: "B1",
    q: "First conditional: choose the correct sentence.",
    options: [
      "If I miss the train, I take the next one.",
      "If I will miss the train, I take the next one.",
      "If I miss the train, I will take the next one.",
      "If I missed the train, I will take the next one.",
    ],
    answer: 2,
  },
  {
    level: "B1",
    q: "Choose the correct sentence.",
    options: [
      "If it rains, we cannot play tennis.",
      "If it will rain, we cannot play tennis.",
      "If it rains, we could not to play tennis.",
      "If it rain, we can't playing tennis.",
    ],
    answer: 0,
  },
  {
    level: "B1",
    q: "Choose the correct short answer.",
    options: [
      "Are you a student? Yes, I do.",
      "Are you a student? Yes, I am.",
      "Are you a student? Yes, I be.",
      "Are you a student? Yes, I have.",
    ],
    answer: 1,
  },
  {
    level: "B1",
    q: "Choose the correct adverb.",
    options: [
      "She speaks English clear.",
      "She speaks English clearly.",
      "She speaks clearly English.",
      "She clearly speaks English much.",
    ],
    answer: 1,
  },
  {
    level: "B1",
    q: "Choose the correct negative imperative.",
    options: [
      "Please not come to class late.",
      "Please don't coming to class late.",
      "Please do not come to class late.",
      "Please no come to class late.",
    ],
    answer: 2,
  },
  {
    level: "B1",
    q: "Choose the correct sentence.",
    options: [
      "She didn't studied enough to pass the test.",
      "She didn't study enough to pass the test.",
      "She not studied enough to pass the test.",
      "She don't study enough to pass the test.",
    ],
    answer: 1,
  },
  {
    level: "B1",
    q: "Choose the correct comparative.",
    options: [
      "Going to the beach is funner than doing homework.",
      "Going to the beach is more fun than doing homework.",
      "Going to beach more fun that doing homework.",
      "Going to the beach is most fun than homework.",
    ],
    answer: 1,
  },
  {
    level: "B1",
    q: "Choose the correct comparative.",
    options: [
      "My bike is more good than your bike.",
      "My bike is gooder than your bike.",
      "My bike is better than your bike.",
      "My bike is the best than yours.",
    ],
    answer: 2,
  },

  // ============ B2 (56-70) ============
  {
    level: "B2",
    q: "Choose the correct superlative.",
    options: [
      "He is the more handsome man in the office.",
      "He is the most handsome man in the office.",
      "He is handsomest man in office.",
      "He is most handsomer man in the office.",
    ],
    answer: 1,
  },
  {
    level: "B2",
    q: "Choose the correct tag question.",
    options: [
      "We're going to the mall, aren't we?",
      "We're going to the mall, isn't we?",
      "We're going to the mall, don't we?",
      "We're going to the mall, are we?",
    ],
    answer: 0,
  },
  {
    level: "B2",
    q: "Choose the correct tag question.",
    options: [
      "They live in London, don't they?",
      "They live in London, aren't they?",
      "They live in London, doesn't they?",
      "They live in London, isn't it?",
    ],
    answer: 0,
  },
  {
    level: "B2",
    q: "Second conditional: choose the correct sentence.",
    options: [
      "If I want a lot of money, I would buy a big house in New York.",
      "If I wanted a lot of money, I would buy a big house in New York.",
      "If I wanted money, I will buy a big house.",
      "If I want money, I bought a big house.",
    ],
    answer: 1,
  },
  {
    level: "B2",
    q: "Choose the correct sentence.",
    options: [
      "If I was you, I will study English more.",
      "If I am you, I would study English more.",
      "If I were you, I would study English more.",
      "If I were you, I will studied English more.",
    ],
    answer: 2,
  },
  {
    level: "B2",
    q: "Third conditional: choose the correct sentence.",
    options: [
      "If it rained, you would get wet.",
      "If it had rained, you would have gotten wet.",
      "If it had rained, you would get wet.",
      "If it rains, you would have gotten wet.",
    ],
    answer: 1,
  },
  {
    level: "B2",
    q: "Choose the correct sentence.",
    options: [
      "I would have bought you a present if I knew it was your birthday.",
      "I would buy you a present if I had known it was your birthday.",
      "I would have bought you a present if I had known it was your birthday.",
      "I will have bought you a present if I knew your birthday.",
    ],
    answer: 2,
  },
  {
    level: "B2",
    q: "Future continuous: choose the correct sentence.",
    options: [
      "I will go to university in the fall.",
      "I will be going to university in the fall semester.",
      "I go to university in the fall semester.",
      "I am go to university in the fall.",
    ],
    answer: 1,
  },
  {
    level: "B2",
    q: "Choose the correct planned future.",
    options: [
      "I study French all day tomorrow.",
      "I will studying French all day tomorrow.",
      "I'm studying French all day tomorrow.",
      "I studied French all day tomorrow.",
    ],
    answer: 2,
  },
  {
    level: "B2",
    q: "Choose the correct modal deduction.",
    options: [
      "I saw my friend running to school. He must have been late.",
      "I saw my friend running to school. He must be late.",
      "I saw my friend running to school. He had to been late.",
      "I saw my friend running to school. He must to have late.",
    ],
    answer: 0,
  },
  {
    level: "B2",
    q: "Choose the correct past continuous.",
    options: [
      "I was washing my clothes last night.",
      "I were washing my clothes last night.",
      "I washing my clothes last night.",
      "I have washed my clothes last night.",
    ],
    answer: 0,
  },
  {
    level: "B2",
    q: "Choose the correct mixed conditional.",
    options: [
      "If I had studied harder, I'd have passed this test.",
      "If I studied harder, I'd pass this test.",
      "If I would study harder, I'd have passed.",
      "If I have studied harder, I passed this test.",
    ],
    answer: 0,
  },
  {
    level: "B2",
    q: "Reported speech: choose the correct sentence.",
    options: [
      "Sally said she have a new job.",
      "Sally said she has a new job.",
      "Sally said she had a new job.",
      "Sally said she is having a new job.",
    ],
    answer: 2,
  },
  {
    level: "B2",
    q: "Passive voice: choose the correct transformation of “Jack filmed an English video.”",
    options: [
      "English video is filmed by Jack.",
      "An English video was filmed by Jack.",
      "An English video filmed by Jack.",
      "An English video has been filmed by Jack.",
    ],
    answer: 1,
  },
  {
    level: "B2",
    q: "Choose the correct question.",
    options: [
      "What they did yesterday night?",
      "What did they do yesterday night?",
      "What did they did yesterday night?",
      "What they do yesterday night?",
    ],
    answer: 1,
  },

  // ============ C1 (71-85) ============
  {
    level: "C1",
    q: "Choose the correct adverb placement.",
    options: [
      "The teacher angrily walked into the classroom.",
      "The teacher walked into the classroom angrily.",
      "The teacher walked angrily into the classroom.",
      "All of the above are acceptable.",
    ],
    answer: 3,
  },
  {
    level: "C1",
    q: "Future continuous: choose the correct sentence.",
    options: [
      "She will swim in the ocean tomorrow afternoon.",
      "She will be swimming in the ocean tomorrow afternoon.",
      "She is swimming in the ocean tomorrow afternoon.",
      "She swims in the ocean tomorrow afternoon.",
    ],
    answer: 1,
  },
  {
    level: "C1",
    q: "Future perfect: choose the correct sentence.",
    options: [
      "I'll finish my work when you arrive.",
      "I finish my work when you arrive.",
      "I'll have finished my work when you arrive.",
      "I'll be finishing my work when you arrive.",
    ],
    answer: 2,
  },
  {
    level: "C1",
    q: "Complete: “On Thursday I ___ you for a week.”",
    options: ["know", "will know", "will have known", "have known"],
    answer: 2,
  },
  {
    level: "C1",
    q: "Mixed conditional: choose the correct sentence.",
    options: [
      "If I had worked harder at school, I would have a better job now.",
      "If I worked harder at school, I would have a better job now.",
      "If I have worked harder at school, I will have a better job now.",
      "If I would have worked harder, I have a better job now.",
    ],
    answer: 0,
  },
  {
    level: "C1",
    q: "Choose the correct sentence.",
    options: [
      "I would help you if I hadn't been in a meeting.",
      "I would have helped you if I wasn't in a meeting.",
      "I would have helped you if I hadn't been in the middle of another meeting.",
      "I will help you if I hadn't been in the meeting.",
    ],
    answer: 2,
  },
  {
    level: "C1",
    q: "Choose the correct meaning: “You needn't have washed the dishes.”",
    options: [
      "You didn't wash them, but you should have.",
      "You washed them, but it wasn't necessary.",
      "You must not wash the dishes.",
      "You can't wash the dishes.",
    ],
    answer: 1,
  },
  {
    level: "C1",
    q: "Choose the correct modal deduction.",
    options: [
      "He didn't buy the new car. It must be expensive.",
      "He didn't buy the new car. It must have been expensive.",
      "He didn't buy the new car. It had to be expensive.",
      "He didn't buy the new car. It should have been expensive.",
    ],
    answer: 1,
  },
  {
    level: "C1",
    q: "Choose the correct past continuous.",
    options: [
      "The window was open and the curtains blew in the wind.",
      "The window was open and the curtains were blowing in the wind.",
      "The window opened and the curtains blowing in the wind.",
      "The window was opening and the curtains blew.",
    ],
    answer: 1,
  },
  {
    level: "C1",
    q: "Choose the correct passive.",
    options: [
      "He surprised by the loud noise.",
      "He was surprised by the loud noise.",
      "He is surprise by the loud noise.",
      "He has surprise from the loud noise.",
    ],
    answer: 1,
  },
  {
    level: "C1",
    q: "Past perfect question: choose the correct sentence.",
    options: [
      "Did she eat before the taxi arrived?",
      "Had she eaten before the taxi arrived?",
      "Has she eaten before the taxi arrived?",
      "Was she eating before the taxi arrived?",
    ],
    answer: 1,
  },
  {
    level: "C1",
    q: "Choose the correct present perfect.",
    options: [
      "Have you ever seen a ghost?",
      "Did you ever see a ghost?",
      "Have you ever saw a ghost?",
      "Are you ever seen a ghost?",
    ],
    answer: 0,
  },
  {
    level: "C1",
    q: "Choose the correct sentence.",
    options: [
      "We called around, but we weren't able to find the car part we needed.",
      "We called around, but we couldn't to find the car part we needed.",
      "We called around, but we didn't able to find the car part.",
      "We called around, but we weren't can find the car part.",
    ],
    answer: 0,
  },
  {
    level: "C1",
    q: "Choose the correct sentence.",
    options: [
      "I listen to music before I sleep.",
      "I listen music before I sleep.",
      "I am listen to music before I sleep.",
      "I listens to music before I sleeping.",
    ],
    answer: 0,
  },
  {
    level: "C1",
    q: "Choose the correct relative clause.",
    options: [
      "I bought a new car which is very fast.",
      "I bought a new car that is very fast.",
      "I bought a new car, that is very fast.",
      "Both A and B are correct.",
    ],
    answer: 3,
  },

  // ============ C2 (86-100) ============
  {
    level: "C2",
    q: "Choose the correct relative clause.",
    options: [
      "I'm looking for a secretary who can use a computer well.",
      "I'm looking for a secretary which can use a computer well.",
      "I'm looking for a secretary whom can use a computer well.",
      "I'm looking for a secretary what can use a computer well.",
    ],
    answer: 0,
  },
  {
    level: "C2",
    q: "Reported question: choose the correct sentence.",
    options: [
      "Esther asked me what time was it.",
      "Esther asked me what time it was.",
      "Esther asked me what time is it.",
      "Esther asked me what was the time.",
    ],
    answer: 1,
  },
  {
    level: "C2",
    q: "Passive future: choose the correct sentence.",
    options: [
      "First prize will be won by you at the speech contest.",
      "First prize was won by you at the speech contest.",
      "First prize is being won by you at the speech contest.",
      "First prize will won by you at the speech contest.",
    ],
    answer: 0,
  },
  {
    level: "C2",
    q: "Choose the correct wish.",
    options: [
      "I wish I was rich.",
      "I wish I am rich.",
      "I wish I were rich.",
      "Both A and C are commonly accepted.",
    ],
    answer: 3,
  },
  {
    level: "C2",
    q: "Choose the correct meaning of “would” in: “When we were young, our mother would cook delicious meals.”",
    options: [
      "A polite request",
      "A repeated past habit",
      "A future prediction",
      "A second conditional",
    ],
    answer: 1,
  },
  {
    level: "C2",
    q: "Mixed conditional: choose the correct sentence.",
    options: [
      "If she had been born in the United States, she wouldn't need a work visa.",
      "If she was born in the United States, she wouldn't have needed a work visa.",
      "If she is born in the United States, she wouldn't need a work visa.",
      "If she had been born in the United States, she wouldn't have needed a work visa now.",
    ],
    answer: 0,
  },
  {
    level: "C2",
    q: "Choose the correct mixed conditional.",
    options: [
      "If Mark got the job instead of Jo, he would move to Shanghai.",
      "If Mark had gotten the job instead of Jo, he would be moving to Shanghai.",
      "If Mark had gotten the job instead of Jo, he would have moved to Shanghai.",
      "If Mark gets the job instead of Jo, he would be moving to Shanghai.",
    ],
    answer: 1,
  },
  {
    level: "C2",
    q: "Choose the correct mixed conditional.",
    options: [
      "If I didn't have to work so much, I would have gone to the party last night.",
      "If I hadn't had to work so much, I would go to the party last night.",
      "If I don't have to work so much, I would have gone to the party.",
      "If I wouldn't have to work, I go to the party last night.",
    ],
    answer: 0,
  },
  {
    level: "C2",
    q: "Choose the correct modal.",
    options: [
      "She didn't pick up the phone. She must be in the yard when I called.",
      "She didn't pick up the phone. She must have been in the yard when I called.",
      "She didn't pick up the phone. She had to be in the yard.",
      "She didn't pick up the phone. She should have been in the yard.",
    ],
    answer: 1,
  },
  {
    level: "C2",
    q: "Choose the correct wish.",
    options: [
      "I wish I can remember her name.",
      "I wish I could remember her name.",
      "I wish I remembered her name now.",
      "Both B and C are correct.",
    ],
    answer: 3,
  },
  {
    level: "C2",
    q: "Choose the correct past wish.",
    options: [
      "I wish I was taller when I was in school.",
      "I wish I were taller when I was in school.",
      "I wish I had been taller when I was in school.",
      "I wish I would be taller when I was in school.",
    ],
    answer: 2,
  },
  {
    level: "C2",
    q: "Idiom meaning: “Police have been coming down on drunk driving.”",
    options: [
      "Ignoring it",
      "Being lenient about it",
      "Cracking down / punishing it strictly",
      "Reducing patrols",
    ],
    answer: 2,
  },
  {
    level: "C2",
    q: "Choose the phrasal verb usage that means “to enthusiastically start.”",
    options: [
      "I'll dove into that new TV show later tonight.",
      "I'll dive into that new TV show later tonight.",
      "I'll be dove into that new TV show tonight.",
      "I'll diving into that new TV show tonight.",
    ],
    answer: 1,
  },
  {
    level: "C2",
    q: "Passive continuous: choose the correct transformation of “He has been putting it up his whole life.”",
    options: [
      "It has been put up his whole life.",
      "It has been being put up his whole life.",
      "It is being put up his whole life.",
      "It was being put up his whole life.",
    ],
    answer: 1,
  },
  {
    level: "C2",
    q: "Passive of “We used to say it in similar situations.”",
    options: [
      "It used to be said in similar situations.",
      "It was used to be said in similar situations.",
      "It used to being said in similar situations.",
      "It is used to say in similar situations.",
    ],
    answer: 0,
  },
];

export function levelFromScore(score: number): {
  code: QuizLevel;
  title: string;
  blurb: string;
  color: string;
} {
  if (score <= 20)
    return {
      code: "A1",
      title: "Débutant",
      blurb: "Les bases sont là — on va construire vos automatismes ensemble.",
      color: "from-rose-400 to-orange-400",
    };
  if (score <= 35)
    return {
      code: "A2",
      title: "Élémentaire",
      blurb: "Vous tenez une conversation simple. On va élargir votre terrain de jeu.",
      color: "from-orange-400 to-amber-400",
    };
  if (score <= 55)
    return {
      code: "B1",
      title: "Intermédiaire",
      blurb: "Vous comprenez l'essentiel. Objectif : gagner en fluidité.",
      color: "from-amber-400 to-yellow-400",
    };
  if (score <= 70)
    return {
      code: "B2",
      title: "Intermédiaire avancé",
      blurb: "Beau niveau. On peut viser un anglais professionnel et naturel.",
      color: "from-sky-400 to-cyan-400",
    };
  if (score <= 85)
    return {
      code: "C1",
      title: "Avancé",
      blurb: "Excellent ! On peut affûter la nuance et le vocabulaire expert.",
      color: "from-emerald-400 to-teal-400",
    };
  return {
    code: "C2",
    title: "Maîtrise",
    blurb: "Bluffant. Objectif : subtilité, style, et confiance totale.",
    color: "from-violet-400 to-fuchsia-400",
  };
}

// Fun encouragement at milestones
export const MILESTONES: Record<number, { emoji: string; title: string; msg: string }> = {
  10: {
    emoji: "🔥",
    title: "Bien joué !",
    msg: "10 questions terminées. Vous êtes lancé·e — on continue sur cette lancée.",
  },
  25: {
    emoji: "🚀",
    title: "Un quart du chemin !",
    msg: "25/100. Le rythme est bon. Respirez, on passe à l'étape suivante.",
  },
  40: {
    emoji: "💪",
    title: "Vous tenez le rythme",
    msg: "40/100. Les questions se corsent — parfait pour révéler votre vrai niveau.",
  },
  50: {
    emoji: "🏁",
    title: "Mi-parcours !",
    msg: "50/100. Vous avez déjà fait la moitié. C'est le moment de rester concentré·e.",
  },
  60: {
    emoji: "🎯",
    title: "Zone B2/C1",
    msg: "Les questions deviennent techniques. Fiez-vous à votre instinct.",
  },
  75: {
    emoji: "⭐",
    title: "75/100 !",
    msg: "Sérieusement impressionnant. Plus que 25 questions pour boucler la boucle.",
  },
  90: {
    emoji: "🏆",
    title: "Dernière ligne droite",
    msg: "90/100. Ce sont les questions C2 — les plus retorses. Vous y êtes presque !",
  },
};
