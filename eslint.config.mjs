import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // تخفيف قواعد TypeScript الصارمة
      "@typescript-eslint/no-explicit-any": "off", // إيقاف تماماً
      "@typescript-eslint/no-unused-vars": "off", // إيقاف تماماً
      
      // تخفيف قواعد React Hooks
      "react-hooks/exhaustive-deps": "warn", // warning فقط
      
      // إيقاف باقي القواعد المزعجة
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    }
  }
];

export default eslintConfig;