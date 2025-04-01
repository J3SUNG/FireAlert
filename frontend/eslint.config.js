import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ["./tsconfig.app.json", "./tsconfig.node.json"],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // React 관련 규칙
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "off",
      // 추가: react-hooks/exhaustive-deps 규칙 비활성화 (의존성 배열 경고 제거)
      "react-hooks/exhaustive-deps": "off",
      
      // 자주 방해되는 TypeScript 규칙 비활성화
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off", 
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/restrict-plus-operands": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off", // || 대신 ?? 사용 권장 규칙 비활성화
      
      // TypeScript 규칙 조정: 추가 규칙 비활성화
      "@typescript-eslint/prefer-optional-chain": "off", // 옵셔널 체이닝 강제 규칙 비활성화
      "@typescript-eslint/no-unnecessary-type-assertion": "off", // 불필요한 타입 단언 경고 비활성화
      
      // 개발에 유용할 수 있는 규칙 재정의
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_", 
        "varsIgnorePattern": "^_", 
        "caughtErrorsIgnorePattern": "^_" 
      }],  // 사용되지 않는 변수 경고 (_로 시작하는 변수 제외)
      "@typescript-eslint/prefer-as-const": "warn",
      
      // 콘솔 로그는 개발 중에 유용하므로 허용
      "no-console": "off",
      
      // 기타 일반적인 규칙 조정
      "no-unused-vars": "off", // TypeScript 버전이 대신 처리
    },
  }
);
