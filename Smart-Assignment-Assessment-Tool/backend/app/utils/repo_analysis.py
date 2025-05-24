import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env
GEMINI_API_KEY_CODE = os.getenv("GEMINI_API_KEY_CODE")

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY_CODE)

def check_file_naming_conventions(RepoURL):
    """
    Use Gemini API to check file naming conventions across various programming languages.
    Returns a JSON object with the analysis results.
    """
    prompt = f"""
    You are an AI code analyzer examining GitHub repositories. Analyze the repository at {RepoURL} and check if all files follow standard naming conventions for their respective programming languages or file types.

    Apply these language-specific naming conventions:
    
    1. Python:
       - Module files: lowercase with underscores (snake_case), e.g., data_processor.py
       - Class files: lowercase with underscores, e.g., user_model.py
       - Test files: test_*.py or *_test.py
    
    2. JavaScript/TypeScript:
       - React components: PascalCase, e.g., UserProfile.jsx, UserProfile.tsx
       - Regular modules: camelCase, e.g., dataUtils.js, apiClient.ts
       - Config files: lowercase with hyphens, e.g., webpack-config.js
       - Test files: *.test.js, *.spec.js
    
    3. Java:
       - Class files: PascalCase matching class name, e.g., UserService.java
       - Package directories: lowercase, e.g., com/example/project
    
    4. C/C++:
       - Source files: snake_case, e.g., string_utils.c, memory_manager.cpp
       - Header files: snake_case, e.g., string_utils.h, memory_manager.hpp
    
    5. PHP:
       - Class files: PascalCase matching class name, e.g., UserModel.php
       - Regular files: lowercase with hyphens, e.g., admin-functions.php
    
    6. General rules across all languages:
       - No spaces in file names
       - Config files: lowercase with appropriate separators (_, -, .)
       - Documentation files: uppercase for main docs (README.md, CONTRIBUTING.md)
       - Hidden files (starting with '.') should only be system or config files
       - Asset files (images, fonts, etc.): lowercase with hyphens, e.g., hero-image.png

    Exceptions:
    - Ignore generated files, build directories, and dependency directories like node_modules, .venv, dist, build, etc.
    - Respect framework-specific conventions (e.g., Next.js, Django, Rails)
    - Standard names like README.md, LICENSE, Dockerfile are acceptable
    
    IMPORTANT: Return ONLY a valid JSON object with no additional text, markdown, or formatting, exactly like this:
    {{"status": "Yes"}} // If all files follow appropriate naming conventions
    OR
    {{"status": "No", "invalid_files": [{{"file_name": "filename", "path": "relative_path", "reason": "reason for violation"}}]}} // If errors found
    """

    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    
    try:
        # Extract the JSON content from the response
        response_text = response.text
        # Clean up the response text to ensure it's valid JSON
        # Remove any markdown code block formatting if present
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        # Remove any comments that could break JSON parsing
        lines = response_text.split('\n')
        clean_lines = [line.split('//')[0].strip() for line in lines]
        clean_text = ' '.join(clean_lines)
            
        # Parse the cleaned text as JSON
        result = json.loads(clean_text)
        return result
    except Exception as e:
        return {
            "error": f"Failed to parse response: {str(e)}", 
            "raw_response": response.text
        }

