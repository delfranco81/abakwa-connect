# Everyday Connect Database

This folder contains the complete database architecture for Everyday Connect.

Rules:

- Every SQL file must be rerunnable.
- Always use IF NOT EXISTS where possible.
- Never modify an old migration after it has been applied in production.
- New changes go into a new numbered migration.
- Every migration should represent one logical feature/module.

Migration Order:

001 Core
002 Identity
003 Business
004 Departments
005 Positions
006 Employees
...