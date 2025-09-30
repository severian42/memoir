/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */

import {GoogleGenAI, Chat} from '@google/genai';

const MODEL_NAME = 'gemini-2.5-flash';

interface Question {
  id: string;
  text: string;
  lifeStage: string;
  theme: string;
  type: string;
  sensitivity: 'Low' | 'Medium' | 'High';
}

interface Answer {
  text: string;
  photo?: {
    data: string; // base64 encoded image
    annotation: string;
  }
}

interface CoreInfo {
    summary: string;
    people: string;
    values: string;
}

interface JournalEntry {
    id: string;
    title: string;
    content: string;
    date: string; // Stored as 'YYYY-MM-DD'
}

// Abridged version of the Master Question Rolodex from the blueprint
const MASTER_QUESTION_ROLODEX: Question[] = [
    // --- Ancestry & Pre-Birth ---
    { id: 'B-001', text: 'To begin, could you please state your full name, and when and where you were born?', lifeStage: 'Ancestry & Pre-Birth', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'B-002', text: 'What stories have come down to you about your grandparents?', lifeStage: 'Ancestry & Pre-Birth', theme: 'Love & Relationships', type: 'Factual', sensitivity: 'Low' },
    { id: 'B-003', text: 'What do you know about how your parents first met?', lifeStage: 'Ancestry & Pre-Birth', theme: 'Love & Relationships', type: 'Factual', sensitivity: 'Low' },
    { id: 'B-004', text: 'What were your parents\' names, and what were they like as people?', lifeStage: 'Ancestry & Pre-Birth', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Low' },
    { id: 'B-005', text: 'Were there any special naming traditions in your family? How did you get your name?', lifeStage: 'Ancestry & Pre-Birth', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'B-006', text: 'What country did your family emigrate from, if they did? Are there any stories about that journey?', lifeStage: 'Ancestry & Pre-Birth', theme: 'The World Around Me', type: 'Factual', sensitivity: 'Medium' },
    { id: 'B-007', text: 'What kind of work did your grandparents and parents do?', lifeStage: 'Ancestry & Pre-Birth', theme: 'Work & Purpose', type: 'Factual', sensitivity: 'Low' },
    { id: 'B-008', text: 'Describe the social and cultural atmosphere in the time and place you were born.', lifeStage: 'Ancestry & Pre-Birth', theme: 'The World Around Me', type: 'Reflective', sensitivity: 'Low' },
    { id: 'B-009', text: 'Were there any major historical events happening around the time of your birth that your parents talked about?', lifeStage: 'Ancestry & Pre-Birth', theme: 'The World Around Me', type: 'Factual', sensitivity: 'Low' },
    { id: 'B-010', text: 'What were your parents\' hopes and dreams for you before you were born?', lifeStage: 'Ancestry & Pre-Birth', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Low' },
    { id: 'B-011', text: 'Do you know of any famous or infamous ancestors in your family line?', lifeStage: 'Ancestry & Pre-Birth', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'B-012', text: 'What traditions or values were emphasized in your family as it was passed down through generations?', lifeStage: 'Ancestry & Pre-Birth', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'B-013', text: 'Did your family have any heirlooms that were passed down? What\'s the story behind them?', lifeStage: 'Ancestry & Pre-Birth', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'B-014', text: 'What was the economic situation for your parents when you were born?', lifeStage: 'Ancestry & Pre-Birth', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'B-015', text: 'In what kind of community or neighborhood were you born into?', lifeStage: 'Ancestry & Pre-Birth', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'B-016', text: 'Was religion or spirituality a big part of your family\'s life before you were born?', lifeStage: 'Ancestry & Pre-Birth', theme: 'Values & Beliefs', type: 'Factual', sensitivity: 'Low' },
    { id: 'B-017', text: 'What languages were spoken in your home or by your ancestors?', lifeStage: 'Ancestry & Pre-Birth', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'B-018', text: 'Were there any artists, musicians, or writers in your family?', lifeStage: 'Ancestry & Pre-Birth', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'B-019', text: 'What were the educational backgrounds of your parents and grandparents?', lifeStage: 'Ancestry & Pre-Birth', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'B-020', text: 'Do you know of any family rivalries or long-standing disputes?', lifeStage: 'Ancestry & Pre-Birth', theme: 'Love & Relationships', type: 'Factual', sensitivity: 'Medium' },

    // --- Early Childhood ---
    { id: 'C-001', text: 'What is your earliest, most vivid memory from childhood?', lifeStage: 'Early Childhood', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-002', text: 'Describe the house you grew up in. What was your bedroom like? What did you do for fun there?', lifeStage: 'Early Childhood', theme: 'Factual', type: 'Sensory', sensitivity: 'Low' },
    { id: 'C-003', text: 'What sort of relationship did you have with your parents as a child?', lifeStage: 'Early Childhood', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'C-004', text: 'Did you have any siblings? If so, what was your relationship with them like?', lifeStage: 'Early Childhood', theme: 'Love & Relationships', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-005', text: 'Who were your best friends in elementary school? What games did you play?', lifeStage: 'Early Childhood', theme: 'Love & Relationships', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-006', text: 'What was a typical day like for you as a young child?', lifeStage: 'Early Childhood', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-007', text: 'What were your favorite foods? Were there any you couldn\'t stand?', lifeStage: 'Early Childhood', theme: 'Factual', type: 'Sensory', sensitivity: 'Low' },
    { id: 'C-008', text: 'What scents do you associate with your childhood home? (e.g., baking bread, cut grass)', lifeStage: 'Early Childhood', theme: 'Factual', type: 'Sensory', sensitivity: 'Low' },
    { id: 'C-009', text: 'Did you have any pets? Tell me about them.', lifeStage: 'Early Childhood', theme: 'Love & Relationships', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-010', text: 'What was your first day of school like?', lifeStage: 'Early Childhood', theme: 'Factual', type: 'Reflective', sensitivity: 'Low' },
    { id: 'C-011', text: 'What was your favorite subject in elementary school? And your least favorite?', lifeStage: 'Early Childhood', theme: 'Work & Purpose', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-012', text: 'How did your family celebrate holidays or birthdays?', lifeStage: 'Early Childhood', theme: 'Love & Relationships', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-013', text: 'Were you ever in trouble as a child? What happened?', lifeStage: 'Early Childhood', theme: 'Hardship & Resilience', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-014', text: 'Did you have a favorite hiding spot?', lifeStage: 'Early Childhood', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-015', text: 'What was a favorite bedtime story or song?', lifeStage: 'Early Childhood', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-016', text: 'Were there any family vacations you remember? Where did you go?', lifeStage: 'Early Childhood', theme: 'Love & Relationships', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-017', text: 'What did you want to be when you grew up?', lifeStage: 'Early Childhood', theme: 'Work & Purpose', type: 'Hypothetical', sensitivity: 'Low' },
    { id: 'C-018', text: 'Were you a shy or outgoing child?', lifeStage: 'Early Childhood', theme: 'Factual', type: 'Reflective', sensitivity: 'Low' },
    { id: 'C-019', text: 'Describe a time you felt particularly proud of yourself as a child.', lifeStage: 'Early Childhood', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'C-020', text: 'Describe a time you felt scared.', lifeStage: 'Early Childhood', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'C-021', text: 'What kind of chores did you have to do around the house?', lifeStage: 'Early Childhood', theme: 'Work & Purpose', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-022', text: 'Did you have an allowance? What did you spend it on?', lifeStage: 'Early Childhood', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-023', text: 'Who was the "fun" parent, and who was the "strict" parent?', lifeStage: 'Early Childhood', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Low' },
    { id: 'C-024', text: 'What was the first movie you remember seeing in a theater?', lifeStage: 'Early Childhood', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-025', text: 'What was your favorite toy or game?', lifeStage: 'Early Childhood', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-026', text: 'Did you learn to ride a bike? What was that like?', lifeStage: 'Early Childhood', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-027', text: 'Were there any special family traditions you looked forward to?', lifeStage: 'Early Childhood', theme: 'Love & Relationships', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-028', text: 'Did you have any childhood injuries or visits to the hospital?', lifeStage: 'Early Childhood', theme: 'Hardship & Resilience', type: 'Factual', sensitivity: 'Medium' },
    { id: 'C-029', text: 'How did you learn about the world? (e.g., books, radio, television)', lifeStage: 'Early Childhood', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-030', text: 'What was your relationship like with your grandparents during this time?', lifeStage: 'Early Childhood', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Low' },
    { id: 'C-031', text: 'Did you have a favorite outfit or piece of clothing?', lifeStage: 'Early Childhood', theme: 'Factual', type: 'Sensory', sensitivity: 'Low' },
    { id: 'C-032', text: 'Who taught you to read and write?', lifeStage: 'Early Childhood', theme: 'Work & Purpose', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-033', text: 'What were family meals like? Was there assigned seating?', lifeStage: 'Early Childhood', theme: 'Love & Relationships', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-034', text: 'Did you ever have a secret clubhouse or fort?', lifeStage: 'Early Childhood', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-035', text: 'What was the most beautiful place you remember from your childhood?', lifeStage: 'Early Childhood', theme: 'Factual', type: 'Sensory', sensitivity: 'Low' },
    { id: 'C-036', text: 'What was the first time you realized your parents weren\'t perfect?', lifeStage: 'Early Childhood', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'C-037', text: 'Did you collect anything as a child?', lifeStage: 'Early Childhood', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-038', text: 'What television shows or radio programs did you love?', lifeStage: 'Early Childhood', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'C-039', text: 'Were you ever bullied, or did you ever witness bullying?', lifeStage: 'Early Childhood', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'C-040', text: 'What\'s a smell that instantly takes you back to being a kid?', lifeStage: 'Early Childhood', theme: 'Factual', type: 'Sensory', sensitivity: 'Low' },

    // --- Adolescence ---
    { id: 'A-001', text: 'Moving on to your teenage years. Who was your most influential teacher, and why? What did they teach you that has stayed with you?', lifeStage: 'Adolescence', theme: 'Work & Purpose', type: 'Reflective', sensitivity: 'Low' },
    { id: 'A-002', text: 'What did you and your friends do for fun when you were a teenager?', lifeStage: 'Adolescence', theme: 'Love & Relationships', type: 'Factual', sensitivity: 'Low' },
    { id: 'A-003', text: 'What were your dreams and goals for your life when you graduated from high school?', lifeStage: 'Adolescence', theme: 'Work & Purpose', type: 'Reflective', sensitivity: 'Low' },
    { id: 'A-004', text: 'Can you share a memory from your teenage years that was particularly happy or one that was particularly challenging?', lifeStage: 'Adolescence', theme: 'Factual', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'A-005', text: 'What was high school like for you? Were you part of any particular group or clique?', lifeStage: 'Adolescence', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Low' },
    { id: 'A-006', text: 'Did you play any sports or participate in extracurricular activities?', lifeStage: 'Adolescence', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'A-007', text: 'What kind of music were you and your friends listening to?', lifeStage: 'Adolescence', theme: 'The World Around Me', type: 'Factual', sensitivity: 'Low' },
    { id: 'A-008', text: 'What was the fashion like when you were a teenager? What was your style?', lifeStage: 'Adolescence', theme: 'The World Around Me', type: 'Factual', sensitivity: 'Low' },
    { id: 'A-009', text: 'Did you have a first love or crush? What was that person like?', lifeStage: 'Adolescence', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'A-010', text: 'What was your first date like?', lifeStage: 'Adolescence', theme: 'Love & Relationships', type: 'Factual', sensitivity: 'Low' },
    { id: 'A-011', text: 'Did you have a part-time job as a teenager?', lifeStage: 'Adolescence', theme: 'Work & Purpose', type: 'Factual', sensitivity: 'Low' },
    { id: 'A-012', text: 'How did your relationship with your parents change during these years?', lifeStage: 'Adolescence', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'A-013', text: 'What was the biggest argument you ever had with your parents?', lifeStage: 'Adolescence', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'A-014', text: 'Did you learn to drive? What was your first car?', lifeStage: 'Adolescence', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'A-015', text: 'What were the major world events happening, and how did they affect you or your family?', lifeStage: 'Adolescence', theme: 'The World Around Me', type: 'Reflective', sensitivity: 'Low' },
    { id: 'A-016', text: 'Was there a book or movie that had a big impact on you during this time?', lifeStage: 'Adolescence', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'A-017', text: 'Did you ever get into any trouble or do something rebellious?', lifeStage: 'Adolescence', theme: 'Hardship & Resilience', type: 'Factual', sensitivity: 'Medium' },
    { id: 'A-018', text: 'What was your graduation day like?', lifeStage: 'Adolescence', theme: 'Work & Purpose', type: 'Reflective', sensitivity: 'Low' },
    { id: 'A-019', text: 'Who was your best friend in high school? Are you still in touch?', lifeStage: 'Adolescence', theme: 'Love & Relationships', type: 'Factual', sensitivity: 'Low' },
    { id: 'A-020', text: 'What was a typical weekend like for you as a teenager?', lifeStage: 'Adolescence', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'A-021', text: 'Did you have a hero or someone you looked up to?', lifeStage: 'Adolescence', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'A-022', text: 'What were you most insecure about as a teenager?', lifeStage: 'Adolescence', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'A-023', text: 'What were you most confident about?', lifeStage: 'Adolescence', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'A-024', text: 'What was your prom or formal dance like?', lifeStage: 'Adolescence', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'A-025', text: 'Did you have a favorite hangout spot?', lifeStage: 'Adolescence', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'A-026', text: 'How did you think your life would turn out back then?', lifeStage: 'Adolescence', theme: 'Hypothetical', type: 'Reflective', sensitivity: 'Low' },
    { id: 'A-027', text: 'What is your best memory from your teenage years?', lifeStage: 'Adolescence', theme: 'Factual', type: 'Reflective', sensitivity: 'Low' },
    { id: 'A-028', text: 'And what is your most difficult memory from that time?', lifeStage: 'Adolescence', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'High' },
    { id: 'A-029', text: 'How did you deal with peer pressure?', lifeStage: 'Adolescence', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'Low' },
    { id: 'A-030', text: 'What technological changes happened during your teen years? (e.g., color TV, video games)', lifeStage: 'Adolescence', theme: 'The World Around Me', type: 'Factual', sensitivity: 'Low' },
    { id: 'A-031', text: 'What was the most trouble you ever got into at school?', lifeStage: 'Adolescence', theme: 'Hardship & Resilience', type: 'Factual', sensitivity: 'Low' },
    { id: 'A-032', text: 'Did you feel understood by the adults in your life?', lifeStage: 'Adolescence', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'A-033', text: 'Was there a particular historical event during your teen years that shaped your view of the world?', lifeStage: 'Adolescence', theme: 'The World Around Me', type: 'Reflective', sensitivity: 'Low' },
    { id: 'A-034', text: 'Did you ever have your heart broken?', lifeStage: 'Adolescence', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'A-035', text: 'What did you and your friends talk about? What were the big concerns?', lifeStage: 'Adolescence', theme: 'Love & Relationships', type: 'Factual', sensitivity: 'Low' },
    { id: 'A-036', text: 'What was the most important lesson a friend ever taught you?', lifeStage: 'Adolescence', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'A-037', text: 'Did you have any political awakenings during this time?', lifeStage: 'Adolescence', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'A-038', text: 'What was the most daring thing you did as a teenager?', lifeStage: 'Adolescence', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'A-039', text: 'How did you envision your future family life?', lifeStage: 'Adolescence', theme: 'Hypothetical', type: 'Reflective', sensitivity: 'Low' },
    { id: 'A-040', text: 'Describe a moment you felt truly independent for the first time.', lifeStage: 'Adolescence', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },

    // --- Early Adulthood ---
    { id: 'EA-001', text: 'Let\'s talk about early adulthood. Did you pursue further education after high school? What did you study?', lifeStage: 'Early Adulthood', theme: 'Work & Purpose', type: 'Factual', sensitivity: 'Low' },
    { id: 'EA-002', text: 'How did you meet your spouse or primary partner? What was your courtship like?', lifeStage: 'Early Adulthood', theme: 'Love & Relationships', type: 'Factual', sensitivity: 'Low' },
    { id: 'EA-003', text: 'Tell me about your first significant job. What valuable lessons did you learn there?', lifeStage: 'Early Adulthood', theme: 'Work & Purpose', type: 'Reflective', sensitivity: 'Low' },
    { id: 'EA-004', text: 'What was it like becoming a parent for the first time? How did it change you?', lifeStage: 'Early Adulthood', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'EA-005', text: 'Did you serve in the military? If so, would you be open to sharing some key moments you recall from your service?', lifeStage: 'Early Adulthood', theme: 'The World Around Me', type: 'Factual', sensitivity: 'High' },
    { id: 'EA-006', text: 'If you went to college, what was your major? Why did you choose it?', lifeStage: 'Early Adulthood', theme: 'Work & Purpose', type: 'Factual', sensitivity: 'Low' },
    { id: 'EA-007', text: 'Describe your college experience. What were the most memorable moments?', lifeStage: 'Early Adulthood', theme: 'Factual', type: 'Reflective', sensitivity: 'Low' },
    { id: 'EA-008', text: 'If you didn\'t go to college, what did you do instead?', lifeStage: 'Early Adulthood', theme: 'Work & Purpose', type: 'Factual', sensitivity: 'Low' },
    { id: 'EA-009', text: 'What was it like moving out of your parents\' house for the first time?', lifeStage: 'Early Adulthood', theme: 'Factual', type: 'Reflective', sensitivity: 'Low' },
    { id: 'EA-010', text: 'Describe your first apartment or home.', lifeStage: 'Early Adulthood', theme: 'Factual', type: 'Sensory', sensitivity: 'Low' },
    { id: 'EA-011', text: 'What was your wedding day like, if you got married?', lifeStage: 'Early Adulthood', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Low' },
    { id: 'EA-012', text: 'What was the hardest adjustment you faced as a newlywed or new partner?', lifeStage: 'Early Adulthood', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'EA-013', text: 'How did you decide on your career path? Was it a straight line or did it have twists and turns?', lifeStage: 'Early Adulthood', theme: 'Work & Purpose', type: 'Reflective', sensitivity: 'Low' },
    { id: 'EA-014', text: 'Who were your mentors in your early career?', lifeStage: 'Early Adulthood', theme: 'Work & Purpose', type: 'Factual', sensitivity: 'Low' },
    { id: 'EA-015', text: 'What was the biggest career risk you took during this time?', lifeStage: 'Early Adulthood', theme: 'Work & Purpose', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'EA-016', text: 'How did you and your partner decide to start a family, if you did?', lifeStage: 'Early Adulthood', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'EA-017', text: 'What were the biggest joys and challenges of raising young children?', lifeStage: 'Early Adulthood', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'EA-018', text: 'Did you travel anywhere interesting during this period of your life?', lifeStage: 'Early Adulthood', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'EA-019', text: 'How did you manage your finances? Was money tight?', lifeStage: 'Early Adulthood', theme: 'Hardship & Resilience', type: 'Factual', sensitivity: 'Medium' },
    { id: 'EA-020', text: 'What was a major purchase you were proud of (e.g., first new car, first house)?', lifeStage: 'Early Adulthood', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'EA-021', text: 'How did your friendships evolve as you and your friends started careers and families?', lifeStage: 'Early Adulthood', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Low' },
    { id: 'EA-022', text: 'Was there a time you failed at something? What did you learn from it?', lifeStage: 'Early Adulthood', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'EA-023', text: 'What hobbies or interests did you develop during this time?', lifeStage: 'Early Adulthood', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'EA-024', text: 'How did you balance work, family, and personal time?', lifeStage: 'Early Adulthood', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'Low' },
    { id: 'EA-025', text: 'What was your relationship with your own parents like during this stage?', lifeStage: 'Early Adulthood', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'EA-026', text: 'Did you experience the loss of a close family member or friend? How did you cope?', lifeStage: 'Early Adulthood', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'High' },
    { id: 'EA-027', text: 'What was a typical weekday like for you in your 30s?', lifeStage: 'Early Adulthood', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'EA-028', text: 'And what was a typical weekend like?', lifeStage: 'Early Adulthood', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'EA-029', text: 'How did your political or social views begin to form or solidify?', lifeStage: 'Early Adulthood', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'EA-030', text: 'Was there a major turning point in your early adult life that changed its direction?', lifeStage: 'Early Adulthood', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'EA-031', text: 'Describe a time you had to make a very difficult decision.', lifeStage: 'Early Adulthood', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'EA-032', text: 'What community were you a part of? (e.g., neighborhood, church, social club)', lifeStage: 'Early Adulthood', theme: 'Love & Relationships', type: 'Factual', sensitivity: 'Low' },
    { id: 'EA-033', text: 'What\'s a piece of advice you would give your 25-year-old self?', lifeStage: 'Early Adulthood', theme: 'Values & Beliefs', type: 'Hypothetical', sensitivity: 'Low' },
    { id: 'EA-034', text: 'Tell me about a time you felt truly happy and content.', lifeStage: 'Early Adulthood', theme: 'Factual', type: 'Reflective', sensitivity: 'Low' },
    { id: 'EA-035', text: 'How did you and your partner navigate disagreements or tough times?', lifeStage: 'Early Adulthood', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'EA-036', text: 'What was the biggest financial mistake you made?', lifeStage: 'Early Adulthood', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'EA-037', text: 'How did you celebrate your 21st birthday (or equivalent milestone)?', lifeStage: 'Early Adulthood', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'EA-038', text: 'Was there a piece of technology that changed how you worked or lived in your 20s/30s?', lifeStage: 'Early Adulthood', theme: 'The World Around Me', type: 'Factual', sensitivity: 'Low' },
    { id: 'EA-039', text: 'Did you ever experience a "quarter-life crisis"?', lifeStage: 'Early Adulthood', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'EA-040', text: 'What was the best piece of career advice you ever received?', lifeStage: 'Early Adulthood', theme: 'Work & Purpose', type: 'Factual', sensitivity: 'Low' },
    { id: 'EA-041', text: 'Who did you turn to for advice when making big life decisions?', lifeStage: 'Early Adulthood', theme: 'Love & Relationships', type: 'Factual', sensitivity: 'Low' },
    { id: 'EA-042', text: 'How did you and your partner decide where to live?', lifeStage: 'Early Adulthood', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'EA-043', text: 'What was the atmosphere in the country/world like, and did it affect your choices?', lifeStage: 'Early Adulthood', theme: 'The World Around Me', type: 'Reflective', sensitivity: 'Low' },
    { id: 'EA-044', text: 'Tell me about a major sacrifice you made for your family or career.', lifeStage: 'Early Adulthood', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'High' },
    { id: 'EA-045', text: 'Did you ever lose a job? How did you handle that?', lifeStage: 'Early Adulthood', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'High' },

    // --- Mid-Life ---
    { id: 'ML-001', text: 'As you entered mid-life, what accomplishment in your career are you most proud of?', lifeStage: 'Mid-Life', theme: 'Work & Purpose', type: 'Reflective', sensitivity: 'Low' },
    { id: 'ML-002', text: 'What was the biggest challenge you faced in your life, and how did you overcome it?', lifeStage: 'Mid-Life', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'High' },
    { id: 'ML-003', text: 'How did your values or personal beliefs change as you got older?', lifeStage: 'Mid-Life', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'ML-004', text: 'How did you see the world change around you during this period? Were there any major historical events that personally affected you?', lifeStage: 'Mid-Life', theme: 'The World Around Me', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'ML-005', text: 'As your children became teenagers, how did your parenting style change?', lifeStage: 'Mid-Life', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Low' },
    { id: 'ML-006', text: 'What was it like to have an "empty nest" when your children moved out?', lifeStage: 'Mid-Life', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'ML-007', text: 'Did you make any career changes in mid-life? Why?', lifeStage: 'Mid-Life', theme: 'Work & Purpose', type: 'Reflective', sensitivity: 'Low' },
    { id: 'ML-008', text: 'What professional achievement from this period stands out the most?', lifeStage: 'Mid-Life', theme: 'Work & Purpose', type: 'Factual', sensitivity: 'Low' },
    { id: 'ML-009', text: 'How did you take care of your health and well-being during these years?', lifeStage: 'Mid-Life', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'ML-010', text: 'Did you pick up any new hobbies or passions in your 40s or 50s?', lifeStage: 'Mid-Life', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'ML-011', text: 'How did your relationship with your spouse or partner evolve during this time?', lifeStage: 'Mid-Life', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Low' },
    { id: 'ML-012', text: 'Did you become a caregiver for your own parents? What was that experience like?', lifeStage: 'Mid-Life', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'High' },
    { id: 'ML-013', text: 'What was the most significant world event that happened during your mid-life, and how did you react to it?', lifeStage: 'Mid-Life', theme: 'The World Around Me', type: 'Reflective', sensitivity: 'Low' },
    { id: 'ML-014', text: 'How did you see technology change the world and your life during this period?', lifeStage: 'Mid-Life', theme: 'The World Around Me', type: 'Reflective', sensitivity: 'Low' },
    { id: 'ML-015', text: 'What kind of vacations did you take? Any favorites?', lifeStage: 'Mid-Life', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'ML-016', text: 'Reflecting on your career, what do you feel was your biggest contribution?', lifeStage: 'Mid-Life', theme: 'Work & Purpose', type: 'Reflective', sensitivity: 'Low' },
    { id: 'ML-017', text: 'Did your spiritual or philosophical beliefs change or deepen?', lifeStage: 'Mid-Life', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'ML-018', text: 'How did you define "success" for yourself at this stage of life?', lifeStage: 'Mid-Life', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'ML-019', text: 'Tell me about a friendship that was particularly important to you during mid-life.', lifeStage: 'Mid-Life', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Low' },
    { id: 'ML-020', text: 'Was there a book, film, or piece of music that deeply moved you in this period?', lifeStage: 'Mid-Life', theme: 'Factual', type: 'Reflective', sensitivity: 'Low' },
    { id: 'ML-021', text: 'What was turning 40 like for you? How about turning 50?', lifeStage: 'Mid-Life', theme: 'Factual', type: 'Reflective', sensitivity: 'Low' },
    { id: 'ML-022', text: 'Is there a skill you wish you had learned?', lifeStage: 'Mid-Life', theme: 'Hypothetical', type: 'Hypothetical', sensitivity: 'Low' },
    { id: 'ML-023', text: 'How did you handle stress or burnout?', lifeStage: 'Mid-Life', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'Low' },
    { id: 'ML-024', text: 'What was a major obstacle you had to overcome in your personal life?', lifeStage: 'Mid-Life', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'High' },
    { id: 'ML-025', text: 'Did you get involved in any community service or volunteering?', lifeStage: 'Mid-Life', theme: 'Work & Purpose', type: 'Factual', sensitivity: 'Low' },
    { id: 'ML-026', text: 'What was your proudest moment as a parent of older children?', lifeStage: 'Mid-Life', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Low' },
    { id: 'ML-027', text: 'How did your perspective on money and material possessions change?', lifeStage: 'Mid-Life', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'ML-028', text: 'Did you reconnect with any old friends or family members?', lifeStage: 'Mid-Life', theme: 'Love & Relationships', type: 'Factual', sensitivity: 'Low' },
    { id: 'ML-029', text: 'What did you learn about yourself during your mid-life years?', lifeStage: 'Mid-Life', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'ML-030', text: 'Was there a moment of personal transformation or a significant realization?', lifeStage: 'Mid-Life', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'ML-031', text: 'How did you celebrate major anniversaries or milestones?', lifeStage: 'Mid-Life', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'ML-032', text: 'What did you do for fun and relaxation?', lifeStage: 'Mid-Life', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'ML-033', text: 'If you could relive one year from this period, which would it be and why?', lifeStage: 'Mid-Life', theme: 'Hypothetical', type: 'Hypothetical', sensitivity: 'Low' },
    { id: 'ML-034', text: 'Did you have to confront your own mortality in any way during this time?', lifeStage: 'Mid-Life', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'High' },
    { id: 'ML-035', text: 'What traditions did you establish with your own family?', lifeStage: 'Mid-Life', theme: 'Love & Relationships', type: 'Factual', sensitivity: 'Low' },
    { id: 'ML-036', text: 'Did you feel you were becoming more or less like your parents?', lifeStage: 'Mid-Life', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Low' },
    { id: 'ML-037', text: 'What was the most expensive thing you ever bought? Was it worth it?', lifeStage: 'Mid-Life', theme: 'Factual', type: 'Reflective', sensitivity: 'Low' },
    { id: 'ML-038', text: 'How did you stay in touch with your children after they left home?', lifeStage: 'Mid-Life', theme: 'Love & Relationships', type: 'Factual', sensitivity: 'Low' },
    { id: 'ML-039', text: 'What was your proudest "non-work" or "non-parenting" achievement from this time?', lifeStage: 'Mid-Life', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'ML-040', text: 'Did you ever go back to school or learn a new major skill?', lifeStage: 'Mid-Life', theme: 'Work & Purpose', type: 'Factual', sensitivity: 'Low' },
    { id: 'ML-041', text: 'How did you see your role in the world change?', lifeStage: 'Mid-Life', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'ML-042', text: 'Did you attend any weddings of your children or close family friends?', lifeStage: 'Mid-Life', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'ML-043', text: 'What was a moment you felt "old"? What was a moment you felt "young"?', lifeStage: 'Mid-Life', theme: 'Reflective', type: 'Reflective', sensitivity: 'Low' },
    { id: 'ML-044', text: 'Was there a point where you felt financially secure? What did that feel like?', lifeStage: 'Mid-Life', theme: 'Factual', type: 'Reflective', sensitivity: 'Low' },
    { id: 'ML-045', text: 'What did you learn about love after being with your partner for so long?', lifeStage: 'Mid-Life', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Low' },
    
    // --- Later Years & Reflection ---
    { id: 'LR-001', text: 'Now, thinking about your later years and reflecting back. What are the most important lessons you\'ve learned in your life?', lifeStage: 'Later Years', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'LR-002', text: 'What advice would you give to your eighteen-year-old self today?', lifeStage: 'Later Years', theme: 'Values & Beliefs', type: 'Hypothetical', sensitivity: 'Low' },
    { id: 'LR-003', text: 'Are there any things you wish you\'d done differently?', lifeStage: 'Later Years', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'High' },
    { id: 'LR-004', text: 'Looking back on everything, what are you most proud of?', lifeStage: 'Later Years', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'LR-005', text: 'How would you like to be remembered?', lifeStage: 'Later Years', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'LR-006', text: 'What was the transition into retirement like for you?', lifeStage: 'Later Years', theme: 'Work & Purpose', type: 'Reflective', sensitivity: 'Low' },
    { id: 'LR-007', text: 'If you are not retired, do you plan to be? What are your thoughts on it?', lifeStage: 'Later Years', theme: 'Work & Purpose', type: 'Hypothetical', sensitivity: 'Low' },
    { id: 'LR-008', text: 'How do you spend a typical day now?', lifeStage: 'Later Years', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'LR-009', text: 'What does it feel like to be a grandparent, if you are one?', lifeStage: 'Later Years', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Low' },
    { id: 'LR-010', text: 'What do you enjoy most about this stage of your life?', lifeStage: 'Later Years', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'LR-011', text: 'What are the biggest challenges of this stage?', lifeStage: 'Later Years', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'LR-012', text: 'How has your health been? How do you manage it?', lifeStage: 'Later Years', theme: 'Factual', type: 'Factual', sensitivity: 'Medium' },
    { id: 'LR-013', text: 'What have been the most significant changes in the world that you\'ve witnessed over your lifetime?', lifeStage: 'Later Years', theme: 'The World Around Me', type: 'Reflective', sensitivity: 'Low' },
    { id: 'LR-014', text: 'Of all the places you\'ve lived, which one felt most like home?', lifeStage: 'Later Years', theme: 'Factual', type: 'Reflective', sensitivity: 'Low' },
    { id: 'LR-015', text: 'What does the word "family" mean to you now?', lifeStage: 'Later Years', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Low' },
    { id: 'LR-016', text: 'What is a possession you treasure most and why?', lifeStage: 'Later Years', theme: 'Factual', type: 'Reflective', sensitivity: 'Low' },
    { id: 'LR-017', text: 'What do you think is the secret to a long and happy marriage or partnership?', lifeStage: 'Later Years', theme: 'Love & Relationships', type: 'Reflective', sensitivity: 'Low' },
    { id: 'LR-018', text: 'What is your perspective on forgiveness?', lifeStage: 'Later Years', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'LR-019', text: 'What role does spirituality or faith play in your life today?', lifeStage: 'Later Years', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'LR-020', text: 'What are you still curious about?', lifeStage: 'Later Years', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'LR-021', text: 'How do you stay connected with friends and family?', lifeStage: 'Later Years', theme: 'Love & Relationships', type: 'Factual', sensitivity: 'Low' },
    { id: 'LR-022', text: 'What activity makes you feel most alive and engaged?', lifeStage: 'Later Years', theme: 'Factual', type: 'Reflective', sensitivity: 'Low' },
    { id: 'LR-023', text: 'What accomplishment, big or small, recently made you proud?', lifeStage: 'Later Years', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'LR-024', text: 'What is a piece of wisdom you\'d want to pass on to your grandchildren or younger generations?', lifeStage: 'Later Years', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'LR-025', text: 'How has your definition of happiness changed over the years?', lifeStage: 'Later Years', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'LR-026', text: 'What are you grateful for?', lifeStage: 'Later Years', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'LR-027', text: 'Looking back, what was the happiest period of your life? Why?', lifeStage: 'Later Years', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'LR-028', text: 'What was the most difficult period? What got you through it?', lifeStage: 'Later Years', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'High' },
    { id: 'LR-029', text: 'Is there anything on your "bucket list" that you still hope to do?', lifeStage: 'Later Years', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'LR-030', text: 'What is your hope for the future of your family?', lifeStage: 'Later Years', theme: 'Love & Relationships', type: 'Hypothetical', sensitivity: 'Low' },
    { id: 'LR-031', text: 'What is your hope for the future of the world?', lifeStage: 'Later Years', theme: 'The World Around Me', type: 'Hypothetical', sensitivity: 'Low' },
    { id: 'LR-032', text: 'If you could have dinner with any three people from your past, who would they be and why?', lifeStage: 'Later Years', theme: 'Hypothetical', type: 'Hypothetical', sensitivity: 'Low' },
    { id: 'LR-033', text: 'How do you think the world has gotten better? How has it gotten worse?', lifeStage: 'Later Years', theme: 'The World Around Me', type: 'Reflective', sensitivity: 'Low' },
    { id: 'LR-034', text: 'What do you fear, if anything?', lifeStage: 'Later Years', theme: 'Hardship & Resilience', type: 'Reflective', sensitivity: 'Medium' },
    { id: 'LR-035', text: 'What is a simple pleasure that you enjoy regularly?', lifeStage: 'Later Years', theme: 'Factual', type: 'Factual', sensitivity: 'Low' },
    { id: 'LR-036', text: 'What\'s the biggest difference between the world today and the world you were born into?', lifeStage: 'Later Years', theme: 'The World Around Me', type: 'Reflective', sensitivity: 'Low' },
    { id: 'LR-037', text: 'If your life was a book, what would the title be?', lifeStage: 'Later Years', theme: 'Values & Beliefs', type: 'Hypothetical', sensitivity: 'Low' },
    { id: 'LR-038', text: 'What do people misunderstand about your generation?', lifeStage: 'Later Years', theme: 'The World Around Me', type: 'Reflective', sensitivity: 'Low' },
    { id: 'LR-039', text: 'What has been the most surprising part of growing older?', lifeStage: 'Later Years', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Low' },
    { id: 'LR-040', text: 'When you are gone, what is the one story you hope people will continue to tell about you?', lifeStage: 'Later Years', theme: 'Values & Beliefs', type: 'Reflective', sensitivity: 'Medium' },
];
const LIFE_STAGES = [...new Set(MASTER_QUESTION_ROLODEX.map(q => q.lifeStage))];

class LivingMemoirApp {
  private genAI: GoogleGenAI;

  // UI Elements
  private dashboardContent: HTMLElement;
  private themeToggleButton: HTMLButtonElement;
  private ttsToggleButton: HTMLButtonElement;
  private exportButton: HTMLButtonElement;
  private ttsIcon: HTMLElement;
  private themeToggleIcon: HTMLElement;
  
  // Consent Modal
  private consentModal: HTMLDivElement;
  private consentPromptText: HTMLParagraphElement;
  private consentYesButton: HTMLButtonElement;
  private consentNoButton: HTMLButtonElement;

  // Compile Modal
  private compileModal: HTMLDivElement;
  private compileModalCloseBtn: HTMLButtonElement;
  private memoirPreviewContent: HTMLDivElement;
  private suggestTitleBtn: HTMLButtonElement;
  private titleSuggestionsContainer: HTMLDivElement;
  private downloadMemoirBtn: HTMLButtonElement;
  
  // Journal Modal
  private journalModal: HTMLDivElement;
  private journalModalTitle: HTMLHeadingElement;
  private journalModalCloseBtn: HTMLButtonElement;
  private journalForm: HTMLFormElement;
  private journalEntryIdInput: HTMLInputElement;
  private journalTitleInput: HTMLInputElement;
  private journalDateInput: HTMLInputElement;
  private journalContentInput: HTMLTextAreaElement;
  private journalDeleteBtn: HTMLButtonElement;


  // Chatbot UI
  private chatFab: HTMLButtonElement;
  private chatModal: HTMLDivElement;
  private chatCloseBtn: HTMLButtonElement;
  private chatMessages: HTMLDivElement;
  private chatInput: HTMLTextAreaElement;
  private chatSendBtn: HTMLButtonElement;

  // App State
  private answers: Map<string, Answer> = new Map();
  private coreInfo: CoreInfo = { summary: '', people: '', values: '' };
  private journalEntries: JournalEntry[] = [];
  private isMuted = false;
  private activeQuestionForConsent: { question: Question, card: HTMLElement } | null = null;
  private openChapter: string | null = null;
  
  // Recording State
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private stream: MediaStream | null = null;

  // Chat State
  private chat: Chat | null = null;

  constructor() {
    this.genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Main UI
    this.dashboardContent = document.getElementById('dashboard-content') as HTMLElement;
    this.themeToggleButton = document.getElementById('themeToggleButton') as HTMLButtonElement;
    this.themeToggleIcon = this.themeToggleButton.querySelector('i') as HTMLElement;
    this.ttsToggleButton = document.getElementById('ttsToggleButton') as HTMLButtonElement;
    this.ttsIcon = this.ttsToggleButton.querySelector('i') as HTMLElement;
    this.exportButton = document.getElementById('exportButton') as HTMLButtonElement;
    
    // Consent Modal
    this.consentModal = document.getElementById('consent-modal') as HTMLDivElement;
    this.consentPromptText = document.getElementById('consent-prompt-text') as HTMLParagraphElement;
    this.consentYesButton = document.getElementById('consent-yes') as HTMLButtonElement;
    this.consentNoButton = document.getElementById('consent-no') as HTMLButtonElement;

    // Compile Modal
    this.compileModal = document.getElementById('compile-modal') as HTMLDivElement;
    this.compileModalCloseBtn = document.getElementById('compile-modal-close') as HTMLButtonElement;
    this.memoirPreviewContent = document.getElementById('memoir-preview-content') as HTMLDivElement;
    this.suggestTitleBtn = document.getElementById('suggest-title-btn') as HTMLButtonElement;
    this.titleSuggestionsContainer = document.getElementById('title-suggestions-container') as HTMLDivElement;
    this.downloadMemoirBtn = document.getElementById('download-memoir-btn') as HTMLButtonElement;

    // Journal Modal
    this.journalModal = document.getElementById('journal-modal') as HTMLDivElement;
    this.journalModalTitle = document.getElementById('journal-modal-title') as HTMLHeadingElement;
    this.journalModalCloseBtn = document.getElementById('journal-modal-close') as HTMLButtonElement;
    this.journalForm = document.getElementById('journal-form') as HTMLFormElement;
    this.journalEntryIdInput = document.getElementById('journal-entry-id') as HTMLInputElement;
    this.journalTitleInput = document.getElementById('journal-title') as HTMLInputElement;
    this.journalDateInput = document.getElementById('journal-date') as HTMLInputElement;
    this.journalContentInput = document.getElementById('journal-content') as HTMLTextAreaElement;
    this.journalDeleteBtn = document.getElementById('journal-delete-btn') as HTMLButtonElement;


    // Chatbot UI
    this.chatFab = document.getElementById('chat-fab') as HTMLButtonElement;
    this.chatModal = document.getElementById('chat-modal') as HTMLDivElement;
    this.chatCloseBtn = document.getElementById('chat-close-btn') as HTMLButtonElement;
    this.chatMessages = document.getElementById('chat-messages') as HTMLDivElement;
    this.chatInput = document.getElementById('chat-input') as HTMLTextAreaElement;
    this.chatSendBtn = document.getElementById('chat-send-btn') as HTMLButtonElement;

    this.bindGlobalEventListeners();
    this.initTheme();
    this.initTTS();
    this.loadState();
    this.renderDashboard();
  }

  private bindGlobalEventListeners(): void {
    this.themeToggleButton.addEventListener('click', () => this.toggleTheme());
    this.ttsToggleButton.addEventListener('click', () => this.toggleTTS());
    this.exportButton.addEventListener('click', () => this.openCompileModal());
    
    // Consent Modal listeners
    this.consentYesButton.addEventListener('click', () => this.handleConsent(true));
    this.consentNoButton.addEventListener('click', () => this.handleConsent(false));
    
    // Compile Modal listeners
    this.compileModalCloseBtn.addEventListener('click', () => this.closeCompileModal());
    this.suggestTitleBtn.addEventListener('click', () => this.handleSuggestTitles());
    this.downloadMemoirBtn.addEventListener('click', () => this.exportAsPDF());

    // Journal Modal listeners
    this.journalModalCloseBtn.addEventListener('click', () => this.closeJournalModal());
    this.journalForm.addEventListener('submit', (e) => this.handleSaveJournalEntry(e));
    this.journalDeleteBtn.addEventListener('click', () => this.handleDeleteJournalEntry());

    // Chatbot listeners
    this.chatFab.addEventListener('click', () => this.toggleChat(true));
    this.chatCloseBtn.addEventListener('click', () => this.toggleChat(false));
    this.chatSendBtn.addEventListener('click', () => this.handleSendMessage());
    this.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSendMessage();
        }
    });
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
      this.themeToggleIcon.className = 'fas fa-moon';
    } else {
        this.themeToggleIcon.className = 'fas fa-sun';
    }
  }

  private toggleTheme(): void {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    this.themeToggleIcon.className = `fas ${isLight ? 'fa-moon' : 'fa-sun'}`;
  }

  private initTTS(): void {
    this.isMuted = localStorage.getItem('isMuted') === 'true';
    this.updateTTSIcon();
  }

  private toggleTTS(): void {
    this.isMuted = !this.isMuted;
    localStorage.setItem('isMuted', String(this.isMuted));
    this.updateTTSIcon();
    if (this.isMuted && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  }

  private updateTTSIcon(): void {
    this.ttsIcon.className = `fas ${this.isMuted ? 'fa-volume-xmark' : 'fa-volume-high'}`;
  }

  private speak(text: string): void {
    if (this.isMuted || !text) return;
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }

  private saveState(): void {
    const state = {
      answers: Array.from(this.answers.entries()),
      openChapter: this.openChapter,
      coreInfo: this.coreInfo,
      journalEntries: this.journalEntries,
    };
    localStorage.setItem('memoir_dashboard_state', JSON.stringify(state));
  }

  private loadState(): void {
    const stateJSON = localStorage.getItem('memoir_dashboard_state');
    if (stateJSON) {
        const state = JSON.parse(stateJSON) as { 
            answers: [string, string | Answer][], 
            openChapter: string | null,
            coreInfo: CoreInfo,
            journalEntries: JournalEntry[],
        };
        const answers_v1 = new Map(state.answers || []);
        const migratedAnswers = new Map<string, Answer>();

        answers_v1.forEach((value, key) => {
            if (typeof value === 'string') {
                migratedAnswers.set(key, { text: value });
            } else {
                migratedAnswers.set(key, value);
            }
        });
        this.answers = migratedAnswers;
        this.openChapter = state.openChapter || null;
        this.coreInfo = state.coreInfo || { summary: '', people: '', values: '' };
        this.journalEntries = state.journalEntries || [];
    }
  }

  private renderDashboard(): void {
    this.dashboardContent.innerHTML = '';
    this.dashboardContent.appendChild(this.createCoreInfoSection());
    this.dashboardContent.appendChild(this.createJournalSection());
    LIFE_STAGES.forEach(stage => {
      this.dashboardContent.appendChild(this.createChapterDropdown(stage));
    });
  }

  private createCoreInfoSection(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'core-info-container';
    container.innerHTML = `
      <div class="chapter-header">
        <div class="chapter-header-info">
          <span class="chapter-title"><i class="fas fa-gem"></i> My Story's Foundation</span>
          <span class="chapter-progress">Provide context to personalize your experience</span>
        </div>
        <i class="fas fa-chevron-down chapter-toggle-icon"></i>
      </div>
      <div class="core-info-content">
        <div class="core-info-field">
            <label for="core-summary">Life Summary</label>
            <textarea id="core-summary" class="text-input" placeholder="A brief, one-paragraph summary of your life.">${this.coreInfo.summary}</textarea>
        </div>
        <div class="core-info-field">
            <label for="core-people">Key People</label>
            <textarea id="core-people" class="text-input" placeholder="List the most important people in your life and their relationship to you (e.g., Jane Doe - my wife, John Smith - my best friend).">${this.coreInfo.people}</textarea>
        </div>
        <div class="core-info-field">
            <label for="core-values">Core Values</label>
            <textarea id="core-values" class="text-input" placeholder="What are the core values you live by? (e.g., Honesty, Family, Hard Work).">${this.coreInfo.values}</textarea>
        </div>
        <div class="core-info-actions">
            <span class="core-info-status"></span>
            <button class="primary-button" id="save-core-info-btn">Save Foundation</button>
        </div>
      </div>
    `;

    const header = container.querySelector('.chapter-header') as HTMLElement;
    header.addEventListener('click', () => {
        container.classList.toggle('closed');
    });

    const saveBtn = container.querySelector('#save-core-info-btn') as HTMLButtonElement;
    saveBtn.addEventListener('click', () => {
        this.coreInfo.summary = (container.querySelector('#core-summary') as HTMLTextAreaElement).value.trim();
        this.coreInfo.people = (container.querySelector('#core-people') as HTMLTextAreaElement).value.trim();
        this.coreInfo.values = (container.querySelector('#core-values') as HTMLTextAreaElement).value.trim();
        this.saveState();

        const statusEl = container.querySelector('.core-info-status') as HTMLSpanElement;
        statusEl.textContent = 'Saved!';
        statusEl.style.opacity = '1';
        setTimeout(() => { statusEl.style.opacity = '0' }, 2000);
        
        // If chat is active, reset it to use new context
        this.chat = null; 
    });

    return container;
  }

  private createJournalSection(): HTMLElement {
    const chapterContainer = document.createElement('div');
    chapterContainer.className = 'chapter-container';
    if (this.openChapter === 'Journal') {
        chapterContainer.classList.add('open');
    }

    chapterContainer.innerHTML = `
        <div class="chapter-header">
            <div class="chapter-header-info">
                <span class="chapter-title"><i class="fas fa-feather-alt"></i> My Journal</span>
                <span class="chapter-progress">${this.journalEntries.length} entries</span>
            </div>
            <i class="fas fa-chevron-down chapter-toggle-icon"></i>
        </div>
        <div class="chapter-content journal-content">
            <button class="primary-button" id="add-new-entry-btn"><i class="fas fa-plus"></i> Add New Entry</button>
            <div class="journal-entry-list"></div>
        </div>
    `;

    const entryList = chapterContainer.querySelector('.journal-entry-list')!;
    if (this.journalEntries.length === 0) {
        entryList.innerHTML = `<p class="empty-state-text">You haven't written any journal entries yet. Click "Add New Entry" to start!</p>`;
    } else {
        this.journalEntries
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .forEach(entry => {
                entryList.appendChild(this.createJournalEntryCard(entry));
            });
    }

    chapterContainer.querySelector('#add-new-entry-btn')?.addEventListener('click', () => this.openJournalModal(null));

    const header = chapterContainer.querySelector('.chapter-header') as HTMLElement;
    header.addEventListener('click', () => {
        this.toggleChapter('Journal', chapterContainer);
    });

    return chapterContainer;
  }

  private createJournalEntryCard(entry: JournalEntry): HTMLElement {
      const card = document.createElement('div');
      card.className = 'journal-entry-card';
      card.innerHTML = `
          <h4>${entry.title}</h4>
          <p>${new Date(entry.date + 'T00:00:00').toLocaleDateString()}</p>
      `;
      card.addEventListener('click', () => this.openJournalModal(entry));
      return card;
  }

  private createChapterDropdown(stage: string): HTMLElement {
    const questionsForStage = MASTER_QUESTION_ROLODEX.filter(q => q.lifeStage === stage);
    const answeredCount = questionsForStage.filter(q => this.answers.has(q.id)).length;
    
    const chapterContainer = document.createElement('div');
    chapterContainer.className = 'chapter-container';
    if(this.openChapter === stage) {
      chapterContainer.classList.add('open');
    }

    const chapterHeader = document.createElement('div');
    chapterHeader.className = 'chapter-header';
    chapterHeader.innerHTML = `
      <div class="chapter-header-info">
        <span class="chapter-title">${stage}</span>
        <span class="chapter-progress">${answeredCount} / ${questionsForStage.length} answered</span>
      </div>
      <i class="fas fa-chevron-down chapter-toggle-icon"></i>
    `;

    const chapterContent = document.createElement('div');
    chapterContent.className = 'chapter-content';
    const questionList = document.createElement('div');
    questionList.className = 'question-list';
    questionsForStage.forEach(q => {
      questionList.appendChild(this.createQuestionCard(q));
    });
    chapterContent.appendChild(questionList);
    
    chapterHeader.addEventListener('click', () => {
      this.toggleChapter(stage, chapterContainer);
    });

    chapterContainer.appendChild(chapterHeader);
    chapterContainer.appendChild(chapterContent);
    return chapterContainer;
  }
  
  private toggleChapter(stage: string, container: HTMLElement): void {
      const wasOpen = this.openChapter === stage;

      // First, find and close any currently open chapter in the DOM.
      const currentlyOpenEl = this.dashboardContent.querySelector('.chapter-container.open');
      if (currentlyOpenEl) {
          currentlyOpenEl.classList.remove('open');
      }

      // Update the application state.
      this.openChapter = wasOpen ? null : stage;
      this.saveState();
      
      // If we are opening a chapter (i.e., it wasn't open before), add the 'open' class to the target container.
      if (!wasOpen) {
          container.classList.add('open');
      }
  }

  private createQuestionCard(question: Question): HTMLElement {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.id = `q-card-${question.id}`;
    
    const answer = this.answers.get(question.id);
    if (answer) {
      card.classList.add('answered');
      card.innerHTML = this.getAnsweredCardHTML(question, answer);
      card.querySelector('.edit-answer-btn')?.addEventListener('click', () => {
        this.renderCardAsUnanswered(card, question);
      });
    } else {
      card.innerHTML = this.getUnansweredCardHTML(question);
      this.attachInputListeners(card, question);
    }
    return card;
  }

  private getAnsweredCardHTML(question: Question, answer: Answer): string {
    let photoHTML = '';
    if (answer.photo) {
        photoHTML = `
            <div class="answered-photo-container">
                <img src="${answer.photo.data}" alt="User provided photo" class="answered-photo">
                <p class="answered-annotation">${answer.photo.annotation}</p>
            </div>
        `;
    }

    return `
      <p class="question-text">${question.text}</p>
      <div class="answer-container">
        <p class="answer-text">${answer.text}</p>
        ${photoHTML}
      </div>
      <div class="answer-actions">
        <button class="secondary-button edit-answer-btn" data-question-id="${question.id}">Edit Answer</button>
      </div>
    `;
  }
  
  private getUnansweredCardHTML(question: Question): string {
    return `
      <p class="question-text">${question.text}</p>
      <div class="input-controls" data-question-id="${question.id}">
        <div class="input-mode-selector">
            <button class="mode-btn active" data-mode="voice"><i class="fas fa-microphone"></i> Record Voice</button>
            <button class="mode-btn" data-mode="text"><i class="fas fa-keyboard"></i> Type Answer</button>
        </div>

        <div class="input-area">
          <div class="input-mode-container" data-mode="text">
            <textarea class="text-input" placeholder="Type your answer here..."></textarea>
          </div>
          <div class="input-mode-container active" data-mode="voice">
             <div class="voice-input-placeholder">
                <i class="fas fa-microphone fa-2x"></i>
                <span>Click to Record Answer</span>
             </div>
          </div>
        </div>
        
        <div class="photo-upload-area">
             <div class="photo-preview-container" style="display: none;">
                <img class="photo-preview" src="" alt="Photo preview"/>
                <button class="remove-photo-btn">&times;</button>
                <textarea class="photo-annotation-input" placeholder="Add an annotation for this photo..."></textarea>
            </div>
            <label class="add-photo-label">
                <i class="fas fa-camera"></i> Add Photo
                <input type="file" class="photo-input" accept="image/*" style="display: none;">
            </label>
        </div>

        <div class="input-actions">
          <span class="input-status">Ready to record or type.</span>
          <div class="actions-right">
            <button class="primary-button save-answer-btn">Save Answer</button>
          </div>
        </div>
      </div>
    `;
  }

  private renderCardAsUnanswered(card: HTMLElement, question: Question): void {
    card.classList.remove('answered');
    card.innerHTML = this.getUnansweredCardHTML(question);
    const answer = this.answers.get(question.id);
    if (answer) {
        (card.querySelector('.text-input') as HTMLTextAreaElement).value = answer.text;
        if (answer.photo) {
            const previewContainer = card.querySelector('.photo-preview-container') as HTMLDivElement;
            const previewImg = card.querySelector('.photo-preview') as HTMLImageElement;
            const annotationInput = card.querySelector('.photo-annotation-input') as HTMLTextAreaElement;
            const addPhotoLabel = card.querySelector('.add-photo-label') as HTMLLabelElement;

            previewImg.src = answer.photo.data;
            annotationInput.value = answer.photo.annotation;
            previewContainer.style.display = 'block';
            addPhotoLabel.style.display = 'none';
        }
    }
    this.attachInputListeners(card, question);
  }

  private attachInputListeners(card: HTMLElement, question: Question): void {
    const modeBtns = card.querySelectorAll('.mode-btn');
    const voicePlaceholder = card.querySelector('.voice-input-placeholder') as HTMLDivElement;
    const saveBtn = card.querySelector('.save-answer-btn') as HTMLButtonElement;
    
    // Photo elements
    const photoInput = card.querySelector('.photo-input') as HTMLInputElement;
    const addPhotoLabel = card.querySelector('.add-photo-label') as HTMLLabelElement;
    const previewContainer = card.querySelector('.photo-preview-container') as HTMLDivElement;
    const previewImg = card.querySelector('.photo-preview') as HTMLImageElement;
    const removePhotoBtn = card.querySelector('.remove-photo-btn') as HTMLButtonElement;

    // Toggle Input Mode
    modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetMode = (e.currentTarget as HTMLElement).dataset.mode;
            modeBtns.forEach(b => b.classList.remove('active'));
            (e.currentTarget as HTMLElement).classList.add('active');
            
            card.querySelectorAll('.input-mode-container').forEach(container => {
                if ((container as HTMLElement).dataset.mode === targetMode) {
                    container.classList.add('active');
                } else {
                    container.classList.remove('active');
                }
            });
        });
    });

    // Voice Input
    voicePlaceholder.addEventListener('click', (e) => {
        e.stopPropagation();
        if(this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording(question, card);
        }
    });
    
    // Photo Input
    photoInput.addEventListener('change', async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            const base64 = await this.blobToBase64(file);
            previewImg.src = base64;
            previewContainer.style.display = 'block';
            addPhotoLabel.style.display = 'none';
        }
    });

    removePhotoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        photoInput.value = ''; // Clear file input
        previewImg.src = '';
        previewContainer.style.display = 'none';
        addPhotoLabel.style.display = 'flex';
    });

    // Save Answer
    saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const textInput = card.querySelector('.text-input') as HTMLTextAreaElement;
      const annotationInput = card.querySelector('.photo-annotation-input') as HTMLTextAreaElement;

      const answer: Answer = { text: textInput.value.trim() };

      if (previewImg.src && previewImg.src.startsWith('data:image')) {
          answer.photo = {
              data: previewImg.src,
              annotation: annotationInput.value.trim()
          };
      }
      
      this.saveAnswer(answer, question.id);
    });
  }

  private handleBeginAnswer(question: Question, card: HTMLElement): void {
      if(question.sensitivity === 'High' || question.sensitivity === 'Medium') {
        this.activeQuestionForConsent = { question, card };
        this.showConsentModal();
      } else {
        this.proceedWithRecording(question, card);
      }
  }

  private showConsentModal(): void {
    if (!this.activeQuestionForConsent) return;
    const sensitivity = this.activeQuestionForConsent.question.sensitivity;
    this.consentPromptText.textContent = sensitivity === 'High' 
        ? "The next question is about a potentially sensitive topic. Is this something you feel comfortable discussing today?"
        : "This topic may be a bit more personal. Are you ready to continue?";
    this.consentModal.style.display = 'flex';
    setTimeout(() => this.consentModal.classList.add('visible'), 10);
  }

  private handleConsent(didConsent: boolean): void {
    if(!this.activeQuestionForConsent) return;
    const { question, card } = this.activeQuestionForConsent;
    
    this.consentModal.classList.remove('visible');
    setTimeout(() => { if (!this.consentModal.classList.contains('visible')) this.consentModal.style.display = 'none'; }, 200);

    if (didConsent) {
      this.proceedWithRecording(question, card);
    }
    this.activeQuestionForConsent = null;
  }

  private saveAnswer(answer: Answer, questionId: string): void {
    this.answers.set(questionId, answer);
    this.saveState();
    this.renderDashboard(); // Re-render to update progress and card state
  }

  private async startRecording(question: Question, card: HTMLElement): Promise<void> {
    if(question.sensitivity !== 'Low') {
      this.handleBeginAnswer(question, card);
    } else {
      this.proceedWithRecording(question, card);
    }
  }
  
  private async proceedWithRecording(question: Question, card: HTMLElement): Promise<void> {
    if (this.isRecording) await this.stopRecording();
    
    this.speak(question.text);
    const voicePlaceholder = card.querySelector('.voice-input-placeholder') as HTMLDivElement;
    const statusEl = card.querySelector('.input-status') as HTMLSpanElement;

    try {
      this.audioChunks = [];
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = async () => {
        this.isRecording = false;
        voicePlaceholder.classList.remove('recording');
        voicePlaceholder.innerHTML = `<i class="fas fa-microphone fa-2x"></i><span>Click to Record Answer</span>`;
        statusEl.textContent = 'Processing audio...';
        
        if (this.audioChunks.length > 0) {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const base64Audio = await this.blobToBase64(audioBlob);
          const transcription = await this.getTranscription(base64Audio, 'audio/webm');
          if (transcription) {
            (card.querySelector('.text-input') as HTMLTextAreaElement).value = transcription;
            statusEl.textContent = 'Transcription complete. Add photo or save.';
          } else {
            statusEl.textContent = "Couldn't hear that. Try again.";
          }
        }
        this.stream?.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      statusEl.textContent = 'Recording... Click to stop.';
      voicePlaceholder.classList.add('recording');
      voicePlaceholder.innerHTML = `<i class="fas fa-stop fa-2x"></i><span>Recording...</span>`;
    } catch (error) {
      console.error('Error starting recording:', error);
      statusEl.textContent = 'Microphone access denied.';
    }
  }

  private async stopRecording(): Promise<void> {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            resolve(reader.result as string);
        };
        reader.onerror = reject;
    });
  }

  private async getTranscription(base64Audio: string, mimeType: string): Promise<string | null> {
    try {
      const audioData = base64Audio.split(',')[1];
      const contents = { parts: [
        { text: 'Transcribe this audio recording of a person telling their life story. Transcribe it clearly and accurately, keeping the exact words spoken.' },
        { inlineData: { mimeType: mimeType, data: audioData } },
      ]};
      const response = await this.genAI.models.generateContent({ model: MODEL_NAME, contents: contents });
      return response.text.trim();
    } catch (error) {
      console.error('Error getting transcription:', error);
      return null;
    }
  }

  // --- Journal Logic ---
  private openJournalModal(entry: JournalEntry | null): void {
      this.journalForm.reset();
      if (entry) { // Editing existing entry
          this.journalModalTitle.textContent = 'Edit Journal Entry';
          this.journalEntryIdInput.value = entry.id;
          this.journalTitleInput.value = entry.title;
          this.journalDateInput.value = entry.date;
          this.journalContentInput.value = entry.content;
          this.journalDeleteBtn.style.display = 'block';
      } else { // Creating new entry
          this.journalModalTitle.textContent = 'New Journal Entry';
          this.journalEntryIdInput.value = '';
          this.journalDateInput.value = new Date().toISOString().split('T')[0];
          this.journalDeleteBtn.style.display = 'none';
      }
      this.journalModal.style.display = 'flex';
      setTimeout(() => this.journalModal.classList.add('visible'), 10);
  }

  private closeJournalModal(): void {
      this.journalModal.classList.remove('visible');
      setTimeout(() => { if (!this.journalModal.classList.contains('visible')) this.journalModal.style.display = 'none'; }, 200);
  }

  private handleSaveJournalEntry(event: Event): void {
      event.preventDefault();
      const id = this.journalEntryIdInput.value;
      const newEntry: JournalEntry = {
          id: id || Date.now().toString(),
          title: this.journalTitleInput.value.trim(),
          date: this.journalDateInput.value,
          content: this.journalContentInput.value.trim(),
      };

      if (id) { // Update existing
          const index = this.journalEntries.findIndex(e => e.id === id);
          if (index > -1) {
              this.journalEntries[index] = newEntry;
          }
      } else { // Add new
          this.journalEntries.push(newEntry);
      }

      this.saveState();
      this.closeJournalModal();
      this.renderDashboard();
  }

  private handleDeleteJournalEntry(): void {
      const id = this.journalEntryIdInput.value;
      if (id && confirm('Are you sure you want to delete this journal entry?')) {
          this.journalEntries = this.journalEntries.filter(e => e.id !== id);
          this.saveState();
          this.closeJournalModal();
          this.renderDashboard();
      }
  }

  // --- Compile & Export Logic ---

  private openCompileModal(): void {
    this.memoirPreviewContent.innerHTML = this.generateMemoirHTML(true);
    this.titleSuggestionsContainer.innerHTML = ''; // Clear previous suggestions
    this.compileModal.style.display = 'flex';
    setTimeout(() => this.compileModal.classList.add('visible'), 10);
  }

  private closeCompileModal(): void {
    this.compileModal.classList.remove('visible');
    setTimeout(() => { if (!this.compileModal.classList.contains('visible')) this.compileModal.style.display = 'none'; }, 200);
  }

  private async handleSuggestTitles(): Promise<void> {
    const memoirText = this.memoirPreviewContent.innerText;
    if (memoirText.trim().length < 100) {
        this.titleSuggestionsContainer.innerHTML = '<p>Please write more of your story before asking for title suggestions.</p>';
        return;
    }

    this.titleSuggestionsContainer.innerHTML = '<div class="spinner"></div>';
    this.suggestTitleBtn.disabled = true;

    try {
      const prompt = `Based on the following life story, suggest 5 creative and fitting titles for this memoir. Return them as a simple list with each title on a new line. Do not use markdown, numbering, or quotes.

---
${memoirText}
---`;
      const response = await this.genAI.models.generateContent({ model: MODEL_NAME, contents: prompt });
      const suggestions = response.text.trim().split('\n').filter(s => s);
      
      let suggestionsHTML = '<ul>';
      suggestions.forEach(title => {
          suggestionsHTML += `<li>${title}</li>`;
      });
      suggestionsHTML += '</ul>';
      this.titleSuggestionsContainer.innerHTML = suggestionsHTML;

    } catch (error) {
        console.error("Error fetching title suggestions:", error);
        this.titleSuggestionsContainer.innerHTML = '<p>Sorry, there was an error getting suggestions. Please try again.</p>';
    } finally {
        this.suggestTitleBtn.disabled = false;
    }
  }

  private generateMemoirHTML(isPreview: boolean = false): string {
    const nameAnswer = this.answers.get('B-001');
    const userName = nameAnswer ? nameAnswer.text.split(',')[0].trim() : "Memoir";

    let bodyContent = `<h1>The Living Memoir of ${userName}</h1>`;
    bodyContent += `<p><em>Compiled on: ${new Date().toLocaleString()}</em></p>`;
    
    // Journal Entries
    if (this.journalEntries.length > 0) {
        bodyContent += `<hr><h2 class="chapter-start">CHAPTER: My Journal</h2>`;
        const sortedEntries = [...this.journalEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        sortedEntries.forEach(entry => {
            const entryDate = new Date(entry.date + 'T00:00:00').toLocaleDateString();
            bodyContent += `<h3>${entry.title}</h3>`;
            bodyContent += `<p><em>${entryDate}</em></p>`;
            bodyContent += `<p>${entry.content.replace(/\n/g, '<br>')}</p>`;
        });
    }

    // Question-based chapters
    LIFE_STAGES.forEach(stage => {
        const stageAnswers = MASTER_QUESTION_ROLODEX
            .filter(q => q.lifeStage === stage && this.answers.has(q.id));
        
        if (stageAnswers.length > 0) {
            bodyContent += `<hr><h2 class="chapter-start">CHAPTER: ${stage}</h2>`;
            stageAnswers.forEach(q => {
                const answer = this.answers.get(q.id);
                if (answer) {
                    bodyContent += `<h3>Q: ${q.text}</h3>`;
                    bodyContent += `<p><strong>A:</strong> ${answer.text.replace(/\n/g, '<br>')}</p>`;
                    if (answer.photo) {
                        bodyContent += `
                            <div style="margin: 1em 0;">
                                <img src="${answer.photo.data}" alt="User photo for question: ${q.text}" style="max-width: 100%; height: auto; border-radius: 8px;">
                                <p><em>${answer.photo.annotation}</em></p>
                            </div>
                        `;
                    }
                }
            });
        }
    });

    if (isPreview) return bodyContent;

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>The Living Memoir of ${userName}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 2em auto; padding: 0 1em; }
                h1, h2, h3 { color: #333; }
                hr { border: 0; border-top: 1px solid #eee; margin: 2em 0; }
                img { max-width: 100%; border-radius: 8px; break-inside: avoid; }
                p { color: #555; }
                em { color: #777; }
                @media print {
                    .chapter-start { break-before: page; }
                    h1, h2, h3, p, img { break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            ${bodyContent}
        </body>
        </html>
    `;
  }

  private exportAsPDF(): void {
    const memoirHTML = this.generateMemoirHTML(false);
    const printWindow = window.open('', '', 'height=800,width=800');
    
    if (printWindow) {
        printWindow.document.write(memoirHTML);
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
        };
    } else {
        alert('Please allow pop-ups for this website to export your memoir as a PDF.');
    }
  }

  // --- AI Chatbot Assistant Logic ---

  private toggleChat(show: boolean): void {
      if (show) {
          this.initializeChat();
          this.chatModal.style.display = 'flex';
          setTimeout(() => this.chatModal.classList.add('visible'), 10);
          this.chatInput.focus();
      } else {
          this.chatModal.classList.remove('visible');
          setTimeout(() => { if (!this.chatModal.classList.contains('visible')) this.chatModal.style.display = 'none'; }, 200);
      }
  }

  private initializeChat(): void {
      if (this.chat) return;
      
      let context = "You are a friendly and empathetic Memoir Assistant. Your goal is to help the user document their life story. You can help them understand questions, rephrase them, offer encouragement, and suggest what to work on next. Keep your answers concise and supportive.\n\n";
      context += "Here is some core information about the user to help you personalize your responses:\n";
      if (this.coreInfo.summary) context += `- Life Summary: ${this.coreInfo.summary}\n`;
      if (this.coreInfo.people) context += `- Key People: ${this.coreInfo.people}\n`;
      if (this.coreInfo.values) context += `- Core Values: ${this.coreInfo.values}\n`;

      this.chat = this.genAI.chats.create({ 
          model: MODEL_NAME, 
          config: { systemInstruction: context } 
      });

      this.addMessageToChatUI("Hello! How can I help you with your memoir today?", "bot");
  }

  private async handleSendMessage(): Promise<void> {
      const message = this.chatInput.value.trim();
      if (!message) return;

      this.addMessageToChatUI(message, "user");
      this.chatInput.value = '';
      this.chatInput.style.height = 'auto';
      this.chatSendBtn.disabled = true;

      const typingIndicator = this.addMessageToChatUI("...", "bot", true);

      try {
          if (!this.chat) this.initializeChat();
          const response = await this.chat!.sendMessage({ message });
          
          typingIndicator.remove();
          this.addMessageToChatUI(response.text, "bot");
      } catch (error) {
          console.error("Chat error:", error);
          typingIndicator.remove();
          this.addMessageToChatUI("Sorry, I encountered an error. Please try again.", "bot");
      } finally {
          this.chatSendBtn.disabled = false;
      }
  }

  private addMessageToChatUI(text: string, sender: 'user' | 'bot', isTyping: boolean = false): HTMLElement {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${sender}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    if (isTyping) {
        messageElement.classList.add('typing');
        bubble.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
    } else {
        bubble.textContent = text;
    }
    
    messageElement.appendChild(bubble);
    this.chatMessages.appendChild(messageElement);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    return messageElement;
  }
}

document.addEventListener('DOMContentLoaded', () => new LivingMemoirApp());
export {};