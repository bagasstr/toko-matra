const https = require('https');
const http = require('http');
const config = require('./cronjob.config.js');

// Fungsi untuk melakukan ping ke endpoint health dengan retry
async function pingHealthEndpoint(attempt = 1) {
  const url = new URL(`${config.appUrl}${config.healthEndpoint}`);
  const protocol = url.protocol === 'https:' ? https : http;
  
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname,
    method: 'GET',
    timeout: config.timeoutMs,
    headers: {
      'User-Agent': config.userAgent
    }
  };

  return new Promise((resolve, reject) => {
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            console.log(`✅ [${timestamp}] Health check successful (attempt ${attempt}):`, response);
            resolve({ success: true, response, statusCode: res.statusCode });
          } catch (error) {
            console.log(`✅ [${timestamp}] Health check successful (attempt ${attempt}, status: ${res.statusCode})`);
            resolve({ success: true, statusCode: res.statusCode });
          }
        } else {
          console.error(`❌ [${timestamp}] Health check failed (attempt ${attempt}) with status: ${res.statusCode}`);
          console.error('Response:', data);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
      console.error(`❌ [${timestamp}] Health check error (attempt ${attempt}):`, error.message);
      reject(error);
    });

    req.on('timeout', () => {
      const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
      console.error(`❌ [${timestamp}] Health check timeout (attempt ${attempt})`);
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Fungsi untuk melakukan ping dengan retry
async function pingWithRetry() {
  let lastError;
  
  for (let attempt = 1; attempt <= config.retry.maxAttempts; attempt++) {
    try {
      const result = await pingHealthEndpoint(attempt);
      return result;
    } catch (error) {
      lastError = error;
      
      if (attempt < config.retry.maxAttempts && config.retry.enabled) {
        console.log(`⏳ Retrying in ${config.retry.delayMs / 1000} seconds... (attempt ${attempt + 1}/${config.retry.maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, config.retry.delayMs));
      }
    }
  }
  
  // Jika semua retry gagal
  const timestamp = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
  console.error(`💥 [${timestamp}] All health check attempts failed. Last error:`, lastError.message);
  throw lastError;
}

// Fungsi utama
async function main() {
  console.log(`🚀 Starting health check cron job...`);
  console.log(`📍 Target URL: ${config.appUrl}${config.healthEndpoint}`);
  console.log(`⏰ Interval: ${config.intervalMinutes} minutes`);
  console.log(`⏱️  Timeout: ${config.timeoutMs}ms`);
  console.log(`🔄 Retry enabled: ${config.retry.enabled}`);
  console.log(`⏰ Current time: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })}`);
  console.log('─'.repeat(60));
  
  // Jalankan ping pertama
  try {
    await pingWithRetry();
  } catch (error) {
    console.error('Initial health check failed:', error.message);
  }
  
  // Set interval untuk ping
  const INTERVAL_MS = config.intervalMinutes * 60 * 1000;
  
  setInterval(async () => {
    console.log('─'.repeat(60));
    try {
      await pingWithRetry();
    } catch (error) {
      console.error('Scheduled health check failed:', error.message);
    }
  }, INTERVAL_MS);
  
  console.log(`⏰ Next ping scheduled in ${INTERVAL_MS / 1000 / 60} minutes`);
}

// Jalankan jika file ini dijalankan langsung
if (require.main === module) {
  main().catch(error => {
    console.error('Cron job failed to start:', error);
    process.exit(1);
  });
}

module.exports = { pingHealthEndpoint, pingWithRetry, main }; 