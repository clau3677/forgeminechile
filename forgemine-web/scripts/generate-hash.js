// Genera el hash bcrypt para tu contrasena de administrador.
// Uso: node scripts/generate-hash.js TuContraseñaSegura
//
// Luego copia el resultado en tu archivo .env:
//   ADMIN_EMAIL=admin@tuempresa.com
//   ADMIN_PASSWORD_HASH=$2b$10$...

const bcrypt = require("bcryptjs");

const password = process.argv[2];

if (!password) {
  console.error("\nError: debes proporcionar una contrasena.");
  console.error("Uso:   node scripts/generate-hash.js TuContraseñaSegura\n");
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log("\n✅ Hash generado exitosamente. Agrega esto a tu archivo .env:");
  console.log("─".repeat(55));
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log("─".repeat(55));
  console.log("\nGuarda ese valor en tu .env y NO compartas tu contrasena.\n");
});
