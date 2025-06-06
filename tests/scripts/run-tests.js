/**
 * Script para ejecutar los tests de Playwright con la configuración adecuada
 * Este script se encarga de cargar las variables de entorno y ejecutar los tests
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Cargar variables de entorno para pruebas
function loadTestEnv() {
  // Intentar cargar .env.test si existe
  const testEnvPath = path.resolve(process.cwd(), '.env.test');
  
  if (fs.existsSync(testEnvPath)) {
    dotenv.config({ path: testEnvPath });
    console.log('✅ Variables de entorno de prueba cargadas desde .env.test');
    return true;
  } else {
    // Si no existe, intentar cargar desde .env.test.example
    const exampleEnvPath = path.resolve(process.cwd(), 'tests/.env.test.example');
    
    if (fs.existsSync(exampleEnvPath)) {
      dotenv.config({ path: exampleEnvPath });
      console.log('⚠️ Variables de entorno de prueba cargadas desde .env.test.example');
      console.log('⚠️ Se recomienda crear un archivo .env.test con valores reales');
      return true;
    } else {
      console.error('❌ No se encontró ningún archivo de variables de entorno para pruebas');
      return false;
    }
  }
}

// Verificar configuración
function checkConfig() {
  // Verificar que estamos en modo de prueba
  if (process.env.NODE_ENV !== 'test') {
    console.warn('⚠️ NODE_ENV no está configurado como "test"');
    process.env.NODE_ENV = 'test';
    console.log('✅ NODE_ENV configurado como "test"');
  }

  // Verificar que PWA está desactivado
  if (process.env.DISABLE_PWA !== 'true') {
    console.warn('⚠️ DISABLE_PWA no está configurado como "true"');
    process.env.DISABLE_PWA = 'true';
    console.log('✅ DISABLE_PWA configurado como "true"');
  }

  // Verificar que estamos en entorno de prueba
  if (process.env.IS_TESTING_ENVIRONMENT !== 'true') {
    console.warn('⚠️ IS_TESTING_ENVIRONMENT no está configurado como "true"');
    process.env.IS_TESTING_ENVIRONMENT = 'true';
    console.log('✅ IS_TESTING_ENVIRONMENT configurado como "true"');
  }
}

// Iniciar servidor de desarrollo para pruebas
function startDevServer() {
  const port = process.env.BASE_URL ? new URL(process.env.BASE_URL).port : 3001;
  console.log(`🚀 Iniciando servidor de desarrollo en el puerto ${port}...`);
  
  // Iniciar Next.js en segundo plano
  const server = spawn('npm', ['run', 'dev', '--', '-p', port], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
    shell: true
  });

  // Procesar la salida para detectar cuando el servidor está listo
  let serverReady = false;
  const serverReadyTimeout = setTimeout(() => {
    if (!serverReady) {
      console.log('⚠️ Tiempo de espera excedido para el inicio del servidor. Continuando de todos modos...');
      serverReady = true;
    }
  }, 10000); // Esperar hasta 10 segundos

  server.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`Server: ${output.trim()}`);
    
    // Detectar cuando el servidor está listo
    if (output.includes('ready') || output.includes('Ready') || output.includes('started server')) {
      console.log(`✅ Servidor de desarrollo iniciado correctamente en puerto ${port}`);
      clearTimeout(serverReadyTimeout);
      serverReady = true;
    }
  });

  server.stderr.on('data', (data) => {
    console.error(`Server error: ${data.toString().trim()}`);
  });

  // Esperar a que el servidor esté listo
  let checkCount = 0;
  const waitForServer = () => {
    if (serverReady) return;
    
    checkCount++;
    if (checkCount > 50) { // Máximo 10 segundos (200ms * 50)
      console.log('⚠️ Tiempo de espera excedido para el inicio del servidor. Continuando de todos modos...');
      return;
    }
    
    setTimeout(waitForServer, 200);
  };
  
  waitForServer();
  
  // Asegurarse de que el servidor se cierre cuando termine el script
  process.on('exit', () => {
    if (server && !server.killed) {
      console.log('🛑 Deteniendo servidor de desarrollo...');
      
      // En Windows, necesitamos usar taskkill para cerrar el proceso hijo y sus procesos hijos
      if (process.platform === 'win32') {
        try {
          execSync(`taskkill /pid ${server.pid} /T /F`);
        } catch (e) {
          // Ignorar errores al cerrar (puede ser que ya esté cerrado)
        }
      } else {
        // En Unix, podemos usar el grupo de proceso negativo para matar todo el árbol
        try {
          process.kill(-server.pid, 'SIGKILL');
        } catch (e) {
          // Ignorar errores
        }
      }
    }
  });
  
  return server;
}

// Verificar si el servidor ya está corriendo
function isPortInUse(port) {
  try {
    // Intentar conectarse al puerto para ver si está en uso
    const netServer = require('net').createServer();
    return new Promise((resolve) => {
      netServer.once('error', () => {
        // El puerto está en uso
        resolve(true);
      });
      netServer.once('listening', () => {
        // El puerto está libre, cerramos y devolvemos false
        netServer.close();
        resolve(false);
      });
      netServer.listen(port);
    });
  } catch (e) {
    return Promise.resolve(false);
  }
}

// Ejecutar los tests
async function runTests() {
  try {
    // Cargar variables de entorno
    const envLoaded = loadTestEnv();
    if (!envLoaded) {
      console.error('❌ No se pudieron cargar las variables de entorno para pruebas');
      process.exit(1);
    }

    // Verificar configuración
    checkConfig();

    // Verificar si se debe omitir el inicio del servidor (usando el flag --no-server)
    const skipServerStart = process.argv.includes('--no-server');
    
    // Obtener el puerto del servidor
    const port = process.env.BASE_URL ? new URL(process.env.BASE_URL).port : 3001;
    
    // Comprobar si el puerto ya está en uso
    const portInUse = await isPortInUse(port);
    
    // Iniciar servidor si es necesario
    let server;
    if (!skipServerStart && !portInUse) {
      server = startDevServer();
      
      // Dar tiempo para que el servidor inicie completamente
      console.log(`⏳ Esperando 5 segundos para que el servidor termine de iniciar...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else if (portInUse) {
      console.log(`ℹ️ El puerto ${port} ya está en uso. Se asume que el servidor ya está en ejecución.`);
    } else {
      console.log('ℹ️ Omitiendo inicio del servidor (--no-server)');
    }

    console.log('🚀 Ejecutando tests de Playwright...');

    // Obtener argumentos de línea de comandos (omitiendo node, el nombre del script y --no-server)
    const args = process.argv.slice(2).filter(arg => arg !== '--no-server');

    // Construir el comando para ejecutar Playwright
    const command = `npx playwright test ${args.join(' ')}`;

    // Ejecutar el comando
    execSync(command, { stdio: 'inherit' });

    console.log('✅ Tests de Playwright ejecutados correctamente');
    
    return 0;
  } catch (error) {
    // No es necesario mostrar el error aquí, ya que execSync con stdio: 'inherit' lo mostrará
    return 1;
  }
}

// Ejecutar los tests y salir con el código adecuado
runTests().then(exitCode => process.exit(exitCode));