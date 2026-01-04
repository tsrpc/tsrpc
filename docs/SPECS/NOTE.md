NOTE
---

## 公共 package.json
```json
"exports": {
    ".": {
        "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
        },
        "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
        }
    }
},
"main": "./dist/index.cjs",
"module": "./dist/index.js",
"types": "./dist/index.d.ts",
"files": [
    "dist"
],
```