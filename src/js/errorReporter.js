try {
  let errorCount = 0;
  const reportedErrors = new Set();
  
  const reportError = (errorData) => {
    // Throttle: Max 5 reports per session
    if (errorCount >= 5) return;
    
    // Dedupe identical messages
    const errorKey = `${errorData.message}|${errorData.line}|${errorData.col}`;
    if (reportedErrors.has(errorKey)) return;
    reportedErrors.add(errorKey);
    
    errorCount++;
    
    fetch('/api/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData),
      keepalive: true
    }).catch(e => { /* Ignore fetch errors so reporter never crashes page */ });
  };

  window.addEventListener('error', (event) => {
    reportError({
      message: event.message || String(event.error),
      stack: event.error?.stack || '',
      source: event.filename || '',
      line: event.lineno || null,
      col: event.colno || null,
      url: location.href,
      ua: navigator.userAgent,
      ts: new Date().toISOString(),
      build: (typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : 'unknown')
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    reportError({
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack || '',
      source: 'Promise Rejection',
      line: null,
      col: null,
      url: location.href,
      ua: navigator.userAgent,
      ts: new Date().toISOString(),
      build: (typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : 'unknown')
    });
  });
} catch (e) {
  // Silent fail if reporter itself breaks
}
