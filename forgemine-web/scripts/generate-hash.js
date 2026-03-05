import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("\nError: debes proporcionar una contrasena.");
  console.error("Uso:   node scripts/generate-hash.js TuContraseña\n");
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log("\nHash generado exitosamente. Agrega esto a tu archivo .env:");
  console.log("-------------------------------------------------------");
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log("-------------------------------------------------------\n");
});
