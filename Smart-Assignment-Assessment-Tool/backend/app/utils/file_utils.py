def get_language_from_extension(filename):
    extension = filename.split('.')[-1]
    language_map = {
        'py': 'python',
        'js': 'javascript',
        'java': 'java',
        'cs': 'csharp',
        'cpp': 'cpp',
        'h': 'cpp',
        'html': 'html',
        'css': 'css',
        'md': 'markdown'
    }
    return language_map.get(extension, 'unknown')
