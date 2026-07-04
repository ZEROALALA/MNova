async function getModels() {
  const res = await fetch('https://openrouter.ai/api/v1/models');
  const data = await res.json();
  const freeModels = data.data.filter(m => m.id.endsWith(':free')).map(m => m.id);
  console.log('Total free models:', freeModels.length);
  
  const googleFree = freeModels.filter(id => id.includes('google'));
  console.log('Google Free:', googleFree);
  
  const llamaFree = freeModels.filter(id => id.includes('llama'));
  console.log('Llama Free:', llamaFree);
}
getModels();
