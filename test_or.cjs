const OPENROUTER_API_KEY = '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';
const MODEL = 'meta-llama/llama-3.2-3b-instruct:free';

async function test() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: 'hello' }]
      })
    });
    
    if (!response.ok) {
      console.log('Error status:', response.status);
      console.log('Error body:', await response.text());
      return;
    }
    const data = await response.json();
    console.log('Success:', data.choices[0].message.content);
  } catch (e) {
    console.error('Fetch error:', e);
  }
}
test();
