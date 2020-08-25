import { getLevel } from './gameOver';

const instructions = 'Computer: Use my WASD keys to fly and The Bar to shoot. ESC to stop time.';
export const playAgain = 'Play Again? Press Enter';
export const story = [
  {
    level: 0,
    scrap: 100,
    initialText: [
      'Me: Where am I?',
      'Computer: Error: 404. Location Not Found.',
      'Me: It looks like I have drifted for 10 warp days. I will have to find my way back.',
      "Me: This may be Corg space, I don't want to get assimil...assinated.",
      'Me: Computer, System Status.',
      'Computer: All systems have been destroyed.',
      'Me: Ugh, now I need some scrap to fix the systems.',
      'Computer: 200t of scrap are needed',
      instructions
    ],
    gameWinStatus: 'Warp Drive Fixed, Warping in 3, 2, 1...',
    gameOverText: [
      "Me: These are the coordinates, where's Earth?",
      'Computer: Error: 404. Earth not found.',
      'Me: Okay... Are you broken?'
    ],
    playAgain: 'Continue? Press Enter'
  },
  {
    scrap: 200,
    initialText: [
      'Me: Why is the ship broken again?',
      'Computer: **Cough** **Cough**',
      'Me: ... And why is my computer coughing?',
      instructions
    ],
    gameWinStatus: 'Computer Fixed, Warping in 3, 2, 1...',
    gameOverText: ["Me: Seriously, where's Earth?", 'Computer: Error: 404. Earth not found.', 'Me: Maybe the DNS is down?'],
    playAgain: 'Continue? Press Enter'
  },
  {
    scrap: 300,
    initialText: [
      'Me: I need to fix the Dynamic Navigation System',
      'Computer: Error: 404. Ship Not Found.',
      'Me: You are the ship!!!',
      instructions
    ],
    gameWinStatus: 'DNS Fixed, Warping in 3, 2, 1...',
    gameOverText: [
      "Me: Ok now what, where's Earth?",
      'Computer: Error: 404.',
      "Me: I'm getting tired of these error codes, can I turn off debug mode?"
    ],
    playAgain: 'Continue? Press Enter'
  },
  {
    scrap: 400,
    initialText: [
      'Me: Computer Debug Mode Off',
      "HAL: Error: 404. I'm afraid I can't let you do that.",
      'Me: How about with enough juicy scrap?',
      instructions
    ],
    gameWinStatus: 'Debug Mode Off, Warping in 3, 2, 1...',
    gameOverText: [
      'Me: I Win! Are we home?',
      'Computer: Error: 404. Earth was destroyed 2 days ago.',
      'Me: #*$& well I might as well see how many Corg I can destroy'
    ],
    playAgain: 'Endless Destruction? Press Enter'
  },
  {
    initialText: ["Me: Well let's get some Corg?", 'Computer: Error: 404. Corg Not Found.', 'Me: What is that then???', instructions],
    gameOverText: [
      'Me: Well I had fun, how about you',
      'Computer: Error: 404. Emotions not found.',
      'Me: I think my real goal is to destroy you!'
    ],
    playAgain: 'Endless Destruction? Press Enter'
  }
];
export const getStory = () => {
  console.log(Math.min(getLevel(), story.length - 1));
  return story[Math.min(getLevel(), story.length - 1)];
};
