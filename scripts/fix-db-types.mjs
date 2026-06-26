import fs from "fs";

let s = fs.readFileSync("src/types/database.ts", "utf8");
s = s
  .replaceAll("faculty_codes", "counselor_codes")
  .replaceAll("faculty_weekly_availability", "counselor_weekly_availability")
  .replaceAll("faculty_id", "counselor_id")
  .replaceAll('"faculty"', '"counselor"')
  .replaceAll("'faculty'", "'counselor'");
fs.writeFileSync("src/types/database.ts", s);
console.log("done");