def check_code_naming_conventions(RepoURL):
    """
    Use Gemini API to check code element naming conventions across various programming languages.
    Analyzes variable names, function declarations, class names, etc.
    Returns a JSON object with the analysis results.
    """
    prompt = f"""
    You are an expert code reviewer analyzing a GitHub repository at {RepoURL}. Your analysis must be based SOLELY on the actual code found in this repository - do not make assumptions or include examples from other projects. Examine all code elements including:

    1. Variable declarations
    2. Function/method declarations
    3. Class declarations
    4. Constants
    5. Parameter names
    6. Interface/abstract class names
    7. Enum declarations

    Apply these language-specific naming conventions:

    [Keep all the existing language convention details exactly as in the original prompt]

    For any language, check if:
    - Names are descriptive and meaningful
    - No single-letter variables (except in limited contexts like loop counters)
    - No unnecessarily abbreviated names
    - No Hungarian notation unless appropriate for framework
    - Function names reflect actions (verbs)
    - Class names reflect entities (nouns)
    - Boolean variables have prefixes like 'is', 'has', 'can', etc.

    STRICT REQUIREMENTS:
    1. All findings must be verified against the actual repository content
    2. File paths must be exact and correct relative to the repository root
    3. Line numbers must be precise
    4. Only report issues you can confirm exist in the provided repository
    5. Never include hypothetical examples or general advice

    Exclude from analysis:
    - Generated code
    - Third-party libraries
    - Known framework conventions that intentionally differ
    - Build files and configuration
    - Test fixture data
    - Any files not actually present in the repository

    IMPORTANT: Return ONLY a valid JSON object with no additional text, markdown, or formatting, following this exact structure:
    {{"status": "Yes"}} // If all code elements follow appropriate naming conventions
    OR
    {{"status": "No", "issues": [
        {{
            "file_path": "exact/correct/path/from/repo/root/file.ext", // MUST be accurate
            "line_number": 42, // MUST be precise
            "element_type": "variable|function|class|etc", // MUST match actual element
            "element_name": "badlyNamedVariable", // MUST be the exact name found
            "suggested_name": "properly_named_variable", // MUST follow conventions
            "reason": "Concise explanation based ONLY on repository content"
        }}
    ]}}

    DO NOT include any markdown formatting, additional explanations, or text outside the JSON object. The response must be parseable as pure JSON.
    """

    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    
    try:
        # Extract the JSON content from the response
        response_text = response.text
        
        # Clean up the response text to ensure it's valid JSON
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        # Remove any comments that could break JSON parsing
        lines = response_text.split('\n')
        clean_lines = [line.split('//')[0].strip() for line in lines]
        clean_text = ' '.join(clean_lines)
            
        # Parse the cleaned text as JSON
        result = json.loads(clean_text)
        return result
    except Exception as e:
        return {
            "error": f"Failed to parse response: {str(e)}", 
            "raw_response": response.text
        }

def check_code_comments_accuracy(RepoURL):
    """
    Use Gemini API to check if code comments accurately match and describe the code content.
    Analyzes comment relevance, accuracy, and completeness across all files in a repository.
    Returns a JSON object with the analysis results.
    """
    prompt = f"""
    You are an expert code reviewer analyzing a GitHub repository at {RepoURL}. Examine the relationship between comments and code to ensure comments are accurate, relevant, and helpful. Focus on:
    
    1. Function/method docstrings
    2. Class documentation
    3. Inline comments
    4. Block comments
    5. Module/file header comments
    
    For each code file, analyze if:
    
    - Comments accurately describe what the code actually does (not what it's supposed to do)
    - Function/method docstrings correctly document parameters, return values, and exceptions
    - Comments explain "why" for complex logic, not just restate the code
    - Comments are present for non-obvious code sections
    - Outdated comments that no longer match the current code implementation
    - Comments that contradict the actual behavior of the code
    - Missing documentation for public APIs, classes, or functions
    - Excessive commenting of self-explanatory code
    
    Exclude from analysis:
    - Generated code
    - Third-party libraries
    - Build files and configuration
    - Test fixture data
    - TODO comments (these are meant to be temporary)
    
    IMPORTANT: Return ONLY a valid JSON object with no additional text, markdown, or formatting, following this exact structure:
    {{"status": "Pass"}} // If all code comments match their code content appropriately
    OR
    {{"status": "Fail", "issues": [
        {{
            "file_path": "path/to/file.ext",
            "line_number": 42,
            "comment_type": "docstring|inline|block|header",
            "actual_comment": "The existing comment text",
            "issue": "Concise explanation of the mismatch or problem",
            "suggestion": "Proposed improved comment that would accurately describe the code"
        }}
    ]}}
    
    Analyze the content and relationships deeply, checking if comments:
    1. Make false claims about what the code does
    2. Miss critical details about edge cases or assumptions
    3. Describe functionality that was changed or removed
    4. Document parameters that don't exist or miss parameters that do exist
    5. Claim return values different from what the code actually returns
    6. Mention error handling that doesn't match implementation
    
    For docstrings specifically, validate that they follow the appropriate format for the language
    (e.g., PEP 257 for Python, JSDoc for JavaScript) and contain all required sections.
    """

    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    
    try:
        # Extract the JSON content from the response
        response_text = response.text
        
        # Clean up the response text to ensure it's valid JSON
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        # Remove any comments that could break JSON parsing
        lines = response_text.split('\n')
        clean_lines = [line.split('//')[0].strip() for line in lines]
        clean_text = ' '.join(clean_lines)
            
        # Parse the cleaned text as JSON
        result = json.loads(clean_text)
        return result
    except Exception as e:
        return {
            "error": f"Failed to parse response: {str(e)}", 
            "raw_response": response.text
        }