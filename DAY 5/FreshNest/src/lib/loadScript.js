const scripts = new Map();

export function loadScript(url) {
  if (!scripts.has(url)) {
    const pending = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => {
        script.remove();
        reject(new Error('The service could not load. Try again.'));
      };
      document.head.appendChild(script);
    });
    scripts.set(url, pending);
    pending.catch(() => scripts.delete(url));
  }
  return scripts.get(url);
}
