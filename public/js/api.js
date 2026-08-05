export async function getAiHealth() {
  const response = await fetch('/api/health');
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Could not reach Lyric Studio.');
  }

  return data;
}

export async function requestAssistant(payload) {
  const response = await fetch('/api/assist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'The assistant could not complete that request.');
  }

  return data;
}

function parseSseEvent(rawEvent) {
  const dataLine = rawEvent.split('\n').find((line) => line.startsWith('data: '));

  if (!dataLine) {
    return null;
  }

  return JSON.parse(dataLine.slice(6));
}

export async function streamAssistant(payload, { onDelta = null } = {}) {
  const response = await fetch('/api/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'The assistant could not complete that request.');
  }

  if (!response.body) {
    throw new Error('Streaming is not supported in this browser.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let model = null;

  const handleEvent = (rawEvent) => {
    const data = parseSseEvent(rawEvent);

    if (!data) {
      return;
    }

    if (data.delta) {
      onDelta?.(data.delta);
    }

    if (data.done) {
      model = data.model;
    }

    if (data.error) {
      throw new Error(data.error);
    }
  };

  for (;;) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const rawEvent of events) {
      handleEvent(rawEvent);
    }
  }

  if (buffer.trim()) {
    handleEvent(buffer);
  }

  return model;
}
