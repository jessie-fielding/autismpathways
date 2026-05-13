// ─── Parenting Pathways Strategy Content Matrix ───────────────────────────────
// Strategies are matched by: situation + location + intensity
// Intensity: 'building' | 'full' | 'unsafe'
// Location: 'home' | 'school' | 'public' | 'car'
// Situation: 'meltdown' | 'aggression' | 'refusal' | 'sensory' | 'shutdown' | 'anxiety' | 'transition' | 'other'

export type Situation = 'meltdown' | 'aggression' | 'refusal' | 'sensory' | 'shutdown' | 'anxiety' | 'transition' | 'other';
export type Location = 'home' | 'school' | 'public' | 'car';
export type Intensity = 'building' | 'full' | 'unsafe';

export interface Strategy {
  id: string;
  title: string;
  body: string;
  tag?: string; // e.g. "Sensory", "De-escalation", "Safety"
}

// ─── Master strategy pool ─────────────────────────────────────────────────────

const STRATEGIES: Record<string, Strategy> = {
  // De-escalation / Regulation
  lower_voice: {
    id: 'lower_voice',
    title: 'Drop your voice to a whisper',
    body: 'Lower your own voice to almost a whisper. It forces your child\'s nervous system to quiet down to hear you, and signals safety rather than threat.',
    tag: 'De-escalation',
  },
  reduce_demands: {
    id: 'reduce_demands',
    title: 'Remove all demands right now',
    body: 'Stop asking, directing, or correcting. Every demand adds fuel. Go silent or use only one word at a time. The goal right now is regulation, not compliance.',
    tag: 'De-escalation',
  },
  create_space: {
    id: 'create_space',
    title: 'Create physical space',
    body: 'Move yourself and others back. Give your child 3–6 feet of space. Crowding increases panic. Stay calm and visible, but don\'t hover.',
    tag: 'De-escalation',
  },
  narrate_calm: {
    id: 'narrate_calm',
    title: 'Narrate calm with your body',
    body: 'Sit or crouch down to be at or below eye level. Slow your own breathing visibly. Your nervous system is regulating theirs — they co-regulate with you.',
    tag: 'De-escalation',
  },
  validate_feeling: {
    id: 'validate_feeling',
    title: 'Name the feeling out loud',
    body: 'Say: "You\'re really upset right now. That makes sense." Don\'t try to fix it yet. Validation reduces the emotional charge before problem-solving can happen.',
    tag: 'De-escalation',
  },
  // Sensory
  sensory_input: {
    id: 'sensory_input',
    title: 'Offer heavy work or deep pressure',
    body: 'Try a firm hug (if accepted), pushing against a wall, carrying something heavy, or squeezing a stress ball. Proprioceptive input helps regulate the nervous system fast.',
    tag: 'Sensory',
  },
  reduce_sensory: {
    id: 'reduce_sensory',
    title: 'Reduce sensory input immediately',
    body: 'Turn off or dim lights, lower or mute sound, reduce visual clutter. Move away from the sensory source if possible. The environment is the problem, not the child.',
    tag: 'Sensory',
  },
  sensory_kit: {
    id: 'sensory_kit',
    title: 'Reach for the sensory kit',
    body: 'Offer noise-cancelling headphones, sunglasses, a chewy, a fidget, or a weighted item. Giving your child a tool puts them in control of their own regulation.',
    tag: 'Sensory',
  },
  // Movement / Escape
  movement_break: {
    id: 'movement_break',
    title: 'Offer a movement break',
    body: 'Say: "Let\'s walk" or "Can you run to that tree and back?" Movement burns off cortisol and adrenaline faster than any verbal strategy.',
    tag: 'Regulation',
  },
  safe_exit: {
    id: 'safe_exit',
    title: 'Create an exit path',
    body: 'Guide your child toward a quieter, less stimulating space — a hallway, a corner, outside. Escape is not failure. It\'s a regulation strategy.',
    tag: 'De-escalation',
  },
  car_exit: {
    id: 'car_exit',
    title: 'Pull over safely and pause',
    body: 'If it\'s safe to do so, pull over and stop the car. Turn off the radio. Say nothing for 60 seconds. Continuing to drive during a meltdown is a safety risk.',
    tag: 'Safety',
  },
  // Refusal
  offer_choice: {
    id: 'offer_choice',
    title: 'Offer two acceptable choices',
    body: 'Instead of a directive, offer a choice: "Do you want to do this now or in 5 minutes?" or "Do you want to walk or hop?" Choice restores a sense of control.',
    tag: 'Refusal',
  },
  first_then: {
    id: 'first_then',
    title: 'Use First-Then language',
    body: 'Say: "First [the thing they\'re refusing], then [something they want]." Keep it short and visual if possible. Avoid "if-then" which sounds like a threat.',
    tag: 'Refusal',
  },
  reduce_task: {
    id: 'reduce_task',
    title: 'Shrink the task',
    body: 'Break the task into the smallest possible first step. "Just put on one shoe." Momentum builds once the first step is done. Don\'t show the whole staircase.',
    tag: 'Refusal',
  },
  // Anxiety
  breathing_together: {
    id: 'breathing_together',
    title: 'Breathe together visibly',
    body: 'Do box breathing or slow exhales out loud yourself. Don\'t instruct — model. Say: "I\'m going to take a slow breath." Your child\'s nervous system will follow.',
    tag: 'Anxiety',
  },
  preview_next: {
    id: 'preview_next',
    title: 'Preview exactly what comes next',
    body: 'Anxiety spikes when the next step is unknown. Say: "After this, we are going to [specific thing], and then we\'re done." Predictability is calming.',
    tag: 'Anxiety',
  },
  grounding: {
    id: 'grounding',
    title: 'Try a grounding exercise',
    body: 'Ask: "Can you find 3 things you can see?" or "Press your feet into the floor — can you feel that?" Grounding pulls attention from the anxious thought to the present moment.',
    tag: 'Anxiety',
  },
  // Shutdown
  no_talk: {
    id: 'no_talk',
    title: 'Stop talking — be quietly present',
    body: 'Shutdown means the nervous system is overwhelmed. More words make it worse. Sit nearby in silence. Your calm presence is the intervention. Wait it out.',
    tag: 'Shutdown',
  },
  low_demand_offer: {
    id: 'low_demand_offer',
    title: 'Offer something with no strings',
    body: 'Quietly place a preferred item, snack, or comfort object nearby without comment. Don\'t ask them to engage with it. Just make it available.',
    tag: 'Shutdown',
  },
  // Transition
  transition_warning: {
    id: 'transition_warning',
    title: 'Give a 5-minute and 2-minute warning',
    body: 'If you\'re still in the lead-up: "5 more minutes, then we\'re leaving." Then: "2 more minutes." Transitions are hard because endings feel sudden. Warnings help.',
    tag: 'Transition',
  },
  transition_object: {
    id: 'transition_object',
    title: 'Bring something from the current place',
    body: 'Let your child bring one item from where they are to where they\'re going. It bridges the transition and reduces the sense of loss.',
    tag: 'Transition',
  },
  name_destination: {
    id: 'name_destination',
    title: 'Name what\'s waiting at the destination',
    body: 'Tell them one specific thing they\'ll get to do or see when they arrive. Make the destination concrete and appealing, not just "we have to go."',
    tag: 'Transition',
  },
  // Aggression
  protect_first: {
    id: 'protect_first',
    title: 'Protect yourself and others first',
    body: 'Move yourself and other children out of reach. Don\'t restrain unless there is immediate danger. Restraint escalates. Create distance and wait.',
    tag: 'Safety',
  },
  no_lecture: {
    id: 'no_lecture',
    title: 'Do not lecture during aggression',
    body: 'The prefrontal cortex is offline. Reasoning, consequences, and explanations will not land right now. Save the conversation for when they are fully calm — at least 20 minutes later.',
    tag: 'De-escalation',
  },
  block_redirect: {
    id: 'block_redirect',
    title: 'Block and redirect, don\'t punish',
    body: 'If they\'re hitting an object: block the behavior calmly and redirect to a safe alternative (pillow, cushion). Don\'t match their energy with anger.',
    tag: 'Safety',
  },
  // Public
  public_exit: {
    id: 'public_exit',
    title: 'Exit the environment without shame',
    body: 'Leave calmly and without apology to bystanders. Say only: "We\'re going to take a break." Your child needs to know leaving is a tool, not a punishment.',
    tag: 'Public',
  },
  ignore_crowd: {
    id: 'ignore_crowd',
    title: 'Ignore the audience entirely',
    body: 'Other people\'s discomfort is not your emergency. Your only job is your child\'s nervous system. Turn your back to the crowd and focus on your child.',
    tag: 'Public',
  },
  // School
  request_support: {
    id: 'request_support',
    title: 'Request a staff member or aide',
    body: 'If you\'re at school: ask for your child\'s aide, counselor, or a trusted staff member. Familiar adults can help regulate when parents aren\'t present.',
    tag: 'School',
  },
  quiet_space: {
    id: 'quiet_space',
    title: 'Move to the quiet/calm-down space',
    body: 'If the school has a sensory room, calm-down corner, or quiet hallway: move there now. Environment change alone can interrupt the escalation cycle.',
    tag: 'School',
  },
};

