import { ValidationError } from '../utils/errors.js';

const VALID_TOOLS = ['rewrite', 'imagery', 'metaphor', 'ideas', 'titles', 'polish', 'rhyme', 'parody'];

export function validateAssistRequest(req, _res, next) {
  const {
    tool,
    text = '',
    mood = '',
    anchor = '',
    topic = '',
    words = '',
  } = req.body ?? {};

  if (!tool) {
    return next(new ValidationError('A tool name is required.'));
  }

  if (!VALID_TOOLS.includes(tool)) {
    return next(new ValidationError('Unsupported assistant tool.'));
  }

  const normalizedText = text.trim();
  const normalizedMood = mood.trim();
  const normalizedAnchor = anchor.trim();

  if (!['ideas', 'parody'].includes(tool) && !normalizedText) {
    return next(new ValidationError('A tool name and selected text are required.'));
  }

  if (['titles', 'polish'].includes(tool) && normalizedText.length < 10) {
    return next(new ValidationError('Add at least a few lines to the draft before running this tool.'));
  }

  if (tool === 'parody' && normalizedText.length < 10 && !topic.trim() && !words.trim()) {
    return next(new ValidationError(
      'Give the parody a subject, or at least a word or two to weave in.',
    ));
  }

  if (tool === 'ideas' && !normalizedText && !normalizedMood && !normalizedAnchor) {
    return next(new ValidationError(
      'Add a topic, mood, or anchor detail first so the assistant has something to build from.',
    ));
  }

  next();
}
