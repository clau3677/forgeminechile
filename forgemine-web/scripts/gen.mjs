import bcrypt from "bcryptjs";
const hash = await bcrypt.hash("Admin2024!", 10);
console.log("ADMIN_PASSWORD_HASH=" + hash);
