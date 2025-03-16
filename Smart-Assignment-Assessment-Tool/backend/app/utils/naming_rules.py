import re

NAMING_RULES = {
    "python": {
        "functions": r'^[a-z_][a-z0-9_]*$',
        "classes": r'^[A-Z][a-zA-Z0-9]*$',
        "variables": r'^[a-z_][a-z0-9_]*$'
    },
    "javascript": {
        "functions": r'^[a-z][a-zA-Z0-9]*$',
        "variables": r'^[a-z][a-zA-Z0-9]*$',
        "classes": r'^[A-Z][a-zA-Z0-9]*$'
    }
}

def validate_naming(identifier, lang, category):
    pattern = NAMING_RULES.get(lang, {}).get(category, None)
    return bool(re.match(pattern, identifier)) if pattern else True
