# Proposed Refactor Plan — Split `app.py` into modules

Goals:
- Make code testable and maintainable
- Separate concerns (config, models, services, routes)
- Keep backward compatibility during migration

Phases:
1. Create package skeleton (done)
   - `app_package/config.py`, `models.py`, `services/`, `routes/`
2. Move models and db setup into `app_package/models.py` (done)
3. Extract Excel logic into `app_package/services/excel.py` (stubbed)
4. Create API blueprints under `app_package/routes/` and migrate endpoints incrementally
5. Replace monolithic `app.py` with `run.py` using `create_app()` (done)
6. Add tests focused on `services/excel.py` and `routes` behavior
7. Clean up legacy code and remove duplicates

Recommended structure:

```
deneme/
├── app_package/
│   ├── __init__.py
│   ├── config.py
   ├── models.py
   ├── routes/
   │   └── api.py
   └── services/
       └── excel.py
├── run.py
└── app.py (keep as backup during migration)
```

Acceptance criteria:
- App runs via `python run.py` and serves `/api/hello`
- Unit tests for `xlookup` and a sample formula pass
- No behavior regressions for core flows
