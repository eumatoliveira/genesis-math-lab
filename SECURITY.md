# Security & Scientific Integrity Policy — GENESIS

## Reporting a Vulnerability
If you discover a security vulnerability (e.g., path traversal, XSS, unsafe deserialization, or dependency issue), please report it privately via GitHub Security Advisories or contact the maintainer (`@eumatoliveira`). Do not open public issues for unpatched security bugs.

## Built-in Safeguards
- **Input & Path Validation**: FastAPI endpoints validate `problem_id`, `oeis_id`, and report filenames with strict allowlists and `.resolve().is_relative_to(...)` path confinement.
- **Numerical & Memory Safety**: Frontend WebGL/simulation engines sanitize `NaN`/`Infinity` and enforce loop bounds to prevent browser tab OOM/hangs.
- **HTTP Security Headers**: Production Vercel deployments enforce `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and restrictive `Permissions-Policy`.
- **Epistemological Integrity**: Open conjectures must never be labeled as solved, and Lean 4 skeletons are strictly forbidden from using `sorry` or `admit`.