// ─── Strategy matrix ──────────────────────────────────────────────────────────
// Returns [primaryId, ...secondaryIds] for a given combination

type MatrixKey = `${Situation}_${Location}_${Intensity}`;

const MATRIX: Partial<Record<MatrixKey, string[]>> = {
  // MELTDOWN
  meltdown_home_building: ['reduce_demands', 'create_space', 'sensory_input', 'validate_feeling'],
  meltdown_home_full: ['create_space', 'reduce_demands', 'narrate_calm', 'sensory_input'],
  meltdown_home_unsafe: ['protect_first', 'create_space', 'no_lecture', 'reduce_demands'],
  meltdown_school_building: ['quiet_space', 'reduce_demands', 'request_support', 'validate_feeling'],
  meltdown_school_full: ['quiet_space', 'request_support', 'create_space', 'reduce_demands'],
  meltdown_school_unsafe: ['protect_first', 'request_support', 'create_space', 'no_lecture'],
  meltdown_public_building: ['safe_exit', 'reduce_sensory', 'validate_feeling', 'lower_voice'],
  meltdown_public_full: ['public_exit', 'ignore_crowd', 'create_space', 'reduce_demands'],
  meltdown_public_unsafe: ['public_exit', 'protect_first', 'ignore_crowd', 'no_lecture'],
  meltdown_car_building: ['lower_voice', 'reduce_demands', 'preview_next', 'validate_feeling'],
  meltdown_car_full: ['car_exit', 'reduce_demands', 'create_space', 'narrate_calm'],
  meltdown_car_unsafe: ['car_exit', 'protect_first', 'reduce_demands', 'no_lecture'],

  // AGGRESSION
  aggression_home_building: ['reduce_demands', 'create_space', 'validate_feeling', 'lower_voice'],
  aggression_home_full: ['protect_first', 'create_space', 'no_lecture', 'block_redirect'],
  aggression_home_unsafe: ['protect_first', 'no_lecture', 'create_space', 'block_redirect'],
  aggression_school_building: ['request_support', 'quiet_space', 'reduce_demands', 'create_space'],
  aggression_school_full: ['protect_first', 'request_support', 'create_space', 'no_lecture'],
  aggression_school_unsafe: ['protect_first', 'request_support', 'no_lecture', 'block_redirect'],
  aggression_public_building: ['safe_exit', 'create_space', 'lower_voice', 'reduce_demands'],
  aggression_public_full: ['public_exit', 'protect_first', 'ignore_crowd', 'no_lecture'],
  aggression_public_unsafe: ['public_exit', 'protect_first', 'ignore_crowd', 'no_lecture'],
  aggression_car_building: ['lower_voice', 'reduce_demands', 'validate_feeling', 'create_space'],
  aggression_car_full: ['car_exit', 'protect_first', 'no_lecture', 'create_space'],
  aggression_car_unsafe: ['car_exit', 'protect_first', 'no_lecture', 'block_redirect'],

  // REFUSAL
  refusal_home_building: ['offer_choice', 'first_then', 'reduce_task', 'validate_feeling'],
  refusal_home_full: ['reduce_demands', 'offer_choice', 'first_then', 'validate_feeling'],
  refusal_home_unsafe: ['reduce_demands', 'create_space', 'protect_first', 'no_lecture'],
  refusal_school_building: ['offer_choice', 'first_then', 'request_support', 'reduce_task'],
  refusal_school_full: ['reduce_demands', 'request_support', 'offer_choice', 'quiet_space'],
  refusal_school_unsafe: ['protect_first', 'request_support', 'reduce_demands', 'no_lecture'],
  refusal_public_building: ['offer_choice', 'first_then', 'lower_voice', 'validate_feeling'],
  refusal_public_full: ['safe_exit', 'reduce_demands', 'offer_choice', 'ignore_crowd'],
  refusal_public_unsafe: ['public_exit', 'protect_first', 'reduce_demands', 'no_lecture'],
  refusal_car_building: ['offer_choice', 'preview_next', 'first_then', 'validate_feeling'],
  refusal_car_full: ['car_exit', 'reduce_demands', 'offer_choice', 'narrate_calm'],
  refusal_car_unsafe: ['car_exit', 'protect_first', 'reduce_demands', 'no_lecture'],

  // SENSORY OVERLOAD
  sensory_home_building: ['reduce_sensory', 'sensory_kit', 'sensory_input', 'create_space'],
  sensory_home_full: ['reduce_sensory', 'sensory_input', 'safe_exit', 'create_space'],
  sensory_home_unsafe: ['reduce_sensory', 'protect_first', 'create_space', 'safe_exit'],
  sensory_school_building: ['quiet_space', 'sensory_kit', 'reduce_sensory', 'request_support'],
  sensory_school_full: ['quiet_space', 'request_support', 'reduce_sensory', 'sensory_input'],
  sensory_school_unsafe: ['protect_first', 'quiet_space', 'request_support', 'reduce_sensory'],
  sensory_public_building: ['reduce_sensory', 'sensory_kit', 'safe_exit', 'lower_voice'],
  sensory_public_full: ['public_exit', 'reduce_sensory', 'sensory_input', 'ignore_crowd'],
  sensory_public_unsafe: ['public_exit', 'protect_first', 'reduce_sensory', 'ignore_crowd'],
  sensory_car_building: ['reduce_sensory', 'sensory_kit', 'lower_voice', 'validate_feeling'],
  sensory_car_full: ['car_exit', 'reduce_sensory', 'sensory_input', 'create_space'],
  sensory_car_unsafe: ['car_exit', 'protect_first', 'reduce_sensory', 'no_lecture'],

  // SHUTDOWN
  shutdown_home_building: ['no_talk', 'low_demand_offer', 'create_space', 'reduce_demands'],
  shutdown_home_full: ['no_talk', 'create_space', 'low_demand_offer', 'reduce_demands'],
  shutdown_home_unsafe: ['no_talk', 'protect_first', 'create_space', 'reduce_demands'],
  shutdown_school_building: ['quiet_space', 'no_talk', 'request_support', 'low_demand_offer'],
  shutdown_school_full: ['quiet_space', 'request_support', 'no_talk', 'low_demand_offer'],
  shutdown_school_unsafe: ['protect_first', 'quiet_space', 'request_support', 'no_talk'],
  shutdown_public_building: ['safe_exit', 'no_talk', 'low_demand_offer', 'create_space'],
  shutdown_public_full: ['public_exit', 'no_talk', 'ignore_crowd', 'low_demand_offer'],
  shutdown_public_unsafe: ['public_exit', 'protect_first', 'no_talk', 'ignore_crowd'],
  shutdown_car_building: ['no_talk', 'lower_voice', 'low_demand_offer', 'validate_feeling'],
  shutdown_car_full: ['car_exit', 'no_talk', 'low_demand_offer', 'create_space'],
  shutdown_car_unsafe: ['car_exit', 'protect_first', 'no_talk', 'reduce_demands'],

  // ANXIETY
  anxiety_home_building: ['breathing_together', 'preview_next', 'validate_feeling', 'grounding'],
  anxiety_home_full: ['validate_feeling', 'breathing_together', 'grounding', 'reduce_demands'],
  anxiety_home_unsafe: ['protect_first', 'validate_feeling', 'breathing_together', 'create_space'],
  anxiety_school_building: ['preview_next', 'request_support', 'breathing_together', 'quiet_space'],
  anxiety_school_full: ['quiet_space', 'request_support', 'validate_feeling', 'breathing_together'],
  anxiety_school_unsafe: ['protect_first', 'request_support', 'quiet_space', 'validate_feeling'],
  anxiety_public_building: ['lower_voice', 'preview_next', 'validate_feeling', 'breathing_together'],
  anxiety_public_full: ['safe_exit', 'validate_feeling', 'breathing_together', 'ignore_crowd'],
  anxiety_public_unsafe: ['public_exit', 'protect_first', 'validate_feeling', 'breathing_together'],
  anxiety_car_building: ['lower_voice', 'preview_next', 'breathing_together', 'validate_feeling'],
  anxiety_car_full: ['car_exit', 'validate_feeling', 'breathing_together', 'grounding'],
  anxiety_car_unsafe: ['car_exit', 'protect_first', 'validate_feeling', 'breathing_together'],

  // TRANSITION
  transition_home_building: ['transition_warning', 'transition_object', 'name_destination', 'offer_choice'],
  transition_home_full: ['reduce_demands', 'validate_feeling', 'transition_object', 'first_then'],
  transition_home_unsafe: ['protect_first', 'reduce_demands', 'create_space', 'no_lecture'],
  transition_school_building: ['transition_warning', 'request_support', 'name_destination', 'offer_choice'],
  transition_school_full: ['quiet_space', 'request_support', 'reduce_demands', 'validate_feeling'],
  transition_school_unsafe: ['protect_first', 'request_support', 'reduce_demands', 'no_lecture'],
  transition_public_building: ['lower_voice', 'transition_object', 'name_destination', 'offer_choice'],
  transition_public_full: ['safe_exit', 'reduce_demands', 'validate_feeling', 'ignore_crowd'],
  transition_public_unsafe: ['public_exit', 'protect_first', 'reduce_demands', 'no_lecture'],
  transition_car_building: ['preview_next', 'transition_object', 'name_destination', 'offer_choice'],
  transition_car_full: ['car_exit', 'reduce_demands', 'validate_feeling', 'narrate_calm'],
  transition_car_unsafe: ['car_exit', 'protect_first', 'reduce_demands', 'no_lecture'],

  // OTHER
  other_home_building: ['validate_feeling', 'reduce_demands', 'create_space', 'lower_voice'],
  other_home_full: ['create_space', 'reduce_demands', 'narrate_calm', 'validate_feeling'],
  other_home_unsafe: ['protect_first', 'create_space', 'reduce_demands', 'no_lecture'],
  other_school_building: ['request_support', 'quiet_space', 'validate_feeling', 'reduce_demands'],
  other_school_full: ['quiet_space', 'request_support', 'create_space', 'reduce_demands'],
  other_school_unsafe: ['protect_first', 'request_support', 'create_space', 'no_lecture'],
  other_public_building: ['lower_voice', 'validate_feeling', 'safe_exit', 'reduce_demands'],
  other_public_full: ['public_exit', 'ignore_crowd', 'create_space', 'reduce_demands'],
  other_public_unsafe: ['public_exit', 'protect_first', 'ignore_crowd', 'no_lecture'],
  other_car_building: ['lower_voice', 'validate_feeling', 'preview_next', 'reduce_demands'],
  other_car_full: ['car_exit', 'reduce_demands', 'narrate_calm', 'create_space'],
  other_car_unsafe: ['car_exit', 'protect_first', 'reduce_demands', 'no_lecture'],
};

// ─── Public API ───────────────────────────────────────────────────────────────

export function getStrategies(
  situation: Situation,
  location: Location,
  intensity: Intensity,
): { primary: Strategy; secondary: Strategy[] } {
  const key: MatrixKey = `${situation}_${location}_${intensity}`;
  const ids = MATRIX[key] ?? MATRIX[`other_home_building`]!;
  const [primaryId, ...secondaryIds] = ids;
  return {
    primary: STRATEGIES[primaryId],
    secondary: secondaryIds.map((id) => STRATEGIES[id]).filter(Boolean),
  };
}

export { STRATEGIES };
