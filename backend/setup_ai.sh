#!/bin/bash
# Setup script for AI-powered content management services

echo "Setting up AI-powered content management services..."

# Check Python version
python_version=$(python --version 2>&1 | awk '{print $2}')
echo "Python version: $python_version"

# Install system dependencies (Ubuntu/Debian)
echo "Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y \
    ffmpeg \
    libsndfile1 \
    portaudio19-dev \
    libportaudio2 \
    libportaudiocpp0 \
    ffmpeg libav-tools \
    libavcodec-extra

# Download spaCy model
echo "Downloading spaCy English model..."
python -m spacy download en_core_web_sm

# Download NLTK data
echo "Downloading NLTK data..."
python -c "import nltk; nltk.download('punkt'); nltk.download('averaged_perceptron_tagger'); nltk.download('maxent_ne_chunker'); nltk.download('words'); nltk.download('chunk')"

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Test Whisper installation
echo "Testing Whisper installation..."
python -c "import whisper; print('Whisper installed successfully')"

# Test spaCy installation
echo "Testing spaCy installation..."
python -c "import spacy; print('spaCy installed successfully')"

echo "Setup complete! You can now use the AI-powered content management services."
echo ""
echo "Note: The first time you run transcription, Whisper will download the base model (~150MB)."
echo "This is a one-time download and will be cached for future use."
