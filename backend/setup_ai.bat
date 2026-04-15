@echo off
REM Setup script for AI-powered content management services (Windows)

echo Setting up AI-powered content management services...

REM Check Python version
python --version

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Download spaCy model
echo Downloading spaCy English model...
python -m spacy download en_core_web_sm

REM Download NLTK data
echo Downloading NLTK data...
python -c "import nltk; nltk.download('punkt'); nltk.download('averaged_perceptron_tagger'); nltk.download('maxent_ne_chunker'); nltk.download('words'); nltk.download('chunk')"

REM Test Whisper installation
echo Testing Whisper installation...
python -c "import whisper; print('Whisper installed successfully')"

REM Test spaCy installation
echo Testing spaCy installation...
python -c "import spacy; print('spaCy installed successfully')"

echo.
echo Setup complete! You can now use the AI-powered content management services.
echo.
echo Note: The first time you run transcription, Whisper will download the base model (~150MB).
echo This is a one-time download and will be cached for future use.
echo.
echo IMPORTANT: You need to install ffmpeg separately for audio processing.
echo Download from: https://ffmpeg.org/download.html or use chocolatey: choco install ffmpeg
pause
