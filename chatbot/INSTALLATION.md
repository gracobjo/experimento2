# Chatbot Installation Guide

## Basic Installation

Install the core dependencies:

```bash
pip install -r requirements.txt
```

## Optional AI Services

For enhanced AI capabilities, install optional cloud services:

```bash
pip install -r requirements-optional.txt
```

### What each optional service provides:

- **OpenAI**: Access to GPT models for advanced responses
- **Anthropic**: Access to Claude models for AI assistance  
- **Cohere**: Alternative AI model for text generation
- **Sentence Transformers**: Semantic similarity for better response matching

### Installation Notes

- The chatbot works perfectly without these optional dependencies
- If not installed, the chatbot will use local NLP processing
- You can install individual packages if you only want specific services:

```bash
# Install only OpenAI
pip install openai

# Install only Anthropic  
pip install anthropic

# Install only Cohere
pip install cohere

# Install only sentence transformers
pip install sentence-transformers
```

## Environment Variables

Create a `.env` file with your API keys (only needed if using cloud services):

```env
# Required for basic functionality
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Optional - only needed if using cloud AI services
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
COHERE_API_KEY=your_cohere_key_here
HF_API_TOKEN=your_huggingface_token_here
```

## Running the Chatbot

```bash
python main_improved_fixed.py
```

The chatbot will automatically detect which services are available and adjust its capabilities accordingly.
