export const getFlashcardsFromAI = (topic) => {
  const cleanTopic = topic.trim();

  return [
    {
      title: `${cleanTopic} Basics`,
      explanation: `This flashcard introduces the core idea of ${cleanTopic}.`,
      points: [
        `${cleanTopic} has a clear definition.`,
        `${cleanTopic} is easier when learned with examples.`,
        `Practice helps you understand ${cleanTopic} deeply.`,
      ],
      example: `Example: Start with one small ${cleanTopic} concept and apply it in a mini project.`,
      quiz: `What is one key reason ${cleanTopic} is useful?`,
    },
  ];
};
